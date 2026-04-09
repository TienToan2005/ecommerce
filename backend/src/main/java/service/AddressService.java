package service;

import dto.request.AddressRequest;
import dto.response.AddressResponse;
import entity.Address;
import entity.User;
import lombok.RequiredArgsConstructor;
import mapper.AddressMapper;
import org.springframework.stereotype.Service;
import repository.AddressRepository;

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
