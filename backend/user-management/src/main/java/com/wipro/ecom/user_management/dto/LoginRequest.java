package com.wipro.ecom.user_management.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String userId;
    private String password;
}
