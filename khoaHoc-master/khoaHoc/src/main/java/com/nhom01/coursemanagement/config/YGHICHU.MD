SecurityConfig.java – cấu hình bảo mật, phân quyền.

JwtTokenProvider.java – tạo và xác thực JWT.

JwtAuthenticationFilter.java – lọc token trong mỗi request.

CustomUserDetailsService.java – load user từ database.

AuthController.java – API đăng ký, đăng nhập.

AuthService.java – xử lý logic đăng ký/đăng nhập.

Các DTO (LoginRequest, RegisterRequest, AuthResponse) – bạn đã có, tôi sẽ bổ sung nếu thiếu.