// Ensure this file is in a 'dto' package inside your main package
package com.wipro.ecom.product_management.dto; // <-- CORRECTED PACKAGE NAME

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderEvent {
    private String eventType; // e.g., "ORDER_PLACED", "ORDER_CANCELLED"
    private List<OrderItemDetail> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderItemDetail {
        private Integer productId;
        private int quantity;
    }
}
