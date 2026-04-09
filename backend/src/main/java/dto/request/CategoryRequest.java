package dto.request;

import entity.Product;

import java.util.List;

public record CategoryRequest(
         String name,
         List<Product> products
) {
}
