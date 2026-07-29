// dto/response/CategoryResponse.java
package com.nhom01.coursemanagement.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryResponse {
    private Integer id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}