package com.SypplySync.InventoryMgtSystem.services;

import org.springframework.web.multipart.MultipartFile;

import com.SypplySync.InventoryMgtSystem.dtos.ProductDTO;
import com.SypplySync.InventoryMgtSystem.dtos.Response;

public interface ProductService {
    Response saveProduct(ProductDTO productDTO, MultipartFile imageFile);

    Response updateProduct(ProductDTO productDTO, MultipartFile imageFile);

    Response getAllProducts();

    Response getProductById(Long id);

    Response deleteProduct(Long id);

    Response searchProduct(String input);
}
