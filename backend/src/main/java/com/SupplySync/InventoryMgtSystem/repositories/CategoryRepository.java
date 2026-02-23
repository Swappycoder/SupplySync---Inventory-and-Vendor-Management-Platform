package com.SypplySync.InventoryMgtSystem.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SypplySync.InventoryMgtSystem.models.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
