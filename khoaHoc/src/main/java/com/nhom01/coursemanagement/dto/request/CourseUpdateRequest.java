package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CourseUpdateRequest {
    @NotBlank private String title;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private Integer categoryId;
    private String status;
}