package com.wipro.ecom.order_management.controller;

import com.wipro.ecom.order_management.entity.Order;
import com.wipro.ecom.order_management.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/order")
@Tag(name = "Order Management", description = "APIs for creating, viewing, and cancelling orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Operation(summary = "Create a new order from cart items")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid order data supplied")
    })
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> createOrder(@RequestBody Order order, Authentication authentication) {
 
      Integer customerId = (Integer) authentication.getPrincipal();
      
    
      Order createdOrder = orderService.createOrder(order, customerId); 
      
      return ResponseEntity.ok(createdOrder);
  }

    @Operation(summary = "Get a list of all orders for a specific user")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of orders")
    @GetMapping("/user/{userId}")
    @PreAuthorize("#userId == authentication.principal or hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable Integer userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Cancel an existing order")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "400", description = "Order cannot be cancelled (e.g., already shipped)")
    })
    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> cancelOrder(@PathVariable Integer orderId, Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        Order cancelledOrder = orderService.cancelOrder(orderId, userId);
        return ResponseEntity.ok(cancelledOrder);
    }

    @Operation(summary = "Get a list of all orders (Admin only)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of all orders")
    @GetMapping// <-- FIXED: Was '/', now "/"
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
}
