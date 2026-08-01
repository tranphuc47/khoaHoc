package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.request.LessonRequest;
import com.nhom01.coursemanagement.dto.response.LessonResponse;
import com.nhom01.coursemanagement.entity.Chapter;
import com.nhom01.coursemanagement.entity.Lesson;
import com.nhom01.coursemanagement.exception.ResourceNotFoundException;
import com.nhom01.coursemanagement.repository.ChapterRepository;
import com.nhom01.coursemanagement.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;

    // STT 5: lấy tất cả lesson của 1 chapter
    public List<LessonResponse> getByChapterId(Integer chapterId) {
        return lessonRepository.findByChapterIdOrderByLessonOrderAsc(chapterId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // STT 6: tạo bài học mới, gắn vào chapter theo chapterId trên URL
    public LessonResponse create(Integer chapterId, LessonRequest req) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chương id=" + chapterId));

        Lesson lesson = Lesson.builder()
                .chapter(chapter)
                .title(req.getTitle())
                .content(req.getContent())
                .videoUrl(req.getVideoUrl())
                .lessonOrder(req.getLessonOrder() != null ? req.getLessonOrder() : 0)
                .build();

        return toResponse(lessonRepository.save(lesson));
    }

    // STT 7: sửa bài học
    public LessonResponse update(Integer id, LessonRequest req) {
        Lesson lesson = findEntity(id);
        lesson.setTitle(req.getTitle());
        lesson.setContent(req.getContent());
        lesson.setVideoUrl(req.getVideoUrl());
        if (req.getLessonOrder() != null) lesson.setLessonOrder(req.getLessonOrder());
        return toResponse(lessonRepository.save(lesson));
    }

    // STT 8: xóa bài học
    public void delete(Integer id) {
        lessonRepository.delete(findEntity(id));
    }

    private Lesson findEntity(Integer id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài học id=" + id));
    }

    private LessonResponse toResponse(Lesson l) {
        return LessonResponse.builder()
                .id(l.getId()).chapterId(l.getChapter().getId())
                .title(l.getTitle()).content(l.getContent())
                .videoUrl(l.getVideoUrl()).lessonOrder(l.getLessonOrder())
                .build();
    }
}
