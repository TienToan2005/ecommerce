package dto.request;

import entity.Category;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProductRequest(
         String name,
         BigDecimal price,
         List<String> images,
         String description,
         int stock,
         Long categoryId,
         Map<String, String> specifications
) {
}
