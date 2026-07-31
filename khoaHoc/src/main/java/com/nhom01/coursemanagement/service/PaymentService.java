// service/PaymentService.java
package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.response.PaymentResponse;
import com.nhom01.coursemanagement.entity.*;
import com.nhom01.coursemanagement.exception.*;
import com.nhom01.coursemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // @Transactional: gộp 2 bước ghi DB (tạo Payment + cập nhật status Enrollment) thành 1 khối
    // "tất cả hoặc không gì cả" — nếu bước cập nhật Enrollment lỗi, Payment vừa tạo cũng tự rollback,
    // tránh tình trạng "đã có bản ghi thanh toán SUCCESS nhưng ghi danh vẫn PENDING"
    @Transactional
    public PaymentResponse confirmPayment(Integer enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ghi danh id=" + enrollmentId));

        // Chỉ chính student sở hữu ghi danh này mới được xác nhận thanh toán của mình
        User currentUser = getCurrentUser();
        if (!enrollment.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException("Bạn không có quyền thanh toán cho ghi danh này");
        }

        if (enrollment.getStatus() != Enrollment.EnrollmentStatus.PENDING) {
            throw new BusinessException("Ghi danh này không ở trạng thái chờ thanh toán");
        }

        paymentRepository.findByEnrollmentId(enrollmentId).ifPresent(p -> {
            if (p.getStatus() == Payment.PaymentStatus.SUCCESS) {
                throw new BusinessException("Ghi danh này đã được thanh toán trước đó");
            }
        });

        // Giả lập cổng thanh toán: sinh mã giao dịch, đánh dấu SUCCESS ngay
        // (Thực tế sẽ gọi API cổng thanh toán thật ở đây, ví dụ VNPay/Momo callback)
        Payment payment = Payment.builder()
                .enrollment(enrollment)
                .amount(enrollment.getCourse().getPrice())
                .transactionCode("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status(Payment.PaymentStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // Thanh toán xong -> ghi danh chuyển từ PENDING sang ACTIVE
        enrollment.setStatus(Enrollment.EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(enrollment);

        // Gửi email xác nhận (chạy async, không ảnh hưởng transaction phía trên)
        emailService.sendPaymentConfirmation(
                currentUser.getEmail(), currentUser.getFullName(),
                enrollment.getCourse().getTitle(), payment.getAmount(), payment.getTransactionCode()
        );

        return toResponse(payment);
    }

    public PaymentResponse getByEnrollmentId(Integer enrollmentId) {
        Payment payment = paymentRepository.findByEnrollmentId(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa có thanh toán cho ghi danh id=" + enrollmentId));
        return toResponse(payment);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user hiện tại"));
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .enrollmentId(p.getEnrollment().getId())
                .courseTitle(p.getEnrollment().getCourse().getTitle())
                .amount(p.getAmount())
                .transactionCode(p.getTransactionCode())
                .status(p.getStatus().name())
                .paidAt(p.getPaidAt())
                .build();
    }
}