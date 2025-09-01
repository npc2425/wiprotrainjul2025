package com.wipro.ecom.order_management.service;

import com.wipro.ecom.order_management.dto.OrderEvent;
import com.wipro.ecom.order_management.entity.Order;
import com.wipro.ecom.order_management.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Transactional
    // --- THIS IS THE FIX ---
    // The method now accepts the secure customerId
    public Order createOrder(Order order, Integer customerId) {

        order.setUserId(customerId);
        List<OrderEvent.OrderItemDetail> itemDetails = order.getItems().stream()
            .map(item -> new OrderEvent.OrderItemDetail(item.getProductId(), item.getQuantity()))
            .collect(Collectors.toList());
        
        kafkaProducerService.sendOrderEvent(new OrderEvent("ORDER_PLACED", itemDetails));
        
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus("PLACED");
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Integer orderId, Integer requestingUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getUserId().equals(requestingUserId)) {
            throw new SecurityException("User does not have permission to cancel this order.");
        }

        if (!"PLACED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Order cannot be cancelled.");
        }

        // Publish event to Kafka to increase stock
        List<OrderEvent.OrderItemDetail> itemDetails = order.getItems().stream()
            .map(item -> new OrderEvent.OrderItemDetail(item.getProductId(), item.getQuantity()))
            .collect(Collectors.toList());

        kafkaProducerService.sendOrderEvent(new OrderEvent("ORDER_CANCELLED", itemDetails));

        order.setOrderStatus("CANCELLED");
        return orderRepository.save(order);
    }
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    public List<Order> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserId(userId);
    }
}
