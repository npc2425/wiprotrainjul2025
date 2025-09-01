package com.wipro.ecom.product_management.service;

import com.wipro.ecom.product_management.dto.OrderEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    @Autowired
    private ProductService productService;

    @KafkaListener(topics = "order-events", groupId = "product-group")
    public void consumeOrderEvent(OrderEvent event) {
        System.out.println("Received order event: " + event.getEventType());

        event.getItems().forEach(item -> {
            int quantityChange = 0;
            if ("ORDER_PLACED".equals(event.getEventType())) {
                quantityChange = -item.getQuantity(); // Decrease stock
            } else if ("ORDER_CANCELLED".equals(event.getEventType())) {
                quantityChange = item.getQuantity(); // Increase stock
            }
            
            if (quantityChange != 0) {
                productService.updateStock(item.getProductId(), quantityChange);
            }
        });
    }
}
