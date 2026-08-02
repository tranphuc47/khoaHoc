package com.nhom01.coursemanagement.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StudentLearningStatisticsResponse {
    private long totalCourses;
    private long totalSubjects; // số danh mục/môn khác nhau học viên đang học hoặc đã hoàn thành
    private long pendingCourses;
    private long activeCourses;
    private long completedCourses;
    private long cancelledCourses;
}
