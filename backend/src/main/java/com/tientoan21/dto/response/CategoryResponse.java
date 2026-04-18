package com.tientoan21.dto.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class CategoryResponse {
    private Long id;
    private String name;
}
