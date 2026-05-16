package com.tientoan21.controller;

import com.tientoan21.dto.request.UpdateProfileRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.UserService;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getMyProfile() {
        return ApiResponse.<UserResponse>builder()
                .data(userService.getMyProfile())
                .build();
    }
    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserResponse> updateMyProfile(
            @ModelAttribute UpdateProfileRequest request,
            @RequestParam( value = "avatar") MultipartFile file
            ){
        return ApiResponse.<UserResponse>builder()
                .data(userService.updateMyProfile(request, file))
                .build();
    }

}
