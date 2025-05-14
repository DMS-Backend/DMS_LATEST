package com.dms.document.service;

import com.dms.common.dto.DocumentDto;
import com.dms.common.dto.UserDto;
import com.dms.common.exception.ResourceNotFoundException;
import com.dms.document.client.DepartmentServiceClient;
import com.dms.document.client.UserServiceClient;
import com.dms.document.entity.Document;
import com.dms.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final S3Service s3Service;
    private final UserServiceClient userServiceClient;
    private final DepartmentServiceClient departmentServiceClient;
    private final TranslationService translationService;

    public List<DocumentDto> getAllDocuments() {
        return documentRepository.findAll().stream()
            .map(this::mapToDocumentDto)
            .collect(Collectors.toList());
    }

    public DocumentDto getDocumentById(UUID id) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        return mapToDocumentDto(document);
    }

    public List<DocumentDto> getDocumentsByUser(UUID userId) {
        return documentRepository.findByCreatedBy(userId).stream()
            .map(this::mapToDocumentDto)
            .collect(Collectors.toList());
    }

    public List<DocumentDto> getDocumentsByType(String type) {
        return documentRepository.findByType(type).stream()
            .map(this::mapToDocumentDto)
            .collect(Collectors.toList());
    }
    
    public List<DocumentDto> getDocumentsByCategory(String category) {
        return documentRepository.findByCategory(category).stream()
            .map(this::mapToDocumentDto)
            .collect(Collectors.toList());
    }
    
    public List<DocumentDto> getDocumentsByDepartment(UUID departmentId) {
        return documentRepository.findByDepartmentId(departmentId).stream()
            .map(this::mapToDocumentDto)
            .collect(Collectors.toList());
    }
    
    public List<DocumentDto> getDocumentsByDepartments(Set<UUID> departmentIds) {
        return documentRepository.findByDepartmentIdIn(departmentIds).stream()
            .map(this::mapToDocumentDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public DocumentDto createDocument(DocumentDto documentDto, UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        
        // Translate the title (for demo purposes, we'll translate to French)
        String translatedTitle = translationService.translateText(
            documentDto.getTitle(), "en", "fr");
        
        Document document = Document.builder()
            .title(documentDto.getTitle())
            .translatedTitle(translatedTitle)
            .description(documentDto.getDescription())
            .content(documentDto.getContent())
            .type(documentDto.getType())
            .category(documentDto.getCategory())
            .departmentId(documentDto.getDepartmentId())
            .createdAt(now)
            .updatedAt(now)
            .createdBy(userId)
            .updatedBy(userId)
            .build();
        
        Document savedDocument = documentRepository.save(document);
        return mapToDocumentDto(savedDocument);
    }

    @Transactional
    public DocumentDto updateDocument(UUID id, DocumentDto documentDto, UUID userId) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        
        // Translate the title if it has changed
        String translatedTitle = document.getTranslatedTitle();
        if (!document.getTitle().equals(documentDto.getTitle())) {
            translatedTitle = translationService.translateText(
                documentDto.getTitle(), "en", "fr");
        }
        
        document.setTitle(documentDto.getTitle());
        document.setTranslatedTitle(translatedTitle);
        document.setDescription(documentDto.getDescription());
        document.setContent(documentDto.getContent());
        document.setType(documentDto.getType());
        document.setCategory(documentDto.getCategory());
        document.setDepartmentId(documentDto.getDepartmentId());
        document.setUpdatedAt(LocalDateTime.now());
        document.setUpdatedBy(userId);
        
        Document updatedDocument = documentRepository.save(document);
        return mapToDocumentDto(updatedDocument);
    }

    @Transactional
    public DocumentDto uploadFile(UUID documentId, MultipartFile file, UUID userId) throws IOException {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
        
        // Delete old file if exists
        if (document.getS3Key() != null) {
            s3Service.deleteFile(document.getS3Key());
        }
        
        // Upload new file
        String s3Key = s3Service.uploadFile(file);
        
        document.setS3Key(s3Key);
        document.setFileName(file.getOriginalFilename());
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setUpdatedAt(LocalDateTime.now());
        document.setUpdatedBy(userId);
        
        Document updatedDocument = documentRepository.save(document);
        return mapToDocumentDto(updatedDocument);
    }

    public void deleteDocument(UUID id) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        
        // Delete file from S3 if exists
        if (document.getS3Key() != null) {
            s3Service.deleteFile(document.getS3Key());
        }
        
        documentRepository.deleteById(id);
    }

    private DocumentDto mapToDocumentDto(Document document) {
        DocumentDto dto = DocumentDto.builder()
            .id(document.getId())
            .title(document.getTitle())
            .translatedTitle(document.getTranslatedTitle())
            .description(document.getDescription())
            .content(document.getContent())
            .type(document.getType())
            .category(document.getCategory())
            .departmentId(document.getDepartmentId())
            .s3Key(document.getS3Key())
            .fileName(document.getFileName())
            .fileType(document.getFileType())
            .fileSize(document.getFileSize())
            .createdAt(document.getCreatedAt())
            .updatedAt(document.getUpdatedAt())
            .createdBy(document.getCreatedBy())
            .updatedBy(document.getUpdatedBy())
            .build();
        
        // Add file URL if S3 key exists
        if (document.getS3Key() != null) {
            dto.setFileUrl(s3Service.getFileUrl(document.getS3Key()));
        }
        
        // Add department name
        try {
            var department = departmentServiceClient.getDepartmentById(document.getDepartmentId());
            dto.setDepartmentName(department.getName());
        } catch (Exception e) {
            dto.setDepartmentName("Unknown Department");
        }
        
        // Add user names
        try {
            UserDto createdByUser = userServiceClient.getUserById(document.getCreatedBy());
            dto.setCreatedByName(createdByUser.getName());
            
            if (!document.getCreatedBy().equals(document.getUpdatedBy())) {
                UserDto updatedByUser = userServiceClient.getUserById(document.getUpdatedBy());
                dto.setUpdatedByName(updatedByUser.getName());
            } else {
                dto.setUpdatedByName(createdByUser.getName());
            }
        } catch (Exception e) {
            // Handle case where user service is unavailable
            dto.setCreatedByName("Unknown");
            dto.setUpdatedByName("Unknown");
        }
        
        return dto;
    }
}
