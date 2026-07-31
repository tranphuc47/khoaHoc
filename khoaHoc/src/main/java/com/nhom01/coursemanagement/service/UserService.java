// service/UserService.java
package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.request.*;
import com.nhom01.coursemanagement.dto.response.UserProfileResponse;
import com.nhom01.coursemanagement.entity.User;
import com.nhom01.coursemanagement.exception.*;
import com.nhom01.coursemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ===== STT 1: Admin xem danh sách toàn bộ user (có phân trang) =====
    public Page<UserProfileResponse> getAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    // ===== STT 2: Xem thông tin cá nhân của chính mình =====
    public UserProfileResponse getMyProfile() {
        return toResponse(getCurrentUser());
    }

    // ===== STT 3: Cập nhật thông tin cá nhân (chỉ fullName, phone) =====
    public UserProfileResponse updateMyProfile(UpdateProfileRequest req) {
        User user = getCurrentUser();
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        return toResponse(userRepository.save(user));
    }

    // ===== STT 4: Đổi mật khẩu — bắt buộc phải đúng mật khẩu cũ mới cho đổi =====
    public void changePassword(ChangePasswordRequest req) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new BusinessException("Mật khẩu cũ không đúng");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    // ===== STT 5: Admin khóa/mở tài khoản — đảo ngược giá trị enabled hiện tại =====
    public UserProfileResponse toggleEnabled(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user id=" + id));
        user.setEnabled(!user.getEnabled());
        return toResponse(userRepository.save(user));
    }

    // ---------- Helper ----------

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user hiện tại"));
    }

    private UserProfileResponse toResponse(User u) {
        return UserProfileResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .roleName(u.getRole().getName())
                .enabled(u.getEnabled())
                .createdAt(u.getCreatedAt())
                .build();
    }
}