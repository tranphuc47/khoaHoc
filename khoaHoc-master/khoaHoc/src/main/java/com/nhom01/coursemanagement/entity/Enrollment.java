// entity/Enrollment.java
package com.nhom01.coursemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = @UniqueConstraint(name = "unique_enrollment", columnNames = {"user_id", "course_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Khóa ngoại tới User — sinh viên đăng ký
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Khóa ngoại tới Course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.PENDING;

    @Column(name = "enrolled_date")
    private LocalDateTime enrolledDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @PrePersist
    void onCreate() { enrolledDate = LocalDateTime.now(); }

    public enum EnrollmentStatus { PENDING, ACTIVE, COMPLETED, CANCELLED }
}