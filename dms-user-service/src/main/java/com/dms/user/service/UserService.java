package com.dms.user.service;

import com.dms.common.dto.UserDto;
import com.dms.common.exception.ResourceNotFoundException;
import com.dms.user.entity.Department;
import com.dms.user.entity.User;
import com.dms.user.repository.DepartmentRepository;
import com.dms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToUserDto)
            .collect(Collectors.toList());
    }

    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserDto(user);
    }

    public List<UserDto> getUsersByDepartment(UUID departmentId) {
        return userRepository.findByDepartmentId(departmentId).stream()
            .map(this::mapToUserDto)
            .collect(Collectors.toList());
    }
    
    public List<UserDto> getUsersByDepartments(Set<UUID> departmentIds) {
        return userRepository.findByDepartmentIdIn(departmentIds).stream()
            .map(this::mapToUserDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createUser(UserDto userDto) {
        Set<Department> departments = new HashSet<>();
        if (userDto.getDepartmentIds() != null && !userDto.getDepartmentIds().isEmpty()) {
            departments = userDto.getDepartmentIds().stream()
                .map(id -> departmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id)))
                .collect(Collectors.toSet());
        }
        
        User user = User.builder()
            .id(userDto.getId())
            .name(userDto.getName())
            .email(userDto.getEmail())
            .role(userDto.getRole())
            .active(userDto.isActive())
            .departments(departments)
            .build();
        
        User savedUser = userRepository.save(user);
        return mapToUserDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(UUID id, UserDto userDto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        Set<Department> departments = new HashSet<>();
        if (userDto.getDepartmentIds() != null && !userDto.getDepartmentIds().isEmpty()) {
            departments = userDto.getDepartmentIds().stream()
                .map(deptId -> departmentRepository.findById(deptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + deptId)))
                .collect(Collectors.toSet());
        }
        
        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setRole(userDto.getRole());
        user.setActive(userDto.isActive());
        user.setDepartments(departments);
        
        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserDto mapToUserDto(User user) {
        Set<UUID> departmentIds = user.getDepartments().stream()
            .map(Department::getId)
            .collect(Collectors.toSet());
            
        List<String> departmentNames = user.getDepartments().stream()
            .map(Department::getName)
            .collect(Collectors.toList());
            
        return UserDto.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .active(user.isActive())
            .departmentIds(departmentIds)
            .departmentNames(departmentNames)
            .build();
    }
}
