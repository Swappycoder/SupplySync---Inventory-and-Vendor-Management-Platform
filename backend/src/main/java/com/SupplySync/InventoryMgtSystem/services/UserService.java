package com.SupplySync.InventoryMgtSystem.services;

import com.SupplySync.InventoryMgtSystem.dtos.LoginRequest;
import com.SupplySync.InventoryMgtSystem.dtos.RegisterRequest;
import com.SupplySync.InventoryMgtSystem.dtos.Response;
import com.SupplySync.InventoryMgtSystem.dtos.UserDTO;
import com.SupplySync.InventoryMgtSystem.models.User;

public interface UserService {
    Response registerUser(RegisterRequest registerRequest);

    Response loginUser(LoginRequest loginRequest);

    Response getAllUsers();

    User getCurrentLoggedInUser();

    Response getUserById(Long id);

    Response updateUser(Long id, UserDTO userDTO);

    Response deleteUser(Long id);

    Response getUserTransactions(Long id);
}
