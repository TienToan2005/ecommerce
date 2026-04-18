package com.tientoan21.dto.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class AddressResponse {
    private Long id;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private Long userId;
}
