package com.nhom01.coursemanagement.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CourseResponse {
    private Integer id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private String status;
    private Integer categoryId;
    private String categoryName;
    private Integer instructorId;
    private String instructorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ChapterResponse> chapters; // chỉ đổ khi gọi API chi tiết course
}
