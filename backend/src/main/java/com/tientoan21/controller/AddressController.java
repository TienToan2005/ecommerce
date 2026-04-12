package com.tientoan21.controller;

import com.tientoan21.dto.request.AddressRequest;
import com.tientoan21.dto.response.AddressResponse;
import com.tientoan21.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.AddressService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/address")
public class AddressController {
    private final AddressService addressService;

    @PutMapping
    public ApiResponse<AddressResponse> updateAddress(@RequestBody AddressRequest request){
        return ApiResponse.<AddressResponse>builder()
                .data(addressService.updateAddress(request))
                .build();
    }
}
