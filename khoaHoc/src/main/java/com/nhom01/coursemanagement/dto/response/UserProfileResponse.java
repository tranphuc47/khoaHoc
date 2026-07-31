// dto/response/UserProfileResponse.java
package com.nhom01.coursemanagement.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserProfileResponse {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String roleName;
    private Boolean enabled;
    private LocalDateTime createdAt;
}