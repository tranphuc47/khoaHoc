// repository/ChapterRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Integer> {

    // Dùng cho API "Lấy danh sách chương của khóa học" — sắp xếp theo chapter_order tăng dần
    List<Chapter> findByCourseIdOrderByChapterOrderAsc(Integer courseId);
}