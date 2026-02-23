package com.SypplySync.InventoryMgtSystem.services;

import com.SypplySync.InventoryMgtSystem.dtos.Response;
import com.SypplySync.InventoryMgtSystem.dtos.SupplierDTO;

public interface SupplierService {

    Response addSupplier(SupplierDTO supplierDTO);

    Response updateSupplier(Long id, SupplierDTO supplierDTO);

    Response getAllSupplier();

    Response getSupplierById(Long id);

    Response deleteSupplier(Long id);

}
