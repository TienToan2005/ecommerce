package controller;

import dto.request.AddressRequest;
import dto.response.AddressResponse;
import dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import service.AddressService;

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
