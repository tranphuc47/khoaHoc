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

    // STT 1 — public
    @GetMapping("/api/courses/{courseId}/chapters")
    public ResponseEntity<?> getByCourse(@PathVariable Integer courseId) {
        return ResponseEntity.ok(chapterService.getByCourseId(courseId));
    }

    // STT 2 — ADMIN, INSTRUCTOR
    @PostMapping("/api/courses/{courseId}/chapters")
    public ResponseEntity<?> create(@PathVariable Integer courseId, @Valid @RequestBody ChapterRequest req) {
        return ResponseEntity.ok(chapterService.create(courseId, req));
    }

    // STT 3 — ADMIN, INSTRUCTOR
    @PutMapping("/api/chapters/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody ChapterRequest req) {
        return ResponseEntity.ok(chapterService.update(id, req));
    }

    // STT 4 — ADMIN, INSTRUCTOR
    @DeleteMapping("/api/chapters/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        chapterService.delete(id);
        return ResponseEntity.ok("Xóa chương thành công");
    }
}
