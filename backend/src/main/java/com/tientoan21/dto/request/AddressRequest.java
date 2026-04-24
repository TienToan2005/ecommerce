package com.tientoan21.dto.request;

public record AddressRequest(
    String street,
    String city,
    String ward,
    String district
) {}
