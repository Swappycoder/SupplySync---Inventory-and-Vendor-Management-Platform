package com.SupplySync.InventoryMgtSystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.image.upload-dir:C:/Users/admin/Downloads/crazy backups/IMS-react/frontend/public/products/}")
    private String imageUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /products URL to the actual file system directory
        // Ensure the path ends with "/" for proper file resolution
        String resourceLocation = imageUploadDir.endsWith("/") 
            ? "file:" + imageUploadDir 
            : "file:" + imageUploadDir + "/";
        
        registry.addResourceHandler("/products/**")
                .addResourceLocations(resourceLocation);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
