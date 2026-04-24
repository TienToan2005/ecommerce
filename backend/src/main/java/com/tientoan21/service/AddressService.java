package com.tientoan21.service;

import com.tientoan21.dto.request.AddressRequest;
import com.tientoan21.dto.response.AddressResponse;
import com.tientoan21.entity.Address;
import com.tientoan21.entity.User;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.AddressMapper;
import org.springframework.stereotype.Service;
import com.tientoan21.repository.AddressRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final UserService userService;

    @Transactional
    public AddressResponse createAddress(AddressRequest request){
        User user = userService.getcurrentUser();
        Address address = addressMapper.toEntity(request);
        address.setUser(user);
        if (user.getAddresses() != null) {
            user.getAddresses().add(address);
        }

        Address saved = addressRepository.save(address);
        return addressMapper.toAddressResponse(saved);
    }
    public List<AddressResponse> getMyAddresses(){
        User user = userService.getcurrentUser();
        List<Address> addresses = addressRepository.findAllByUserId(user.getId());

        return addresses.stream().map(addressMapper::toAddressResponse).toList();
    }
    @Transactional
    public AddressResponse updateAddress(Long id, AddressRequest request){
        Address address = addressRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        addressMapper.updateAddressFromRequest(request,address);

        Address saved = addressRepository.save(address);

        return addressMapper.toAddressResponse(saved);
    }
    @Transactional
    public void deleteAddress(Long id){
        addressRepository.deleteById(id);
    }
}
