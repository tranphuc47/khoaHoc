package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.request.ChapterRequest;
import com.nhom01.coursemanagement.dto.response.ChapterResponse;
import com.nhom01.coursemanagement.entity.Chapter;
import com.nhom01.coursemanagement.entity.Course;
import com.nhom01.coursemanagement.exception.ResourceNotFoundException;
import com.nhom01.coursemanagement.repository.ChapterRepository;
import com.nhom01.coursemanagement.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;

    // STT 1: lấy tất cả chapter của 1 course
    public List<ChapterResponse> getByCourseId(Integer courseId) {
        return chapterRepository.findByCourseIdOrderByChapterOrderAsc(courseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // STT 2: tạo chương mới, gắn vào course theo courseId trên URL
    public ChapterResponse create(Integer courseId, ChapterRequest req) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học id=" + courseId));

        Chapter chapter = Chapter.builder()
                .course(course)
                .title(req.getTitle())
                .chapterOrder(req.getChapterOrder() != null ? req.getChapterOrder() : 0)
                .build();

        return toResponse(chapterRepository.save(chapter));
    }

    // STT 3: sửa chương
    public ChapterResponse update(Integer id, ChapterRequest req) {
        Chapter chapter = findEntity(id);
        chapter.setTitle(req.getTitle());
        if (req.getChapterOrder() != null) chapter.setChapterOrder(req.getChapterOrder());
        return toResponse(chapterRepository.save(chapter));
    }

    // STT 4: xóa chương
    public void delete(Integer id) {
        chapterRepository.delete(findEntity(id));
    }

    private Chapter findEntity(Integer id) {
        return chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chương id=" + id));
    }

    private ChapterResponse toResponse(Chapter ch) {
        return ChapterResponse.builder()
                .id(ch.getId()).courseId(ch.getCourse().getId())
                .title(ch.getTitle()).chapterOrder(ch.getChapterOrder())
                .build();
    }
}
