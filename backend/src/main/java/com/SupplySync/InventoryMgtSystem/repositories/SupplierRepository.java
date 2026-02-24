package com.SupplySync.InventoryMgtSystem.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SupplySync.InventoryMgtSystem.models.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}
