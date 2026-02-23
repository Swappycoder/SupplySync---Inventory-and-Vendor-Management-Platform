package com.SypplySync.InventoryMgtSystem.services;

import com.SypplySync.InventoryMgtSystem.dtos.LoginRequest;
import com.SypplySync.InventoryMgtSystem.dtos.RegisterRequest;
import com.SypplySync.InventoryMgtSystem.dtos.Response;
import com.SypplySync.InventoryMgtSystem.dtos.UserDTO;
import com.SypplySync.InventoryMgtSystem.models.User;

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
