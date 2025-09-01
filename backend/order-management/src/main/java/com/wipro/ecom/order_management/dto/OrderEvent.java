package com.wipro.ecom.order_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor // <-- ADD THIS ANNOTATION
@NoArgsConstructor
public class OrderEvent {
    private String eventType;
    private List<OrderItemDetail> items;

    @Data
    @AllArgsConstructor // <-- This one is likely correct already
    @NoArgsConstructor
    public static class OrderItemDetail {
        private Integer productId;
        private Integer quantity;
    }
}
