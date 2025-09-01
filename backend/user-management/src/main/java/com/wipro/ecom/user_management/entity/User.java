package com.wipro.ecom.user_management.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String firstName;
    private String lastName;
    @Column(unique = true, nullable = false)
    private String emailId;
    @Column(unique = true, nullable = false)
    private String userId; 
    @Column(nullable = false)
    private String password;
    private String address;
    private int userType;
    private String avatar;
    private boolean isLoggedIn = false;
    // join date automatically set to current date
    
}
