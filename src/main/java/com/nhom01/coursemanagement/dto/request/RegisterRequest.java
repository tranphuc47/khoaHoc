// dto/request/RegisterRequest.java
package com.nhom01.coursemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự") private String password;
    @NotBlank private String fullName;
    private String phone;
}