package com.SypplySync.InventoryMgtSystem.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SypplySync.InventoryMgtSystem.models.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}
