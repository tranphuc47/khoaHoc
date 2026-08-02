package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.response.*;
import com.nhom01.coursemanagement.entity.*;
import com.nhom01.coursemanagement.exception.ResourceNotFoundException;
import com.nhom01.coursemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.Year;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentService enrollmentService; // tái dùng getStatistics() đã viết ở Module 5

    // ===== API 1: Dashboard tổng quan cho ADMIN =====
    // Truy vấn COUNT từ users, courses, categories, lessons, enrollments; không load toàn bộ dữ liệu ra RAM
    public AdminOverviewResponse getOverview() {
        return AdminOverviewResponse.builder()
                .totalUsers(userRepository.count())
                .totalStudents(userRepository.countByRole_Name("STUDENT"))
                .totalInstructors(userRepository.countByRole_Name("INSTRUCTOR"))
                .totalAdmins(userRepository.countByRole_Name("ADMIN"))

                .totalCourses(courseRepository.count())
                .totalDraftCourses(courseRepository.countByStatus(Course.CourseStatus.DRAFT))
                .totalPublishedCourses(courseRepository.countByStatus(Course.CourseStatus.PUBLISHED))
                .totalArchivedCourses(courseRepository.countByStatus(Course.CourseStatus.ARCHIVED))

                .totalCategories(categoryRepository.count())
                .totalLessons(lessonRepository.count())

                .totalEnrollments(enrollmentRepository.count())
                .totalPendingEnrollments(enrollmentRepository.countByStatus(Enrollment.EnrollmentStatus.PENDING))
                .totalActiveEnrollments(enrollmentRepository.countByStatus(Enrollment.EnrollmentStatus.ACTIVE))
                .totalCompletedEnrollments(enrollmentRepository.countByStatus(Enrollment.EnrollmentStatus.COMPLETED))
                .totalCancelledEnrollments(enrollmentRepository.countByStatus(Enrollment.EnrollmentStatus.CANCELLED))
                .build();
    }

    // ===== API 2: Thống kê course + ghi danh theo từng tháng trong 1 năm cho ADMIN =====
    // Query 1: GROUP BY courses.createdAt để đếm số khóa học được tạo theo tháng
    // Query 2: GROUP BY enrollments.enrolledDate để đếm số lượt ghi danh theo tháng
    // DB chỉ trả về tháng có dữ liệu, service tự điền đủ 12 tháng để UI vẽ biểu đồ ổn định
    public List<MonthlyCourseStatisticResponse> getMonthlyCourseStatistics(Integer year) {
        int targetYear = year != null ? year : Year.now().getValue();
        List<MonthlyCourseStatisticResponse> result = initMonthlyCourseResult(targetYear);

        for (Object[] row : courseRepository.getMonthlyCreatedCourses(targetYear)) {
            int month = ((Number) row[1]).intValue();
            MonthlyCourseStatisticResponse current = result.get(month - 1);
            current.setCreatedCourseCount(((Number) row[2]).longValue());
        }

        for (Object[] row : enrollmentRepository.getMonthlyEnrollments(targetYear)) {
            int month = ((Number) row[1]).intValue();
            MonthlyCourseStatisticResponse current = result.get(month - 1);
            current.setEnrollmentCount(((Number) row[2]).longValue());
        }
        return result;
    }

    // ===== API 3: Thống kê riêng của Instructor đang đăng nhập =====
    // Query riêng: đếm course, học viên distinct, lesson; chi tiết từng course tái dùng Module 5
    public InstructorStatisticsResponse getMyStatistics() {
        User currentUser = getCurrentUser();

        return InstructorStatisticsResponse.builder()
                .totalCourses(courseRepository.countByInstructorId(currentUser.getId()))
                .totalStudents(enrollmentRepository.countDistinctStudentsByInstructor(currentUser.getId()))
                .totalLessons(lessonRepository.countLessonsByInstructor(currentUser.getId()))
                .courseDetails(enrollmentService.getStatistics())
                .build();
    }

    // ===== API 4: Thống kê hoạt động instructor theo tháng =====
    // Query 1: GROUP BY lessons.createdAt để đếm số bài học instructor đã đăng theo tháng
    // Query 2: GROUP BY enrollments.enrolledDate để đếm lượt ghi danh vào course của instructor theo tháng
    public List<MonthlyInstructorActivityResponse> getMyMonthlyActivity(Integer year) {
        User currentUser = getCurrentUser();
        int targetYear = year != null ? year : Year.now().getValue();
        List<MonthlyInstructorActivityResponse> result = initMonthlyInstructorResult(targetYear);

        for (Object[] row : lessonRepository.getMonthlyLessonsByInstructor(currentUser.getId(), targetYear)) {
            int month = ((Number) row[1]).intValue();
            result.get(month - 1).setLessonCount(((Number) row[2]).longValue());
        }

        for (Object[] row : enrollmentRepository.getMonthlyEnrollmentsByInstructor(currentUser.getId(), targetYear)) {
            int month = ((Number) row[1]).intValue();
            result.get(month - 1).setEnrollmentCount(((Number) row[2]).longValue());
        }
        return result;
    }

    // ===== API 5: Thống kê số môn/khóa học của Student đang đăng nhập =====
    // Query enrollments theo user và status; count distinct category để ra số môn học
    public StudentLearningStatisticsResponse getMyLearningStatistics() {
        User currentUser = getCurrentUser();
        Integer userId = currentUser.getId();

        return StudentLearningStatisticsResponse.builder()
                .totalCourses(enrollmentRepository.findByUserId(userId, Pageable.unpaged()).getTotalElements())
                .totalSubjects(enrollmentRepository.countDistinctCategoriesByStudent(userId, Arrays.asList(
                        Enrollment.EnrollmentStatus.ACTIVE,
                        Enrollment.EnrollmentStatus.COMPLETED
                )))
                .pendingCourses(enrollmentRepository.countByUserIdAndStatus(userId, Enrollment.EnrollmentStatus.PENDING))
                .activeCourses(enrollmentRepository.countByUserIdAndStatus(userId, Enrollment.EnrollmentStatus.ACTIVE))
                .completedCourses(enrollmentRepository.countByUserIdAndStatus(userId, Enrollment.EnrollmentStatus.COMPLETED))
                .cancelledCourses(enrollmentRepository.countByUserIdAndStatus(userId, Enrollment.EnrollmentStatus.CANCELLED))
                .build();
    }

    private List<MonthlyCourseStatisticResponse> initMonthlyCourseResult(int year) {
        List<MonthlyCourseStatisticResponse> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            result.add(MonthlyCourseStatisticResponse.builder()
                    .year(year)
                    .month(month)
                    .createdCourseCount(0)
                    .enrollmentCount(0)
                    .build());
        }
        return result;
    }

    private List<MonthlyInstructorActivityResponse> initMonthlyInstructorResult(int year) {
        List<MonthlyInstructorActivityResponse> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            result.add(MonthlyInstructorActivityResponse.builder()
                    .year(year)
                    .month(month)
                    .lessonCount(0)
                    .enrollmentCount(0)
                    .build());
        }
        return result;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user hiện tại"));
    }
}
