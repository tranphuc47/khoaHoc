// dto/response/EnrollmentResponse.java
package com.nhom01.coursemanagement.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EnrollmentResponse {
    private Integer id;
    private Integer userId;
    private String userFullName;
    private Integer courseId;
    private String courseTitle;
    private String status;
    private LocalDateTime enrolledDate;
    private LocalDateTime completedDate;
}