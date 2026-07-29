// dto/request/ChapterRequest.java
package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChapterRequest {
    @NotBlank private String title;
    private Integer chapterOrder;
}