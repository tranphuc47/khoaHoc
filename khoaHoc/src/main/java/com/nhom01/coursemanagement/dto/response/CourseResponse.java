// dto/response/CourseResponse.java
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
    // Chỉ đổ dữ liệu field này khi gọi API "chi tiết 1 khóa học" (STT 2) — list thường không cần load chapters
    private List<ChapterResponse> chapters;
}