package dto.request;

import entity.Address;

import java.time.LocalDate;

public record RegisterRequest(
        String email,
        String phoneNumber,
        String fullName,
        String password,
        LocalDate birthday,
        AddressRequest address
) {
}
