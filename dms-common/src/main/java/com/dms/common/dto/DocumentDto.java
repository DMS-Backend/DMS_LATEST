package com.dms.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private UUID id;
    private String title;
    private String translatedTitle;
    private String description;
    private String content;
    private String type;
    private String category; // Added category field
    private UUID departmentId; // Document belongs to a department
    private String departmentName;
    private String s3Key;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID createdBy;
    private UUID updatedBy;
    private String createdByName;
    private String updatedByName;
}
