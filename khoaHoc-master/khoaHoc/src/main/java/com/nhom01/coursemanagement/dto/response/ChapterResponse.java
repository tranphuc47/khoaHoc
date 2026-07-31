package com.nhom01.coursemanagement.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChapterResponse {
    private Integer id;
    private Integer courseId;
    private String title;
    private Integer chapterOrder;
    private List<LessonResponse> lessons; // chỉ đổ khi lấy chi tiết course (Module 3 dùng lại DTO này)
}
