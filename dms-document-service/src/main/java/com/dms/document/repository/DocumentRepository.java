package com.dms.document.repository;

import com.dms.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByCreatedBy(UUID userId);
    
    List<Document> findByType(String type);
    
    List<Document> findByCategory(String category);
    
    List<Document> findByDepartmentId(UUID departmentId);
    
    @Query("SELECT d FROM Document d WHERE d.departmentId IN :departmentIds")
    List<Document> findByDepartmentIdIn(@Param("departmentIds") Set<UUID> departmentIds);
}
