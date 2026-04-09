package dto.request;

import entity.Address;
import entity.Cart;
import enums.UserRole;

import java.time.LocalDate;
import java.util.List;

public record UserRequest(
        String fullName,
        String email,
        String phoneNumber,
        String password,
        LocalDate birthday,
        UserRole role,
        AddressRequest address,
        List<OrderRequest> orderList,
        CartRequest cart
) {
}
