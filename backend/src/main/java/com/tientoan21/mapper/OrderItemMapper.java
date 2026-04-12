package com.tientoan21.mapper;

import com.tientoan21.dto.response.OrderItemResponse;
import com.tientoan21.entity.OrderItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);
}
