package com.nhom01.coursemanagement.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InstructorStatisticsResponse {
    private long totalCourses;
    private long totalStudents; // học viên khác nhau, không tính trùng
    private long totalLessons;

    // Chi tiết từng khóa học, tái dùng EnrollmentStatisticResponse đã có ở Module 5
    private List<EnrollmentStatisticResponse> courseDetails;
}
