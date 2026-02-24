package com.SupplySync.InventoryMgtSystem.services;

import com.SupplySync.InventoryMgtSystem.dtos.Response;
import com.SupplySync.InventoryMgtSystem.dtos.SupplierDTO;

public interface SupplierService {

    Response addSupplier(SupplierDTO supplierDTO);

    Response updateSupplier(Long id, SupplierDTO supplierDTO);

    Response getAllSupplier();

    Response getSupplierById(Long id);

    Response deleteSupplier(Long id);

}
