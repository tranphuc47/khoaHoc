🌐 DANH SÁCH LINK LOCAL TEST THEO TỪNG MODULE
🟢 MODULE 1 — Xác thực & Phân quyền (Auth & Roles)
Link Đăng nhập / Đăng ký: http://localhost:8080/auth.html
Link Đăng ký trực tiếp: http://localhost:8080/auth.html?tab=register
Cách test:
Truy cập http://localhost:8080/auth.html ➔ Đăng nhập student1 / admin123.
Quan sát Header: Tự động hiện tên student1, badge STUDENT và nút Đăng xuất.
Thử bấm Đăng xuất ➔ Header tự đổi về giao diện khách (hiện lại nút Đăng nhập/Đăng ký).
🟢 MODULE 2 — Danh mục (Categories)
Link Lọc danh mục Trang chủ (Học viên): http://localhost:8080/index.html
Link Quản lý danh mục (Admin): http://localhost:8080/dashboard.html (Đăng nhập admin / admin123, mở Tab Danh mục khóa học)
Cách test:
Vào http://localhost:8080/index.html ➔ Click các nút chip Lập trình, Thiết kế, Kinh doanh để lọc khóa học ngay tại trang chủ.
Đăng nhập admin ➔ Vào http://localhost:8080/dashboard.html ➔ Tab Danh mục khóa học ➔ Nhập form thêm mới hoặc bấm Sửa / Xóa danh mục.
🟢 MODULE 3 — Khóa học (Courses)
Link Danh sách khóa học (Trang chủ): http://localhost:8080/index.html
Link Chi tiết khóa học mẫu: http://localhost:8080/course.html?id=1 (Java) hoặc http://localhost:8080/course.html?id=3 (Spring Boot)
Link Quản lý khóa học (Giảng viên): http://localhost:8080/dashboard.html (Đăng nhập instructor1 / admin123)
Link Duyệt khóa học (Admin): http://localhost:8080/dashboard.html (Đăng nhập admin / admin123)
Cách test:
Mở index.html: Thử gõ từ khóa vào ô tìm kiếm, chọn sắp xếp Mới nhất, Giá tăng, Giá giảm.
Đăng nhập instructor1 ➔ Tab Tạo khóa học mới ➔ Điền form tạo khóa học.
Đăng nhập admin ➔ Tab Duyệt khóa học ➔ Bấm nút Duyệt (PUBLISHED) hoặc Gỡ (DRAFT).
🟢 MODULE 4 — Chương & Bài học (Chapters & Lessons)
Link Xem bài học Khóa / Mở (Chi tiết khóa học): http://localhost:8080/course.html?id=3
Link Quản lý nội dung (Giảng viên): http://localhost:8080/dashboard.html (Đăng nhập instructor1, mở Tab Quản lý chương & bài học)
Cách test:
Bài học bị khóa: Khi chưa đăng ký/chưa thanh toán khóa học id=3, mở course.html?id=3 ➔ Click bài học ➔ Thấy bài học bị mờ, hiện icon 🔒 và không mở được.
Bài học đã mở: Đăng nhập student1 / admin123 ➔ Mở course.html?id=3 (khóa đã thanh toán) ➔ Bài học sáng lên, click vào ➔ Khung xem nội dung bài học mở ra ở dưới.
Đăng nhập instructor1 ➔ Tab Quản lý chương & bài học ➔ Chọn khóa học ➔ Thêm chương & Thêm bài học.
🟢 MODULE 5 — Ghi danh (Enrollment)
Link Khóa học của tôi (Học viên): http://localhost:8080/dashboard.html (Đăng nhập student1 hoặc student2)
Link Duyệt học viên (Giảng viên): http://localhost:8080/dashboard.html (Đăng nhập instructor1)
Link Thống kê ghi danh (Admin): http://localhost:8080/dashboard.html (Đăng nhập admin, mở Tab Thống kê hệ thống)
Cách test:
Đăng nhập student2 / admin123 ➔ Dashboard thấy khóa học PENDING kèm nút "Thanh toán ngay".
Đăng nhập student1 / admin123 ➔ Dashboard thấy khóa học ACTIVE kèm nút "Vào học".
Đăng nhập instructor1 ➔ Click chọn 1 khóa ở bảng trên ➔ Bảng học viên đăng ký hiện ở dưới ➔ Bấm Duyệt / Hủy.
🟢 MODULE 6 — Người dùng (Users & Profile)
Link Hồ sơ cá nhân (Mọi role): http://localhost:8080/dashboard.html?view=profile
Link Quản lý người dùng (Admin): http://localhost:8080/dashboard.html (Đăng nhập admin, mở Tab Quản lý người dùng)
Cách test:
Mở dashboard.html?view=profile ➔ Xem Avatar tròn, thông tin tài khoản ➔ Thử cập nhật Họ tên/SĐT và Đổi mật khẩu.
Đăng nhập admin ➔ Tab Quản lý người dùng ➔ Bấm nút Khóa hoặc Mở tài khoản bất kỳ.
🟢 MODULE 7 — Thanh toán & Email (Payment & Email)
Link Demo Thanh toán khóa học: http://localhost:8080/course.html?id=4 (Đăng nhập student2 / admin123)
Cách test:
Đăng nhập student2 / admin123 (tài khoản này đang có 1 khóa PENDING là khóa id=4).
Mở link http://localhost:8080/course.html?id=4 ➔ Bấm nút "Thanh toán ngay".
Popup Modal hiện ra hiển thị chi tiết số tiền + Mã giao dịch (TXN-DEMOxxxx) + Dòng thông báo "📧 Hệ thống tự động gửi Email xác nhận thanh toán thành công".
Trạng thái tự động đổi thành ACTIVE và bạn có thể bấm vào học ngay.