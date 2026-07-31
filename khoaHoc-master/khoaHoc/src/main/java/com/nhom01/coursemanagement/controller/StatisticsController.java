package com.nhom01.coursemanagement.controller;

import com.nhom01.coursemanagement.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    // API 1 - ADMIN: dashboard tổng quan toàn hệ thống
    @GetMapping("/api/admin/statistics/overview")
    public ResponseEntity<?> getOverview() {
        return ResponseEntity.ok(statisticsService.getOverview());
    }

    // API 2 - ADMIN: thống kê số khóa học tạo mới và lượt ghi danh theo tháng
    @GetMapping("/api/admin/statistics/courses/monthly")
    public ResponseEntity<?> getMonthlyCourseStatistics(@RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(statisticsService.getMonthlyCourseStatistics(year));
    }

    // API 3 - INSTRUCTOR + ADMIN: thống kê tổng quan của instructor đang đăng nhập
    @GetMapping("/api/instructor/statistics")
    public ResponseEntity<?> getMyStatistics() {
        return ResponseEntity.ok(statisticsService.getMyStatistics());
    }

    // API 4 - INSTRUCTOR + ADMIN: thống kê bài học đã đăng và lượt ghi danh theo tháng
    @GetMapping("/api/instructor/statistics/activity/monthly")
    public ResponseEntity<?> getMyMonthlyActivity(@RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(statisticsService.getMyMonthlyActivity(year));
    }

    // API 5 - STUDENT: thống kê số khóa học và số môn/danh mục học viên đang học
    @GetMapping("/api/student/statistics")
    public ResponseEntity<?> getMyLearningStatistics() {
        return ResponseEntity.ok(statisticsService.getMyLearningStatistics());
    }
}
