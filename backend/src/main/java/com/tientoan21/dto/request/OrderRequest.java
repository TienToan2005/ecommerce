package com.tientoan21.dto.request;

import java.util.List;

public record OrderRequest(
         Long addressId,
         String paymentMethod,
         List<OrderItemRequest> orderItemList
) {
}
