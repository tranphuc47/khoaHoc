package com.nhom01.coursemanagement.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MonthlyCourseStatisticResponse {
    private int year;
    private int month;
    private long createdCourseCount;
    private long enrollmentCount;
}
