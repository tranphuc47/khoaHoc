// dto/request/LessonRequest.java
package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LessonRequest {
    @NotBlank private String title;
    private String content;
    private String videoUrl;
    private Integer lessonOrder;
}
