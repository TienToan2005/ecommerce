package mapper;

import dto.request.CartRequest;
import dto.response.CartResponse;
import entity.Cart;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring" , uses = ProductMapper.class)
public interface CartMapper {
    CartResponse toCartResponse(Cart cart);
    Cart toEntity(CartRequest request);
}
