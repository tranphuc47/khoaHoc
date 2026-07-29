// controller/LessonController.java
package com.nhom01.coursemanagement.controller;

import com.nhom01.coursemanagement.dto.request.LessonRequest;
import com.nhom01.coursemanagement.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    // Module 4 - STT 5: public, lấy danh sách bài học theo chapterId trên URL
    @GetMapping("/api/chapters/{chapterId}/lessons")
    public ResponseEntity<?> getByChapter(@PathVariable Integer chapterId) {
        return ResponseEntity.ok(lessonService.getByChapterId(chapterId));
    }

    // Module 4 - STT 6: ADMIN, INSTRUCTOR tạo bài học mới trong chương
    @PostMapping("/api/chapters/{chapterId}/lessons")
    public ResponseEntity<?> create(@PathVariable Integer chapterId, @Valid @RequestBody LessonRequest req) {
        return ResponseEntity.ok(lessonService.create(chapterId, req));
    }

    // Module 4 - STT 7: ADMIN, INSTRUCTOR sửa bài học
    @PutMapping("/api/lessons/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody LessonRequest req) {
        return ResponseEntity.ok(lessonService.update(id, req));
    }

    // Module 4 - STT 8: ADMIN, INSTRUCTOR xóa bài học
    @DeleteMapping("/api/lessons/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        lessonService.delete(id);
        return ResponseEntity.ok("Xóa bài học thành công");
    }
}