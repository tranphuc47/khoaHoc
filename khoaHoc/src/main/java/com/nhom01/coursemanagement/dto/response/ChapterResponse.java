// dto/response/ChapterResponse.java
package com.nhom01.coursemanagement.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChapterResponse {
    private Integer id;
    private Integer courseId;
    private String title;
    private Integer chapterOrder;
    // Chỉ đổ khi lấy chi tiết course (kèm chapters & lessons theo yêu cầu STT 2 của Module 3)
    private List<LessonResponse> lessons;
}
