package com.nhom01.coursemanagement.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LessonResponse {
    private Integer id;
    private Integer chapterId;
    private String title;
    private String content;
    private String videoUrl;
    private Integer lessonOrder;
}
