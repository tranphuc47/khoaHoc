// entity/Chapter.java
package com.nhom01.coursemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chapters")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Khóa ngoại tới Course — 1 course có nhiều chapter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "chapter_order")
    @Builder.Default
    private Integer chapterOrder = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}