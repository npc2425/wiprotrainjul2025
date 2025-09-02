package com.wipro.ecom.order_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter // <-- ADD THIS
@Setter // <-- ADD THIS
@Data
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer itemId;
    private Integer productId;
    private Integer quantity;
    private Double price;
}
