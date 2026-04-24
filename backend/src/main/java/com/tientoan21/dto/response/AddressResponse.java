package com.tientoan21.dto.response;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddressResponse {
    private Long id;
    private String street;
    private String ward;
    private String district;
    private String city;
    private Boolean isDefault;
    private Long userId;

    private String receiverName;
    private String receiverPhone;
}
