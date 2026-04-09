package service;

import dto.request.UserRequest;
import dto.response.UserResponse;
import entity.User;
import enums.ErrorCode;
import exception.AppException;
import lombok.RequiredArgsConstructor;
import mapper.UserMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;

    public UserResponse createUser(UserRequest request){
        User user = userRepository.findUsersByEmailOrPhoneNumber(request.email(),request.phoneNumber())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        user.setPassword(request.password());
        user.setFullName(request.fullName());
        user.setBirthday(request.birthday());
        user.setRole(request.role());
        user.setAddress(request.address());
        user.setOrders(request.orderList());
        user.setCart(request.cart());

        User saved = userRepository.save(user);
        return userMapper.toUserResponse(saved);
    }
    public List<UserResponse> getAllUser(){
        List<User> userList = userRepository.findAll();

        return userList.stream()
                .map(userMapper::toUserResponse)
                .toList();
    }
    public UserResponse getUserById(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }
    public UserResponse updateUser(Long id,  UserRequest request){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUserFromRequest(request,user);

        User saved = userRepository.save(user);
        return userMapper.toUserResponse(saved);
    }
    public void deleteUser(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userRepository.delete(user);

    }
    public UserResponse getProfileAndOderHistory(){
        User user = getcurrentUser();

        return userMapper.toUserResponse(user);
    }

    public User getcurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return userRepository.findUsersByEmailOrPhoneNumber(username,username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
