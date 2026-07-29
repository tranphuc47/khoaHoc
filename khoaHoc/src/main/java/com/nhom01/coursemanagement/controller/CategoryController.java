// controller/CategoryController.java
package com.nhom01.coursemanagement.controller;

import com.nhom01.coursemanagement.dto.request.CategoryRequest;
import com.nhom01.coursemanagement.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/api/categories")
    public ResponseEntity<?> getAll(Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAll(pageable));
    }

    @GetMapping("/api/categories/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @PostMapping("/api/admin/categories")
    public ResponseEntity<?> create(@Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(categoryService.create(req));
    }

    @PutMapping("/api/admin/categories/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(categoryService.update(id, req));
    }

    @DeleteMapping("/api/admin/categories/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        categoryService.delete(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}