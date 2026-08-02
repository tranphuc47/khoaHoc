// dto/response/AuthResponse.java
package com.nhom01.coursemanagement.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    @Builder.Default private String tokenType = "Bearer";
    private String username;
}