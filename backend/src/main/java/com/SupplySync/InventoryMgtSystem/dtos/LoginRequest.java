package com.SupplySync.InventoryMgtSystem.dtos;


import com.SupplySync.InventoryMgtSystem.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    @NotBlank(message = "email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
    
    private UserRole role;
}
