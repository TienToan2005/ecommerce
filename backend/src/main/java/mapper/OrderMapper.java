package mapper;

import dto.response.OrderResponse;
import entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {AddressMapper.class, PaymentMapper.class, OrderItemMapper.class})
public interface OrderMapper {

    @Mapping(source = "address", target = "deliveryAddress")
    @Mapping(source = "payment", target = "paymentInfo")
    @Mapping(source = "orderItemList", target = "orderItems")
    OrderResponse toOrderResponse(Order order);
}

