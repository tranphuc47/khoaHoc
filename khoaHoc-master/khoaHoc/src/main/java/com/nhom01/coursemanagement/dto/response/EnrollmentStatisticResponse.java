// dto/response/EnrollmentStatisticResponse.java
package com.nhom01.coursemanagement.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EnrollmentStatisticResponse {
    private Integer courseId;
    private String courseTitle;
    private long totalEnrolled;      // tổng số bản ghi enrollment (mọi status)
    private long activeCount;        // đang học (ACTIVE)
    private long completedCount;     // đã hoàn thành
    private long cancelledCount;     // đã hủy
}