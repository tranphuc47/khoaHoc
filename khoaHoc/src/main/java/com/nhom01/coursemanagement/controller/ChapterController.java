// controller/ChapterController.java
package com.nhom01.coursemanagement.controller;

import com.nhom01.coursemanagement.dto.request.ChapterRequest;
import com.nhom01.coursemanagement.service.ChapterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    // Module 4 - STT 1: public, lấy danh sách chương theo courseId trên URL
    @GetMapping("/api/courses/{courseId}/chapters")
    public ResponseEntity<?> getByCourse(@PathVariable Integer courseId) {
        return ResponseEntity.ok(chapterService.getByCourseId(courseId));
    }

    // Module 4 - STT 2: ADMIN, INSTRUCTOR tạo chương mới trong course
    @PostMapping("/api/courses/{courseId}/chapters")
    public ResponseEntity<?> create(@PathVariable Integer courseId, @Valid @RequestBody ChapterRequest req) {
        return ResponseEntity.ok(chapterService.create(courseId, req));
    }

    // Module 4 - STT 3: ADMIN, INSTRUCTOR sửa chương
    @PutMapping("/api/chapters/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody ChapterRequest req) {
        return ResponseEntity.ok(chapterService.update(id, req));
    }

    // Module 4 - STT 4: ADMIN, INSTRUCTOR xóa chương
    @DeleteMapping("/api/chapters/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        chapterService.delete(id);
        return ResponseEntity.ok("Xóa chương thành công");
    }
}