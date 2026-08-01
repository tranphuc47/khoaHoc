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

    // STT 5 — public
    @GetMapping("/api/chapters/{chapterId}/lessons")
    public ResponseEntity<?> getByChapter(@PathVariable Integer chapterId) {
        return ResponseEntity.ok(lessonService.getByChapterId(chapterId));
    }

    // STT 6 — ADMIN, INSTRUCTOR
    @PostMapping("/api/chapters/{chapterId}/lessons")
    public ResponseEntity<?> create(@PathVariable Integer chapterId, @Valid @RequestBody LessonRequest req) {
        return ResponseEntity.ok(lessonService.create(chapterId, req));
    }

    // STT 7 — ADMIN, INSTRUCTOR
    @PutMapping("/api/lessons/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody LessonRequest req) {
        return ResponseEntity.ok(lessonService.update(id, req));
    }

    // STT 8 — ADMIN, INSTRUCTOR
    @DeleteMapping("/api/lessons/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        lessonService.delete(id);
        return ResponseEntity.ok("Xóa bài học thành công");
    }
}
