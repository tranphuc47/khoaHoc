package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CourseCreateRequest {
    @NotBlank private String title;
    private String description;
    private String thumbnailUrl;
    @NotNull private BigDecimal price;
    @NotNull private Integer categoryId;
}