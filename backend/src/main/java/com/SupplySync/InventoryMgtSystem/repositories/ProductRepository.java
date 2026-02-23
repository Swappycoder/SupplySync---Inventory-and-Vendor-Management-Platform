package com.SypplySync.InventoryMgtSystem.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SypplySync.InventoryMgtSystem.models.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingOrDescriptionContaining(String name, String description);
}
