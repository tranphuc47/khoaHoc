# Hệ thống Quản lý Khóa học - Nhóm 01

## Công nghệ

**Backend:** Java 17, Spring Boot 3.4, Spring Security JWT, JPA, MySQL, Redis, Apache POI, JavaMail  
**Frontend:** Vue 3, Vite, Element Plus, ECharts, Pinia  
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
