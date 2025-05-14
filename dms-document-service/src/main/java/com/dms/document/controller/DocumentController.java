package com.dms.document.controller;

import com.dms.common.dto.DocumentDto;
import com.dms.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getAllDocuments(
            @RequestHeader(value = "X-User-Department-Ids", required = false) String departmentIdsHeader,
            @RequestHeader("X-User-Role") String role) {
        
        // If admin, return all documents
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(documentService.getAllDocuments());
        }
        
        // For regular users, return only documents from their departments
        if (departmentIdsHeader != null && !departmentIdsHeader.isEmpty()) {
            Set<UUID> departmentIds = Arrays.stream(departmentIdsHeader.split(","))
                .map(UUID::fromString)
                .collect(Collectors.toSet());
                
            return ResponseEntity.ok(documentService.getDocumentsByDepartments(departmentIds));
        }
        
        // If no departments, return empty list
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Department-Ids", required = false) String departmentIdsHeader,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userIdStr) {
        
        DocumentDto document = documentService.getDocumentById(id);
        
        // If admin or document creator, allow access
        if ("admin".equalsIgnoreCase(role) || document.getCreatedBy().toString().equals(userIdStr)) {
            return ResponseEntity.ok(document);
        }
        
        // Check if user has access to the document's department
        if (departmentIdsHeader != null && !departmentIdsHeader.isEmpty()) {
            Set<UUID> userDepartmentIds = Arrays.stream(departmentIdsHeader.split(","))
                .map(UUID::fromString)
                .collect(Collectors.toSet());
                
            if (userDepartmentIds.contains(document.getDepartmentId())) {
                return ResponseEntity.ok(document);
            }
        }
        
        // User doesn't have access
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(documentService.getDocumentsByUser(userId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByType(@PathVariable String type) {
        return ResponseEntity.ok(documentService.getDocumentsByType(type));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(documentService.getDocumentsByCategory(category));
    }
    
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByDepartment(
            @PathVariable UUID departmentId,
            @RequestHeader(value = "X-User-Department-Ids", required = false) String departmentIdsHeader,
            @RequestHeader("X-User-Role") String role) {
        
        // If admin, allow access to any department
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(documentService.getDocumentsByDepartment(departmentId));
        }
        
        // For regular users, check if they belong to the requested department
        if (departmentIdsHeader != null && !departmentIdsHeader.isEmpty()) {
            Set<UUID> userDepartmentIds = Arrays.stream(departmentIdsHeader.split(","))
                .map(UUID::fromString)
                .collect(Collectors.toSet());
                
            if (userDepartmentIds.contains(departmentId)) {
                return ResponseEntity.ok(documentService.getDocumentsByDepartment(departmentId));
            }
        }
        
        // User doesn't have access
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping
    public ResponseEntity<DocumentDto> createDocument(
            @RequestBody DocumentDto documentDto,
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestHeader(value = "X-User-Department-Ids", required = false) String departmentIdsHeader,
            @RequestHeader("X-User-Role") String role) {
        
        UUID userId = UUID.fromString(userIdStr);
        
        // If admin, allow creating document in any department
        if ("admin".equalsIgnoreCase(role)) {
            return new ResponseEntity<>(documentService.createDocument(documentDto, userId), HttpStatus.CREATED);
        }
        
        // For regular users, check if they belong to the document's department
        if (departmentIdsHeader != null && !departmentIdsHeader.isEmpty()) {
            Set<UUID> userDepartmentIds = Arrays.stream(departmentIdsHeader.split(","))
                .map(UUID::fromString)
                .collect(Collectors.toSet());
                
            if (userDepartmentIds.contains(documentDto.getDepartmentId())) {
                return new ResponseEntity<>(documentService.createDocument(documentDto, userId), HttpStatus.CREATED);
            }
        }
        
        // User doesn't have access to the department
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentDto> updateDocument(
            @PathVariable UUID id,
            @RequestBody DocumentDto documentDto,
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestHeader(value = "X-User-Department-Ids", required = false) String departmentIdsHeader,
            @RequestHeader("X-User-Role") String role) {
        
        UUID userId = UUID.fromString(userIdStr);
        DocumentDto existingDocument = documentService.getDocumentById(id);
        
        // If admin or document creator, allow update
        if ("admin".equalsIgnoreCase(role) || existingDocument.getCreatedBy().toString().equals(userIdStr)) {
            return ResponseEntity.ok(documentService.updateDocument(id, documentDto, userId));
        }
        
        // For regular users, check if they belong to the document's department
        if (departmentIdsHeader != null && !departmentIdsHeader.isEmpty()) {
            Set<UUID> userDepartmentIds = Arrays.stream(departmentIdsHeader.split(","))
                .map(UUID::fromString)
                .collect(Collectors.toSet());
                
            if (userDepartmentIds.contains(existingDocument.getDepartmentId())) {
                return ResponseEntity.ok(documentService.updateDocument(id, documentDto, userId));
            }
        }
        
        // User doesn't have access
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto> uploadFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestHeader(value = "X-User-Department-Ids", required = false) String departmentIdsHeader,
            @RequestHeader("X-User-Role") String role) throws IOException {
        
        UUID userId = UUID.fromString(userIdStr);
        DocumentDto existingDocument = documentService.getDocumentById(id);
        
        // If admin or document creator, allow upload
        if ("admin".equalsIgnoreCase(role) || existingDocument.getCreatedBy().toString().equals(userIdStr)) {
            return ResponseEntity.ok(documentService.uploadFile(id, file, userId));
        }
        
        // For regular users, check if they belong to the document's department
        if (departmentIdsHeader != null && !departmentIdsHeader.isEmpty()) {
            Set<UUID> userDepartmentIds = Arrays.stream(departmentIdsHeader.split(","))
                .map(UUID::fromString)
                .collect(Collectors.toSet());
                
            if (userDepartmentIds.contains(existingDocument.getDepartmentId())) {
                return ResponseEntity.ok(documentService.uploadFile(id, file, userId));
            }
        }
        
        // User doesn't have access
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestHeader("X-User-Role") String role) {
        
        DocumentDto existingDocument = documentService.getDocumentById(id);
        
        // Only admin or document creator can delete
        if ("admin".equalsIgnoreCase(role) || existingDocument.getCreatedBy().toString().equals(userIdStr)) {
            documentService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        }
        
        // User doesn't have access
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
