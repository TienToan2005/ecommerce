package com.tientoan21.service;

import com.tientoan21.dto.request.UserRequest;
import com.tientoan21.dto.response.UserResponse;
import com.tientoan21.entity.User;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.UserMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tientoan21.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;

    public UserResponse createUser(UserRequest request){
        if(userRepository.existsByEmail(request.email())){
            throw new AppException(ErrorCode.USER_EXISTS);
        }

        User user = userMapper.toUser(request);

        User saved = userRepository.save(user);
        return userMapper.toUserResponse(saved);
    }
    public Page<UserResponse> getAllUser(Pageable pageable){
        Page<User> userList = userRepository.findAll(pageable);

        return userList.map(userMapper::toUserResponse);
    }
    public UserResponse getUserById(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }
    @Transactional
    public UserResponse updateUser(Long id,  UserRequest request){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUserFromRequest(request,user);

        User saved = userRepository.save(user);
        return userMapper.toUserResponse(saved);
    }
    @Transactional
    public void deleteUser(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    public UserResponse getMyProfile(){
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
