package com.SypplySync.InventoryMgtSystem.services;

import com.SypplySync.InventoryMgtSystem.dtos.CategoryDTO;
import com.SypplySync.InventoryMgtSystem.dtos.Response;

public interface CategoryService {

    Response createCategory(CategoryDTO categoryDTO);

    Response getAllCategories();

    Response getCategoryById(Long id);

    Response updateCategory(Long id, CategoryDTO categoryDTO);

    Response deleteCategory(Long id);
}
