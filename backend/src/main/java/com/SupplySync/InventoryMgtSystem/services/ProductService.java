package com.SupplySync.InventoryMgtSystem.services;

import org.springframework.web.multipart.MultipartFile;

import com.SupplySync.InventoryMgtSystem.dtos.ProductDTO;
import com.SupplySync.InventoryMgtSystem.dtos.Response;

public interface ProductService {
    Response saveProduct(ProductDTO productDTO, MultipartFile imageFile);

    Response updateProduct(ProductDTO productDTO, MultipartFile imageFile);

    Response getAllProducts();

    Response getProductById(Long id);

    Response deleteProduct(Long id);

    Response searchProduct(String input);
}
