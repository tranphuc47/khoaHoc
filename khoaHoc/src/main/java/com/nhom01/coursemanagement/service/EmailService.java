// service/EmailService.java
package com.nhom01.coursemanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // @Async: gửi mail chạy nền, không làm chậm response trả về cho client,
    // và lỗi gửi mail (VD: SMTP sai cấu hình) sẽ KHÔNG làm rollback giao dịch thanh toán đã lưu DB
    @Async
    public void sendPaymentConfirmation(String toEmail, String fullName, String courseTitle,
                                        BigDecimal amount, String transactionCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("trandinhphuc3003@gmail.com");  // email cùng với spring.mail.username
            message.setTo(toEmail);
            message.setSubject("Xác nhận thanh toán khóa học thành công");
            message.setText(String.format(
                    "Xin chào %s,\n\n" +
                            "Bạn đã thanh toán thành công khóa học: %s\n" +
                            "Số tiền: %,.0f VNĐ\n" +
                            "Mã giao dịch: %s\n\n" +
                            "Cảm ơn bạn đã đăng ký!",
                    fullName, courseTitle, amount, transactionCode
            ));
            mailSender.send(message);
            log.info("Đã gửi email xác nhận thanh toán tới {}", toEmail);
        } catch (Exception e) {
            // Không throw lại exception — tránh làm hỏng luồng nghiệp vụ chính nếu chỉ lỗi gửi mail
            log.error("Gửi email thất bại tới {}: {}", toEmail, e.getMessage());
        }
    }
}