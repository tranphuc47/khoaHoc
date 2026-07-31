package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    // STT 5: lấy lesson theo chapter, sort theo thứ tự hiển thị
    List<Lesson> findByChapterIdOrderByLessonOrderAsc(Integer chapterId);

    // Module Statistics: đếm số bài học mà instructor đã đăng trong các course của mình
    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.chapter.course.instructor.id = :instructorId")
    long countLessonsByInstructor(@Param("instructorId") Integer instructorId);

    // Module Statistics: thống kê số bài học instructor đăng theo từng tháng trong 1 năm
    // Trả về mảng [year, month, lessonCount] cho từng tháng có dữ liệu
    @Query("SELECT FUNCTION('YEAR', l.createdAt), FUNCTION('MONTH', l.createdAt), COUNT(l) " +
           "FROM Lesson l " +
           "WHERE l.chapter.course.instructor.id = :instructorId AND FUNCTION('YEAR', l.createdAt) = :year " +
           "GROUP BY FUNCTION('YEAR', l.createdAt), FUNCTION('MONTH', l.createdAt) " +
           "ORDER BY FUNCTION('MONTH', l.createdAt)")
    List<Object[]> getMonthlyLessonsByInstructor(@Param("instructorId") Integer instructorId,
                                                 @Param("year") int year);
}
