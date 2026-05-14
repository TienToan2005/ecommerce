package com.tientoan21.dto.response;

import lombok.*;

import java.util.List;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CategoryFilterResponse {
    private List<String> brands;
}

