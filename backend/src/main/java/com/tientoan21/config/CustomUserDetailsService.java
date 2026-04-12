package com.tientoan21.config;

import com.tientoan21.entity.User;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.tientoan21.repository.UserRepository;

@RequiredArgsConstructor
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userReponsitory;

    @Override
    public UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        User user = userReponsitory.findUsersByEmailOrPhoneNumber(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with: " + username));

        return new UserDetail(
                username,
                user.getPassword(),
                user.getRole(),
                user.getEmail(),
                user.getPhoneNumber()

        );
    }
}
