package com.tientoan21.mapper;

import com.tientoan21.dto.response.OrderResponse;
import com.tientoan21.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {AddressMapper.class, PaymentMapper.class, OrderItemMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    @Mapping(source = "address", target = "deliveryAddress")
    @Mapping(source = "payment", target = "paymentInfo")
    @Mapping(source = "orderItemList", target = "orderItems")
    OrderResponse toOrderResponse(Order order);
}

