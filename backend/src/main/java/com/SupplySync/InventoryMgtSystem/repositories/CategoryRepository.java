package com.SupplySync.InventoryMgtSystem.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SupplySync.InventoryMgtSystem.models.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
