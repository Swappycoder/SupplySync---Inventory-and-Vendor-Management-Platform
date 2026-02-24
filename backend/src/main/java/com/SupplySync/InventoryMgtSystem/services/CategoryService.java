package com.SupplySync.InventoryMgtSystem.services;

import com.SupplySync.InventoryMgtSystem.dtos.CategoryDTO;
import com.SupplySync.InventoryMgtSystem.dtos.Response;

public interface CategoryService {

    Response createCategory(CategoryDTO categoryDTO);

    Response getAllCategories();

    Response getCategoryById(Long id);

    Response updateCategory(Long id, CategoryDTO categoryDTO);

    Response deleteCategory(Long id);
}
