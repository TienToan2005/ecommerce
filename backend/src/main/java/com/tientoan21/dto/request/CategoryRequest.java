package com.tientoan21.dto.request;


import java.util.List;

public record CategoryRequest(
         String name,
         List<ProductRequest> products
) {
}
