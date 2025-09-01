package com.wipro.ecom.product_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String prodName;
    private String prodDesc;
    private String prodCat;
    private int availableQty;
    private double price;
    private String uom;
    private String make; 
    private Double prodRating;
    private String imageURL;
    private LocalDate dateOfManufacture;
}
