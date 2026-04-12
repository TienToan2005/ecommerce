package com.tientoan21.service;

import com.tientoan21.dto.request.AddressRequest;
import com.tientoan21.dto.response.AddressResponse;
import com.tientoan21.entity.Address;
import com.tientoan21.entity.User;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.AddressMapper;
import org.springframework.stereotype.Service;
import com.tientoan21.repository.AddressRepository;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final UserService userService;

    public AddressResponse updateAddress(AddressRequest request){
        User user = userService.getcurrentUser();
        Address address =  user.getAddress();

        if(address == null){
            address = new Address();
            address.setUser(user);
        }

        addressMapper.updateAddressFromRequest(request,address);
        Address saved = addressRepository.save(address);

        return addressMapper.toAddressResponse(saved);
    }
}
