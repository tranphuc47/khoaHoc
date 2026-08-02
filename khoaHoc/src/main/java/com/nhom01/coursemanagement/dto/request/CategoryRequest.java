// dto/request/CategoryRequest.java
package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank private String name;
    private String description;
}
