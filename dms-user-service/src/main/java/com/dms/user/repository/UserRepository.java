package com.dms.user.repository;

import com.dms.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("SELECT u FROM User u JOIN u.departments d WHERE d.id = :departmentId")
    List<User> findByDepartmentId(@Param("departmentId") UUID departmentId);
    
    @Query("SELECT u FROM User u JOIN u.departments d WHERE d.id IN :departmentIds")
    List<User> findByDepartmentIdIn(@Param("departmentIds") Set<UUID> departmentIds);
}
