// service/CourseService.java
package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.request.*;
import com.nhom01.coursemanagement.dto.response.*;
import com.nhom01.coursemanagement.entity.*;
import com.nhom01.coursemanagement.exception.*;
import com.nhom01.coursemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    // ===== STT 1: Lấy danh sách khóa học (public) — chỉ trả về course đã PUBLISHED, có phân trang =====
    public Page<CourseResponse> getAllPublished(Pageable pageable) {
        return courseRepository.findByStatus(Course.CourseStatus.PUBLISHED, pageable)
                .map(c -> toResponse(c, false));
    }

    // Admin xem toàn bộ khóa học (mọi trạng thái) để duyệt DRAFT -> PUBLISHED
    public Page<CourseResponse> getAllForAdmin(Pageable pageable) {
        return courseRepository.findAll(pageable).map(c -> toResponse(c, false));
    }

    // ===== STT 2: Lấy khóa học theo ID (public) — kèm chapters + lessons bên trong =====
    public CourseResponse getById(Integer id) {
        Course course = findEntity(id);
        return toResponse(course, true); // true = load kèm chapters & lessons
    }

    // ===== STT 6: Tìm kiếm khóa học theo keyword (title hoặc category name) =====
    public Page<CourseResponse> search(String keyword, Pageable pageable) {
        return courseRepository.searchByKeyword(keyword, pageable)
                .map(c -> toResponse(c, false));
    }

    // ===== STT 7: Lấy khóa học do giảng viên đang đăng nhập tạo =====
    public Page<CourseResponse> getMyCourses(Pageable pageable) {
        User currentUser = getCurrentUser();
        return courseRepository.findByInstructorId(currentUser.getId(), pageable)
                .map(c -> toResponse(c, false));
    }

    // ===== STT 3: Tạo khóa học mới (ADMIN, INSTRUCTOR) =====
    // Course mới luôn ở trạng thái DRAFT — instructor_id lấy từ user đang đăng nhập, không cho client tự truyền
    public CourseResponse create(CourseCreateRequest req) {
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục id=" + req.getCategoryId()));
        User instructor = getCurrentUser();

        Course course = Course.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .thumbnailUrl(req.getThumbnailUrl())
                .price(req.getPrice())
                .category(category)
                .instructor(instructor)
                .status(Course.CourseStatus.DRAFT)
                .build();

        return toResponse(courseRepository.save(course), false);
    }

    // ===== STT 4: Cập nhật khóa học (ADMIN hoặc INSTRUCTOR sở hữu course đó) =====
    public CourseResponse update(Integer id, CourseUpdateRequest req) {
        Course course = findEntity(id);
        checkOwnership(course); // chặn nếu không phải ADMIN và không phải chủ course

        course.setTitle(req.getTitle());
        course.setDescription(req.getDescription());
        course.setThumbnailUrl(req.getThumbnailUrl());
        if (req.getPrice() != null) course.setPrice(req.getPrice());
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
            course.setCategory(category);
        }
        // Chỉ ADMIN mới được đổi status (VD: duyệt DRAFT -> PUBLISHED)
        if (req.getStatus() != null && isAdmin()) {
            course.setStatus(Course.CourseStatus.valueOf(req.getStatus()));
        }

        return toResponse(courseRepository.save(course), false);
    }

    // ===== STT 5: Xóa khóa học (ADMIN hoặc INSTRUCTOR sở hữu course đó) =====
    public void delete(Integer id) {
        Course course = findEntity(id);
        checkOwnership(course);
        courseRepository.delete(course);
    }

    // ---------- Helper methods dùng nội bộ ----------

    private Course findEntity(Integer id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học id=" + id));
    }

    // Lấy user đang đăng nhập từ SecurityContext (do JwtAuthenticationFilter set vào trước đó)
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user hiện tại"));
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // Kiểm tra quyền sửa/xóa: phải là ADMIN, hoặc là chính instructor đã tạo ra course đó
    private void checkOwnership(Course course) {
        if (isAdmin()) return;
        User currentUser = getCurrentUser();
        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BusinessException("Bạn không có quyền thao tác trên khóa học này");
        }
    }

    // Chuyển Entity -> Response DTO. includeContent=true thì load kèm chapters + lessons (dùng cho API chi tiết)
    private CourseResponse toResponse(Course c, boolean includeContent) {
        CourseResponse.CourseResponseBuilder builder = CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .thumbnailUrl(c.getThumbnailUrl())
                .price(c.getPrice())
                .status(c.getStatus().name())
                .categoryId(c.getCategory() != null ? c.getCategory().getId() : null)
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .instructorId(c.getInstructor() != null ? c.getInstructor().getId() : null)
                .instructorName(c.getInstructor() != null ? c.getInstructor().getFullName() : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt());

        if (includeContent) {
            List<ChapterResponse> chapters = chapterRepository.findByCourseIdOrderByChapterOrderAsc(c.getId())
                    .stream().map(this::toChapterResponseWithLessons).collect(Collectors.toList());
            builder.chapters(chapters);
        }
        return builder.build();
    }

    private ChapterResponse toChapterResponseWithLessons(Chapter ch) {
        List<LessonResponse> lessons = lessonRepository.findByChapterIdOrderByLessonOrderAsc(ch.getId())
                .stream().map(l -> LessonResponse.builder()
                        .id(l.getId()).chapterId(ch.getId()).title(l.getTitle())
                        .content(l.getContent()).videoUrl(l.getVideoUrl()).lessonOrder(l.getLessonOrder())
                        .build())
                .collect(Collectors.toList());

        return ChapterResponse.builder()
                .id(ch.getId()).courseId(ch.getCourse().getId())
                .title(ch.getTitle()).chapterOrder(ch.getChapterOrder())
                .lessons(lessons)
                .build();
    }
}