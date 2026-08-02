package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    // STT 1: lấy chapter theo course, sort theo thứ tự hiển thị
    List<Chapter> findByCourseIdOrderByChapterOrderAsc(Integer courseId);
}
