// dto/request/UpdateProfileRequest.java
package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank private String fullName;
    private String phone;
    // Không cho đổi username/email/role ở đây — đổi email cần xác thực riêng, đổi role chỉ Admin mới làm
}