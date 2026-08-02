package com.nhom01.coursemanagement.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminOverviewResponse {
    // Người dùng
    private long totalUsers;
    private long totalStudents;
    private long totalInstructors;
    private long totalAdmins;

    // Khóa học
    private long totalCourses;
    private long totalDraftCourses;
    private long totalPublishedCourses;
    private long totalArchivedCourses;

    // Danh mục và bài học
    private long totalCategories;
    private long totalLessons;

    // Ghi danh
    private long totalEnrollments;
    private long totalPendingEnrollments;
    private long totalActiveEnrollments;
    private long totalCompletedEnrollments;
    private long totalCancelledEnrollments;
}
