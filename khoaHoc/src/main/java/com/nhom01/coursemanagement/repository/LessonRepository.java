// repository/LessonRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {

    // Dùng cho API "Lấy danh sách bài học của chương" — sắp xếp theo lesson_order tăng dần
    List<Lesson> findByChapterIdOrderByLessonOrderAsc(Integer chapterId);
}