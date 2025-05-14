package com.dms.document.client;

import com.dms.common.dto.CategoryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "dms-user-service")
public interface CategoryServiceClient {
    @GetMapping("/api/categories/{id}")
    CategoryDto getCategoryById(@PathVariable UUID id);
    
    @GetMapping("/api/categories")
    List<CategoryDto> getAllCategories();
}
