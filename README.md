# Hệ thống Quản lý Khóa học - Nhóm 01

## Công nghệ

**Backend:** Java 17, Spring Boot 3.4, Spring Security JWT, JPA, MySQL, Redis, Apache POI, JavaMail  
**Frontend:** html css 
**DevOps:** Docker Compose, GitHub Actions CI/CD

## Cấu trúc dự án

```
khoaHoc/          # Backend Spring Boot
frontend/         # Frontend Vue 3
docker-compose.yml
.github/workflows/ci.yml
```

## Chạy local

### 1. Backend
```bash
cd khoaHoc
# Cần MySQL (localhost:3306, user/pass: root/root) và Redis (6379)
./mvnw spring-boot:run
```

Swagger: http://localhost:8080/swagger-ui.html

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

### 3. Docker Compose (toàn bộ hệ thống)
```bash
docker-compose up --build
```

## Tài khoản demo

| Username   | Password      | Vai trò    |
|------------|---------------|------------|
| admin      | admin123      | ADMIN      |
| instructor | instructor123 | INSTRUCTOR |
| student    | student123    | STUDENT    |

## Tính năng chính

- **Admin:** CRUD người dùng, danh mục, duyệt khóa học, thống kê biểu đồ
- **Giảng viên:** Tạo/sửa khóa học, quản lý chương/bài học, nhập điểm, upload tài liệu, xuất Excel
- **Sinh viên:** Xem/đăng ký/hủy khóa học, theo dõi tiến độ, xem điểm

## Tính năng nâng cao

- Xuất báo cáo Excel (Apache POI)
- Biểu đồ thống kê (ECharts)
- Gửi email thông báo (JavaMailSender)
- Cache khóa học hot (Redis)
- Upload tài liệu PDF/video
- Docker Compose + CI/CD GitHub Actions

Folder PATH listing for volume New Volume
Volume serial number is 00000043 2463:169A
D:.
│   README.md
│   
├───.github
├───.idea
│       .gitignore
│       compiler.xml
│       encodings.xml
│       jarRepositories.xml
│       khoaHoc.iml
│       misc.xml
│       modules.xml
│       vcs.xml
│       workspace.xml
│       
└───khoaHoc
│   .gitattributes
│   .gitignore
│   Dockerfile
│   HELP.md
│   mvnw
│   mvnw.cmd
│   pom.xml
│   
├───.mvn
│   └───wrapper
│           maven-wrapper.properties
│           
├───src
│   ├───main
│   │   ├───java
│   │   │   └───com
│   │   │       └───nhom01
│   │   │           └───coursemanagement
│   │   │               │   CourseManagementApplication.java
│   │   │               │   
│   │   │               ├───config
│   │   │               │       AsyncConfig.java
│   │   │               │       DataInitializer.java
│   │   │               │       RedisConfig.java
│   │   │               │       SecurityConfig.java
│   │   │               │       SwaggerConfig.java
│   │   │               │       WebConfig.java
│   │   │               │       
│   │   │               ├───constant
│   │   │               │       AttendanceStatus.java
│   │   │               │       CourseStatus.java
│   │   │               │       EnrollmentStatus.java
│   │   │               │       MaterialType.java
│   │   │               │       RoleEnum.java
│   │   │               │       
│   │   │               ├───controller
│   │   │               │       AuthController.java
│   │   │               │       CategoryController.java
│   │   │               │       ChapterController.java
│   │   │               │       CourseController.java
│   │   │               │       EnrollmentController.java
│   │   │               │       GradeController.java
│   │   │               │       StatisticController.java
│   │   │               │       UserController.java
│   │   │               │       
│   │   │               ├───dto
│   │   │               │   ├───request
│   │   │               │   │       AdminUserRequest.java
│   │   │               │   │       CategoryRequest.java
│   │   │               │   │       ChangePasswordRequest.java
│   │   │               │   │       ChapterRequest.java
│   │   │               │   │       CourseCreateRequest.java
│   │   │               │   │       CourseUpdateRequest.java
│   │   │               │   │       GradeRequest.java
│   │   │               │   │       LessonRequest.java
│   │   │               │   │       LoginRequest.java
│   │   │               │   │       RegisterRequest.java
│   │   │               │   │       UserUpdateRequest.java
│   │   │               │   │       
│   │   │               │   └───response
│   │   │               │           AuthResponse.java
│   │   │               │           CategoryResponse.java
│   │   │               │           ChapterResponse.java
│   │   │               │           CourseMaterialResponse.java
│   │   │               │           CourseResponse.java
│   │   │               │           EnrollmentResponse.java
│   │   │               │           GradeResponse.java
│   │   │               │           LessonResponse.java
│   │   │               │           PageResponse.java
│   │   │               │           StatisticResponse.java
│   │   │               │           UserResponse.java
│   │   │               │           
│   │   │               ├───entity
│   │   │               │       Attendance.java
│   │   │               │       Category.java
│   │   │               │       Chapter.java
│   │   │               │       Course.java
│   │   │               │       CourseMaterial.java
│   │   │               │       Enrollment.java
│   │   │               │       Grade.java
│   │   │               │       Lesson.java
│   │   │               │       Notification.java
│   │   │               │       Permission.java
│   │   │               │       Role.java
│   │   │               │       User.java
│   │   │               │       
│   │   │               ├───exception
│   │   │               │       BusinessException.java
│   │   │               │       ErrorResponse.java
│   │   │               │       GlobalExceptionHandler.java
│   │   │               │       ResourceNotFoundException.java
│   │   │               │       
│   │   │               ├───mapper
│   │   │               │       CategoryMapper.java
│   │   │               │       ContentMapper.java
│   │   │               │       CourseMapper.java
│   │   │               │       UserMapper.java
│   │   │               │       
│   │   │               ├───repository
│   │   │               │       CategoryRepository.java
│   │   │               │       ChapterRepository.java
│   │   │               │       CourseMaterialRepository.java
│   │   │               │       CourseRepository.java
│   │   │               │       EnrollmentRepository.java
│   │   │               │       GradeRepository.java
│   │   │               │       LessonRepository.java
│   │   │               │       NotificationRepository.java
│   │   │               │       PermissionRepository.java
│   │   │               │       RoleRepository.java
│   │   │               │       UserRepository.java
│   │   │               │       
│   │   │               ├───security
│   │   │               │       CustomUserDetailsService.java
│   │   │               │       JwtAuthenticationFilter.java
│   │   │               │       JwtTokenProvider.java
│   │   │               │       SecurityConstants.java
│   │   │               │       
│   │   │               ├───service
│   │   │               │       AuthService.java
│   │   │               │       CategoryService.java
│   │   │               │       ChapterService.java
│   │   │               │       CourseMaterialService.java
│   │   │               │       CourseService.java
│   │   │               │       EmailService.java
│   │   │               │       EnrollmentService.java
│   │   │               │       GradeService.java
│   │   │               │       StatisticService.java
│   │   │               │       UserService.java
│   │   │               │       
│   │   │               └───util
│   │   │                       ExcelExportUtil.java
│   │   │                       FileUploadUtil.java
│   │   │                       
│   │   └───resources
│   │       │   application.properties
│   │       │   
│   │       ├───db
│   │       │   └───migration
│   │       │           V1__init_database.sql
│   │       │           
│   │       ├───static
│   │       └───templates
│   └───test
│       └───java
│           └───com
│               ├───example
│               │   └───khoaHoc
│               └───nhom01
│                   └───coursemanagement
│                           CourseManagementApplicationTests.java
│                           
└───target
├───classes
│   │   application-dev.properties
│   │   application-prod.properties
│   │   application.properties
│   │   
│   ├───com
│   │   └───nhom01
│   │       └───coursemanagement
│   │           │   CourseManagementApplication.class
│   │           │   
│   │           ├───config
│   │           │       AsyncConfig.class
│   │           │       DataInitializer.class
│   │           │       RedisConfig.class
│   │           │       SecurityConfig.class
│   │           │       SwaggerConfig.class
│   │           │       WebConfig.class
│   │           │       
│   │           ├───constant
│   │           │       AttendanceStatus.class
│   │           │       CourseStatus.class
│   │           │       EnrollmentStatus.class
│   │           │       MaterialType.class
│   │           │       RoleEnum.class
│   │           │       
│   │           ├───controller
│   │           │       AuthController.class
│   │           │       CategoryController.class
│   │           │       ChapterController.class
│   │           │       CourseController.class
│   │           │       EnrollmentController.class
│   │           │       GradeController.class
│   │           │       StatisticController.class
│   │           │       UserController.class
│   │           │       
│   │           ├───dto
│   │           │   ├───request
│   │           │   │       AdminUserRequest.class
│   │           │   │       CategoryRequest.class
│   │           │   │       ChangePasswordRequest.class
│   │           │   │       ChapterRequest.class
│   │           │   │       CourseCreateRequest.class
│   │           │   │       CourseUpdateRequest.class
│   │           │   │       GradeRequest.class
│   │           │   │       LessonRequest.class
│   │           │   │       LoginRequest.class
│   │           │   │       RegisterRequest.class
│   │           │   │       UserUpdateRequest.class
│   │           │   │       
│   │           │   └───response
│   │           │           AuthResponse$AuthResponseBuilder.class
│   │           │           AuthResponse.class
│   │           │           CategoryResponse$CategoryResponseBuilder.class
│   │           │           CategoryResponse.class
│   │           │           ChapterResponse$ChapterResponseBuilder.class
│   │           │           ChapterResponse.class
│   │           │           CourseMaterialResponse$CourseMaterialResponseBuilder.class
│   │           │           CourseMaterialResponse.class
│   │           │           CourseResponse$CourseResponseBuilder.class
│   │           │           CourseResponse.class
│   │           │           EnrollmentResponse$EnrollmentResponseBuilder.class
│   │           │           EnrollmentResponse.class
│   │           │           GradeResponse$GradeResponseBuilder.class
│   │           │           GradeResponse.class
│   │           │           LessonResponse$LessonResponseBuilder.class
│   │           │           LessonResponse.class
│   │           │           PageResponse$PageResponseBuilder.class
│   │           │           PageResponse.class
│   │           │           StatisticResponse$StatisticResponseBuilder.class
│   │           │           StatisticResponse.class
│   │           │           UserResponse$UserResponseBuilder.class
│   │           │           UserResponse.class
│   │           │           
│   │           ├───entity
│   │           │       Attendance$AttendanceBuilder.class
│   │           │       Attendance.class
│   │           │       Category$CategoryBuilder.class
│   │           │       Category.class
│   │           │       Chapter$ChapterBuilder.class
│   │           │       Chapter.class
│   │           │       Course$CourseBuilder.class
│   │           │       Course.class
│   │           │       CourseMaterial$CourseMaterialBuilder.class
│   │           │       CourseMaterial.class
│   │           │       Enrollment$EnrollmentBuilder.class
│   │           │       Enrollment.class
│   │           │       Grade$GradeBuilder.class
│   │           │       Grade.class
│   │           │       Lesson$LessonBuilder.class
│   │           │       Lesson.class
│   │           │       Notification$NotificationBuilder.class
│   │           │       Notification.class
│   │           │       Permission$PermissionBuilder.class
│   │           │       Permission.class
│   │           │       Role$RoleBuilder.class
│   │           │       Role.class
│   │           │       User$UserBuilder.class
│   │           │       User.class
│   │           │       
│   │           ├───exception
│   │           │       BusinessException.class
│   │           │       ErrorResponse$ErrorResponseBuilder.class
│   │           │       ErrorResponse.class
│   │           │       GlobalExceptionHandler.class
│   │           │       ResourceNotFoundException.class
│   │           │       
│   │           ├───mapper
│   │           │       CategoryMapper.class
│   │           │       CategoryMapperImpl.class
│   │           │       ContentMapper.class
│   │           │       ContentMapperImpl.class
│   │           │       CourseMapper.class
│   │           │       CourseMapperImpl.class
│   │           │       UserMapper.class
│   │           │       UserMapperImpl.class
│   │           │       
│   │           ├───repository
│   │           │       CategoryRepository.class
│   │           │       ChapterRepository.class
│   │           │       CourseMaterialRepository.class
│   │           │       CourseRepository.class
│   │           │       EnrollmentRepository.class
│   │           │       GradeRepository.class
│   │           │       LessonRepository.class
│   │           │       NotificationRepository.class
│   │           │       PermissionRepository.class
│   │           │       RoleRepository.class
│   │           │       UserRepository.class
│   │           │       
│   │           ├───security
│   │           │       CustomUserDetailsService.class
│   │           │       JwtAuthenticationFilter.class
│   │           │       JwtTokenProvider.class
│   │           │       SecurityConstants.class
│   │           │       
│   │           ├───service
│   │           │       AuthService.class
│   │           │       CategoryService.class
│   │           │       ChapterService.class
│   │           │       CourseMaterialService.class
│   │           │       CourseService.class
│   │           │       EmailService.class
│   │           │       EnrollmentService.class
│   │           │       GradeService.class
│   │           │       StatisticService.class
│   │           │       UserService.class
│   │           │       
│   │           └───util
│   │                   ExcelExportUtil.class
│   │                   FileUploadUtil.class
│   │                   
│   └───db
│       └───migration
│               V1__init_database.sql
│               
├───generated-sources
│   └───annotations
│       └───com
│           └───nhom01
│               └───coursemanagement
│                   └───mapper
│                           CategoryMapperImpl.java
│                           ContentMapperImpl.java
│                           CourseMapperImpl.java
│                           UserMapperImpl.java
│                           
├───generated-test-sources
│   └───test-annotations
└───test-classes
└───com
└───nhom01
└───coursemanagement
CourseManagementApplicationTests.class

