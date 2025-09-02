package com.wipro.ecom.user_management.dto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Integer id;
    private String token;
    private String userId;
    private int userType;
    private String firstName;
    private String lastName;
    private String avatar;
}
