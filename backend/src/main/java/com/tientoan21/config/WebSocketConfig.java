package com.tientoan21.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.Set;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    /**
     * Danh sách đích được phép SUBSCRIBE, so khớp chính xác (không theo tiền tố).
     * Simple broker so khớp theo mẫu AntPath, nên "/topic/**" cũng nhận được tin admin;
     * vì vậy mọi đích không có trong danh sách (kể cả đích chứa ký tự mẫu) đều bị từ chối.
     */
    private static final Set<String> ADMIN_DESTINATIONS = Set.of("/topic/admin-notifications");

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // khớp CorsConfig, thay cho "*"
                .setAllowedOriginPatterns("http://localhost", "http://localhost:*", "http://127.0.0.1", "http://127.0.0.1:*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) {
                    return message;
                }
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    Principal user = authenticate(accessor.getFirstNativeHeader("Authorization"));
                    if (user == null) {
                        // Hiện chỉ trang admin dùng WebSocket: không cho kết nối ẩn danh
                        throw new MessagingException("Cần đăng nhập để kết nối WebSocket");
                    }
                    accessor.setUser(user);
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    if (destination == null || !ADMIN_DESTINATIONS.contains(destination)) {
                        throw new MessagingException("Không được đăng ký đích " + destination);
                    }
                    if (!isAdmin(accessor.getUser())) {
                        throw new MessagingException("Chỉ admin được nghe " + destination);
                    }
                }
                return message;
            }
        });
    }

    /** Xác thực JWT từ header STOMP CONNECT; trả về null (khách vãng lai) nếu không có hoặc sai token. */
    private Principal authenticate(String header) {
        if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return null;
        }
        String token = header.substring(7);
        try {
            UserDetail userDetail = (UserDetail) userDetailsService.loadUserByUsername(jwtUtils.getUsernameFromToken(token));
            if (!jwtUtils.isValidToken(token, userDetail) || !userDetail.isAccountNonLocked()) {
                return null;
            }
            return new UsernamePasswordAuthenticationToken(userDetail, null, userDetail.getAuthorities());
        } catch (Exception e) {
            log.debug("WebSocket token không hợp lệ: {}", e.getMessage());
            return null;
        }
    }

    private boolean isAdmin(Principal principal) {
        return principal instanceof UsernamePasswordAuthenticationToken auth
                && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
