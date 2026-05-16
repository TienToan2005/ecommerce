package com.tientoan21.service;

import com.tientoan21.dto.request.UpdateProfileRequest;
import com.tientoan21.dto.response.UserResponse;
import com.tientoan21.entity.User;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.UserMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.tientoan21.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public UserResponse getMyProfile(){
        User user = getcurrentUser();
        return userMapper.toUserResponse(user);
    }
    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request, MultipartFile file){
        User user = getcurrentUser();

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        user.setBirthday(request.birthday());

        if(file != null && !file.isEmpty()){
            if(user.getAvatar() != null){
                cloudinaryService.deleteFile(user.getAvatar());
            }
            String avtUrl = cloudinaryService.uploadFile(file);
            user.setAvatar(avtUrl);
        }
        User saved = userRepository.save(user);
        return userMapper.toUserResponse(saved);
    }
    public User getcurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return userRepository.findByEmailOrPhoneNumber(username,username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
