package com.nhom01.coursemanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Chỉ cần @EnableAsync là đủ để Spring nhận diện @Async trong EmailService.
    // Không cần cấu hình thêm gì khác cho project ở mức đồ án môn học.
}