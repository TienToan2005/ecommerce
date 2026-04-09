package dto.response;

import entity.Address;
import entity.Cart;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    private LocalDate birthday;
    private Address address;
    private List<OrderResponse> orderResponseList;
    private Cart cart;
}
