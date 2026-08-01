// dto/request/EnrollmentRequest.java
package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequest {
    @NotNull private Integer courseId;
}