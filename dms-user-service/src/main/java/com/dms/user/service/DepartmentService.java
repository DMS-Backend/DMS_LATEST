package com.dms.user.service;

import com.dms.common.dto.DepartmentDto;
import com.dms.common.exception.ResourceNotFoundException;
import com.dms.user.entity.Department;
import com.dms.user.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
            .map(this::mapToDepartmentDto)
            .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(UUID id) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToDepartmentDto(department);
    }

    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        if (departmentRepository.existsByName(departmentDto.getName())) {
            throw new RuntimeException("Department name already exists");
        }
        
        Department department = Department.builder()
            .name(departmentDto.getName())
            .description(departmentDto.getDescription())
            .build();
        
        Department savedDepartment = departmentRepository.save(department);
        return mapToDepartmentDto(savedDepartment);
    }

    public DepartmentDto updateDepartment(UUID id, DepartmentDto departmentDto) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        
        department.setName(departmentDto.getName());
        department.setDescription(departmentDto.getDescription());
        
        Department updatedDepartment = departmentRepository.save(department);
        return mapToDepartmentDto(updatedDepartment);
    }

    public void deleteDepartment(UUID id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentDto mapToDepartmentDto(Department department) {
        return DepartmentDto.builder()
            .id(department.getId())
            .name(department.getName())
            .description(department.getDescription())
            .build();
    }
}
