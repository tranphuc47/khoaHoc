package com.nhom01.coursemanagement.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MonthlyInstructorActivityResponse {
    private int year;
    private int month;
    private long lessonCount;
    private long enrollmentCount;
}
