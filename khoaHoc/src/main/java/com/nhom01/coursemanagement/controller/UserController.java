// controller/UserController.java
package com.nhom01.coursemanagement.controller;

import com.nhom01.coursemanagement.dto.request.*;
import com.nhom01.coursemanagement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // STT 1 — ADMIN xem danh sách toàn bộ user
    @GetMapping("/api/admin/users")
    public ResponseEntity<?> getAll(Pageable pageable) {
        return ResponseEntity.ok(userService.getAll(pageable));
    }

    // STT 2 — Tất cả role đã đăng nhập xem profile của mình
    @GetMapping("/api/users/profile")
    public ResponseEntity<?> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    // STT 3 — Cập nhật profile của mình
    @PutMapping("/api/users/profile")
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateMyProfile(req));
    }

    // STT 4 — Đổi mật khẩu
    @PutMapping("/api/users/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(req);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    // STT 5 — ADMIN khóa/mở tài khoản
    @PutMapping("/api/admin/users/{id}/toggle")
    public ResponseEntity<?> toggleEnabled(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.toggleEnabled(id));
    }
}