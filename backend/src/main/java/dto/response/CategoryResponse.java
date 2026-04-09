package dto.response;

import entity.Product;

import java.util.List;

public class CategoryResponse {
    private Long id;
    private String name;
    private List<ProductResponse> productList;
}
