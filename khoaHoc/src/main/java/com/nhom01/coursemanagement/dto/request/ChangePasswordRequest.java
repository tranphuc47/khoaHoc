// dto/request/ChangePasswordRequest.java
package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank private String oldPassword;
    @NotBlank @Size(min = 6, message = "Mật khẩu mới tối thiểu 6 ký tự") private String newPassword;
}