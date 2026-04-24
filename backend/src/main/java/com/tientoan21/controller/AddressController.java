package com.tientoan21.controller;

import com.tientoan21.dto.request.AddressRequest;
import com.tientoan21.dto.response.AddressResponse;
import com.tientoan21.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.AddressService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/addresses")
public class AddressController {
    private final AddressService addressService;

    @PostMapping
    public ApiResponse<AddressResponse> createAddress(@RequestBody AddressRequest request){
        return ApiResponse.<AddressResponse>builder()
                .data(addressService.createAddress(request))
                .build();
    }
    @GetMapping("my-address")
    public ApiResponse<List<AddressResponse>> getMyAddresses(){
        return ApiResponse.<List<AddressResponse>>builder()
                .data(addressService.getMyAddresses())
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> updateAddress(@PathVariable Long id,@RequestBody AddressRequest request){
        return ApiResponse.<AddressResponse>builder()
                .data(addressService.updateAddress(id,request))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteAddress(@PathVariable Long id){
        addressService.deleteAddress(id);
        return ApiResponse.<String>builder()
                .data("Xóa địa chỉ thành công")
                .build();
    }
}
