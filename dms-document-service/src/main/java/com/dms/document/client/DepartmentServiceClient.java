package com.dms.document.client;

import com.dms.common.dto.DepartmentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "dms-user-service")
public interface DepartmentServiceClient {
    @GetMapping("/api/departments/{id}")
    DepartmentDto getDepartmentById(@PathVariable UUID id);
}
