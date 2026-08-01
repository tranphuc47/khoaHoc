// service/CategoryService.java
package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.request.CategoryRequest;
import com.nhom01.coursemanagement.dto.response.CategoryResponse;
import com.nhom01.coursemanagement.entity.Category;
import com.nhom01.coursemanagement.exception.ResourceNotFoundException;
import com.nhom01.coursemanagement.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Page<CategoryResponse> getAll(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(this::toResponse);
    }

    public CategoryResponse getById(Integer id) {
        return toResponse(findEntity(id));
    }

    public CategoryResponse create(CategoryRequest req) {
        Category category = Category.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();
        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse update(Integer id, CategoryRequest req) {
        Category category = findEntity(id);
        category.setName(req.getName());
        category.setDescription(req.getDescription());
        return toResponse(categoryRepository.save(category));
    }

    public void delete(Integer id) {
        categoryRepository.delete(findEntity(id));
    }

    private Category findEntity(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục id=" + id));
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId()).name(c.getName())
                .description(c.getDescription()).createdAt(c.getCreatedAt())
                .build();
    }
}