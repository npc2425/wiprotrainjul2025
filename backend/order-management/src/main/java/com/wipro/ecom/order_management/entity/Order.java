package com.wipro.ecom.order_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter // <-- ADD THIS
@Setter // <-- ADD THIS
@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderId;
    private Integer userId;
    private Double totalAmount;
    private String orderStatus;
    private LocalDateTime orderDate;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", referencedColumnName = "orderId")
    private List<OrderItem> items;
}
