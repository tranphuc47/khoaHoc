// ============================================================
// app.js — Logic dùng chung cho toàn bộ frontend
// Vì file HTML nằm trong src/main/resources/static của Spring Boot,
// nên gọi API cùng domain, không cần ghi domain đầy đủ.
// ============================================================
const API_BASE = '';

// Gọi API kèm sẵn Authorization header nếu đã đăng nhập — dùng cho mọi trang cần login
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
}

function requireLogin() {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function statusBadge(status) {
    const map = {
        PENDING: 'gray', ACTIVE: 'green', COMPLETED: 'green', CANCELLED: 'red',
        DRAFT: 'gray', PUBLISHED: 'green', ARCHIVED: 'red'
    };
    const cls = map[status] || 'gray';
    return `<span class="badge ${cls}">${status}</span>`;
}

// ---------- 1. Quản lý trạng thái đăng nhập (chạy ở MỌI trang) ----------
function initAuthUI() {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    const guestEls = document.querySelectorAll('[data-guest-only]');
    const authEls = document.querySelectorAll('[data-auth-only]');
    const usernameEls = document.querySelectorAll('[data-username]');
    const roleNavEls = document.querySelectorAll('[data-nav][data-role]');

    if (token) {
        guestEls.forEach(el => el.style.display = 'none');
        authEls.forEach(el => el.style.display = '');
        usernameEls.forEach(el => el.textContent = username || 'Tài khoản');
        roleNavEls.forEach(el => {
            el.style.display = (el.dataset.role === role) ? '' : 'none';
        });
    } else {
        guestEls.forEach(el => el.style.display = '');
        authEls.forEach(el => el.style.display = 'none');
        roleNavEls.forEach(el => el.style.display = 'none');
    }

    document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = 'index.html';
        });
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav]').forEach(a => {
        if (a.getAttribute('href') === currentPage) a.classList.add('active');
    });
}

// ---------- 2. Trang login.html ----------
function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return; // không phải trang login thì bỏ qua

    const messageEl = document.getElementById('loginMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = '';
        messageEl.classList.remove('ok');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                messageEl.textContent = 'Sai tên đăng nhập hoặc mật khẩu';
                return;
            }

            const data = await res.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role || 'STUDENT');

            messageEl.textContent = 'Đăng nhập thành công, đang chuyển hướng...';
            messageEl.classList.add('ok');

            // Điều hướng theo vai trò
            setTimeout(() => {
                if (data.role === 'ADMIN') window.location.href = 'admin.html';
                else if (data.role === 'INSTRUCTOR') window.location.href = 'teacher.html';
                else window.location.href = 'index.html';
            }, 500);

        } catch (err) {
            messageEl.textContent = 'Không thể kết nối tới máy chủ';
        }
    });
}

// ---------- 3. Trang register.html ----------
function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const messageEl = document.getElementById('registerMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = '';
        messageEl.classList.remove('ok');

        const body = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim()
        };

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const text = await res.text();

            if (!res.ok) {
                messageEl.textContent = text || 'Đăng ký thất bại';
                return;
            }

            messageEl.textContent = 'Đăng ký thành công! Đang chuyển tới trang đăng nhập...';
            messageEl.classList.add('ok');
            setTimeout(() => window.location.href = 'login.html', 1000);

        } catch (err) {
            messageEl.textContent = 'Không thể kết nối tới máy chủ';
        }
    });
}

// ---------- 4. Trang index.html — tải khóa học nổi bật ----------
async function loadFeaturedCourses() {
    const container = document.getElementById('featuredCourses');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/api/courses?page=0&size=3&sort=createdAt,desc`);
        const data = await res.json();
        const courses = data.content || [];

        if (courses.length === 0) {
            container.innerHTML = '<div class="empty-state">Chưa có khóa học nào</div>';
            return;
        }

        document.getElementById('statCourseCount').textContent = data.totalElements || courses.length;

        container.innerHTML = courses.map(c => `
      <a class="course-card" href="course-detail.html?id=${c.id}" style="display:block">
        <div class="course-thumb">${(c.title || '?').charAt(0).toUpperCase()}</div>
        <div class="course-body">
          <h3>${c.title}</h3>
          <p>${c.categoryName || 'Chưa phân loại'} · ${c.price > 0 ? formatCurrency(c.price) : 'Miễn phí'}</p>
        </div>
      </a>
    `).join('');

    } catch (err) {
        container.innerHTML = '<div class="empty-state">Không thể tải khóa học</div>';
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

// ---------- Khởi chạy khi trang tải xong ----------
document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    initLoginPage();
    initRegisterPage();
    loadFeaturedCourses();
// ---------- 5. Trang courses.html ----------
    let coursesState = { page: 0, size: 9, keyword: '', categoryId: '', sort: 'createdAt,desc' };

    function initCoursesPage() {
        const grid = document.getElementById('courseGrid');
        if (!grid) return; // không phải trang courses thì bỏ qua

        loadCategoriesIntoSelect();
        loadCourses();

        document.getElementById('filterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            coursesState.page = 0;
            coursesState.keyword = document.getElementById('keyword').value.trim();
            coursesState.categoryId = document.getElementById('categorySelect').value;
            coursesState.sort = document.getElementById('sortSelect').value;
            loadCourses();
        });
    }

    async function loadCategoriesIntoSelect() {
        const select = document.getElementById('categorySelect');
        if (!select) return;

        try {
            const res = await fetch(`${API_BASE}/api/categories?size=100`);
            const data = await res.json();
            const categories = data.content || [];
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                select.appendChild(opt);
            });
        } catch (err) {
            console.error('Không tải được danh mục', err);
        }
    }

    async function loadCourses() {
        const grid = document.getElementById('courseGrid');
        const pager = document.getElementById('pager');
        grid.innerHTML = '<div class="empty-state">Đang tải khóa học...</div>';

        try {
            let url;
            if (coursesState.keyword) {
                url = `${API_BASE}/api/courses/search?keyword=${encodeURIComponent(coursesState.keyword)}&page=${coursesState.page}&size=${coursesState.size}&sort=${coursesState.sort}`;
            } else {
                url = `${API_BASE}/api/courses?page=${coursesState.page}&size=${coursesState.size}&sort=${coursesState.sort}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            let courses = data.content || [];

            // Lọc theo danh mục ở phía client (API search hiện chưa hỗ trợ kết hợp category + keyword cùng lúc)
            if (coursesState.categoryId) {
                courses = courses.filter(c => String(c.categoryId) === coursesState.categoryId);
            }

            document.getElementById('statTotal').textContent = data.totalElements || courses.length;

            if (courses.length === 0) {
                grid.innerHTML = '<div class="empty-state">Không tìm thấy khóa học phù hợp</div>';
                pager.innerHTML = '';
                return;
            }

            grid.innerHTML = courses.map(c => `
      <a class="course-card" href="course-detail.html?id=${c.id}" style="display:block">
        <div class="course-thumb">${(c.title || '?').charAt(0).toUpperCase()}</div>
        <div class="course-body">
          <h3>${c.title}</h3>
          <p>${c.categoryName || 'Chưa phân loại'}</p>
          <p><strong>${c.price > 0 ? formatCurrency(c.price) : 'Miễn phí'}</strong></p>
        </div>
      </a>
    `).join('');

            renderPager(data.totalPages || 1, data.number || 0);

        } catch (err) {
            grid.innerHTML = '<div class="empty-state">Không thể tải khóa học, vui lòng thử lại</div>';
            console.error(err);
        }
    }

    function renderPager(totalPages, currentPage) {
        const pager = document.getElementById('pager');
        if (!pager || totalPages <= 1) { if (pager) pager.innerHTML = ''; return; }

        let html = '';
        for (let i = 0; i < totalPages; i++) {
            html += `<button class="btn ${i === currentPage ? 'blue' : ''}" data-page="${i}">${i + 1}</button>`;
        }
        pager.innerHTML = html;

        pager.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                coursesState.page = parseInt(btn.dataset.page, 10);
                loadCourses();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }
// ---------- 6. Trang course-detail.html ----------
    function getQueryParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    async function initCourseDetailPage() {
        const titleEl = document.getElementById('courseTitle');
        if (!titleEl) return;

        const courseId = getQueryParam('id');
        if (!courseId) { titleEl.textContent = 'Không tìm thấy khóa học'; return; }

        try {
            const res = await fetch(`${API_BASE}/api/courses/${courseId}`);
            if (!res.ok) { titleEl.textContent = 'Không tìm thấy khóa học'; return; }
            const course = await res.json();

            document.getElementById('breadcrumbTitle').textContent = course.title;
            titleEl.textContent = course.title;
            document.getElementById('courseCategory').textContent = course.categoryName || 'Chưa phân loại';
            document.getElementById('coursePrice').textContent = course.price > 0 ? formatCurrency(course.price) : 'Miễn phí';
            document.getElementById('courseDescription').textContent = course.description || 'Chưa có mô tả.';

            // Render chương/bài học
            const chapterList = document.getElementById('chapterList');
            const chapters = course.chapters || [];
            if (chapters.length === 0) {
                chapterList.innerHTML = '<div class="empty-state">Chưa có nội dung</div>';
            } else {
                chapterList.innerHTML = chapters.map(ch => `
        <div class="chapter-box">
          <h3>${ch.title}</h3>
          <ul>${(ch.lessons || []).map(l => `<li>${l.title}</li>`).join('') || '<li>Chưa có bài học</li>'}</ul>
        </div>
      `).join('');
            }

            renderEnrollBox(courseId, course.price);

        } catch (err) {
            titleEl.textContent = 'Lỗi tải dữ liệu';
        }
    }

    function renderEnrollBox(courseId, price) {
        const box = document.getElementById('enrollBox');
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');

        if (!token) {
            box.innerHTML = `<a class="btn red" href="login.html">Đăng nhập để đăng ký khóa học</a>`;
            return;
        }
        if (role !== 'STUDENT') {
            box.innerHTML = ''; // Giảng viên/Admin không đăng ký học
            return;
        }

        box.innerHTML = `<button class="btn red" id="enrollBtn">Đăng ký khóa học${price > 0 ? ' - ' + formatCurrency(price) : ' (Miễn phí)'}</button>`;

        document.getElementById('enrollBtn').addEventListener('click', async () => {
            const msg = document.getElementById('enrollMessage');
            msg.textContent = ''; msg.classList.remove('ok');
            try {
                const res = await authFetch(`${API_BASE}/api/enrollments`, {
                    method: 'POST', body: JSON.stringify({ courseId: parseInt(courseId, 10) })
                });
                const text = await res.text();
                if (!res.ok) { msg.textContent = text; return; }

                msg.textContent = 'Đăng ký thành công! Xem tại "Khóa của tôi".';
                msg.classList.add('ok');
                box.innerHTML = `<a class="btn" href="my-courses.html">Xem khóa học của tôi</a>`;
            } catch (err) {
                msg.textContent = 'Không thể kết nối máy chủ';
            }
        });
    }
// ---------- 7. Trang my-courses.html ----------
    async function initMyCoursesPage() {
        const rows = document.getElementById('myCourseRows');
        if (!rows) return;
        if (!requireLogin()) return;

        try {
            const res = await authFetch(`${API_BASE}/api/student/courses?size=50`);
            const data = await res.json();
            const enrollments = data.content || [];

            if (enrollments.length === 0) {
                rows.innerHTML = '<tr><td colspan="4">Bạn chưa đăng ký khóa học nào. <a href="courses.html">Khám phá ngay</a></td></tr>';
                return;
            }

            rows.innerHTML = enrollments.map(e => `
      <tr>
        <td>${e.courseTitle}</td>
        <td>${statusBadge(e.status)}</td>
        <td>${e.enrolledDate ? new Date(e.enrolledDate).toLocaleDateString('vi-VN') : '-'}</td>
        <td class="row-actions">
          ${e.status === 'PENDING' ? `<button class="btn small red" data-pay="${e.id}">Thanh toán</button>` : ''}
          ${e.status !== 'CANCELLED' ? `<button class="btn small" data-cancel="${e.id}">Hủy</button>` : ''}
        </td>
      </tr>
    `).join('');

            bindMyCourseActions();

        } catch (err) {
            rows.innerHTML = '<tr><td colspan="4">Không thể tải dữ liệu</td></tr>';
        }
    }

    function bindMyCourseActions() {
        document.querySelectorAll('[data-pay]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.pay;
                if (!confirm('Xác nhận thanh toán khóa học này?')) return;
                const res = await authFetch(`${API_BASE}/api/enrollments/${id}/confirm-payment`, { method: 'POST' });
                const text = await res.text();
                if (!res.ok) { alert(text); return; }
                alert('Thanh toán thành công!');
                initMyCoursesPage();
            });
        });

        document.querySelectorAll('[data-cancel]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.cancel;
                if (!confirm('Xác nhận hủy đăng ký khóa học này?')) return;
                const res = await authFetch(`${API_BASE}/api/enrollments/${id}/cancel`, { method: 'PUT' });
                const text = await res.text();
                if (!res.ok) { alert(text); return; }
                initMyCoursesPage();
            });
        });
    }
// ---------- 8. Trang teacher.html ----------
    function initTeacherPage() {
        const rows = document.getElementById('teacherCourseRows');
        if (!rows) return;
        if (!requireLogin()) return;

        loadCategoriesForCreateForm();
        loadTeacherCourses();

        document.querySelectorAll('.tabs [data-tab]').forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                document.querySelectorAll('.tabs [data-tab]').forEach(b => b.classList.remove('active'));
                tabBtn.classList.add('active');
                document.getElementById('tab-list').style.display = tabBtn.dataset.tab === 'list' ? '' : 'none';
                document.getElementById('tab-create').style.display = tabBtn.dataset.tab === 'create' ? '' : 'none';
            });
        });

        document.getElementById('createCourseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('createCourseMessage');
            msg.textContent = ''; msg.classList.remove('ok');

            const body = {
                title: document.getElementById('cTitle').value.trim(),
                description: document.getElementById('cDescription').value.trim(),
                categoryId: parseInt(document.getElementById('cCategory').value, 10),
                price: parseFloat(document.getElementById('cPrice').value) || 0,
                thumbnailUrl: document.getElementById('cThumbnail').value.trim()
            };

            const res = await authFetch(`${API_BASE}/api/courses`, { method: 'POST', body: JSON.stringify(body) });
            const text = await res.text();
            if (!res.ok) { msg.textContent = text; return; }

            msg.textContent = 'Tạo khóa học thành công! (Trạng thái DRAFT, chờ Admin duyệt)';
            msg.classList.add('ok');
            document.getElementById('createCourseForm').reset();
            loadTeacherCourses();
        });
    }

    async function loadCategoriesForCreateForm() {
        const select = document.getElementById('cCategory');
        if (!select) return;
        const res = await fetch(`${API_BASE}/api/categories?size=100`);
        const data = await res.json();
        (data.content || []).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id; opt.textContent = c.name;
            select.appendChild(opt);
        });
    }

    async function loadTeacherCourses() {
        const rows = document.getElementById('teacherCourseRows');
        try {
            const res = await authFetch(`${API_BASE}/api/instructor/courses?size=50`);
            const data = await res.json();
            const courses = data.content || [];
            document.getElementById('teacherCourseCount').textContent = data.totalElements || courses.length;

            if (courses.length === 0) {
                rows.innerHTML = '<tr><td colspan="5">Bạn chưa tạo khóa học nào</td></tr>';
                return;
            }

            rows.innerHTML = courses.map(c => `
      <tr>
        <td>${c.title}</td>
        <td>${c.categoryName || '-'}</td>
        <td>${statusBadge(c.status)}</td>
        <td><button class="btn small" data-view-enroll="${c.id}">Xem</button></td>
        <td class="row-actions"><button class="btn small red" data-delete-course="${c.id}">Xóa</button></td>
      </tr>
    `).join('');

            document.querySelectorAll('[data-view-enroll]').forEach(btn => {
                btn.addEventListener('click', () => loadEnrollmentsOfCourse(btn.dataset.viewEnroll));
            });
            document.querySelectorAll('[data-delete-course]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Xóa khóa học này?')) return;
                    const res = await authFetch(`${API_BASE}/api/courses/${btn.dataset.deleteCourse}`, { method: 'DELETE' });
                    const text = await res.text();
                    if (!res.ok) { alert(text); return; }
                    loadTeacherCourses();
                });
            });

        } catch (err) {
            rows.innerHTML = '<tr><td colspan="5">Không thể tải dữ liệu</td></tr>';
        }
    }

    async function loadEnrollmentsOfCourse(courseId) {
        const rows = document.getElementById('enrollmentRows');
        rows.innerHTML = '<tr><td colspan="4">Đang tải...</td></tr>';

        try {
            const res = await authFetch(`${API_BASE}/api/courses/${courseId}/enrollments`);
            const enrollments = await res.json();

            if (enrollments.length === 0) {
                rows.innerHTML = '<tr><td colspan="4">Chưa có học viên đăng ký</td></tr>';
                return;
            }

            rows.innerHTML = enrollments.map(e => `
      <tr>
        <td>${e.userFullName}</td>
        <td>${e.courseTitle}</td>
        <td>${statusBadge(e.status)}</td>
        <td class="row-actions">
          ${e.status === 'PENDING' ? `<button class="btn small blue" data-approve="${e.id}">Duyệt</button>` : ''}
          <button class="btn small red" data-teacher-cancel="${e.id}">Hủy</button>
        </td>
      </tr>
    `).join('');

            document.querySelectorAll('[data-approve]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await authFetch(`${API_BASE}/api/enrollments/${btn.dataset.approve}/approve`, { method: 'PUT' });
                    loadEnrollmentsOfCourse(courseId);
                });
            });
            document.querySelectorAll('[data-teacher-cancel]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await authFetch(`${API_BASE}/api/enrollments/${btn.dataset.teacherCancel}/cancel`, { method: 'PUT' });
                    loadEnrollmentsOfCourse(courseId);
                });
            });

        } catch (err) {
            rows.innerHTML = '<tr><td colspan="4">Không thể tải dữ liệu</td></tr>';
        }
    }
// ---------- 9. Trang admin.html ----------
    function initAdminPage() {
        const userRows = document.getElementById('userRows');
        if (!userRows) return;
        if (!requireLogin()) return;

        document.querySelectorAll('.tabs [data-admintab]').forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                document.querySelectorAll('.tabs [data-admintab]').forEach(b => b.classList.remove('active'));
                tabBtn.classList.add('active');
                ['users', 'categories', 'stats'].forEach(t => {
                    document.getElementById(`admintab-${t}`).style.display = (t === tabBtn.dataset.admintab) ? '' : 'none';
                });
                if (tabBtn.dataset.admintab === 'categories') loadAdminCategories();
                if (tabBtn.dataset.admintab === 'stats') loadAdminStats();
            });
        });

        loadAdminUsers();

        document.getElementById('createCategoryForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('categoryMessage');
            msg.textContent = ''; msg.classList.remove('ok');

            const body = {
                name: document.getElementById('catName').value.trim(),
                description: document.getElementById('catDescription').value.trim()
            };

            const res = await authFetch(`${API_BASE}/api/admin/categories`, { method: 'POST', body: JSON.stringify(body) });
            const text = await res.text();
            if (!res.ok) { msg.textContent = text; return; }

            msg.textContent = 'Thêm danh mục thành công';
            msg.classList.add('ok');
            document.getElementById('createCategoryForm').reset();
            loadAdminCategories();
        });
    }

    async function loadAdminUsers() {
        const rows = document.getElementById('userRows');
        try {
            const res = await authFetch(`${API_BASE}/api/admin/users?size=50`);
            const data = await res.json();
            const users = data.content || [];

            rows.innerHTML = users.map(u => `
      <tr>
        <td>${u.username}</td>
        <td>${u.fullName || '-'}</td>
        <td>${u.roleName}</td>
        <td>${u.email}</td>
        <td>${u.enabled ? statusBadge('ACTIVE') : statusBadge('CANCELLED')}</td>
        <td><button class="btn small ${u.enabled ? 'red' : 'blue'}" data-toggle="${u.id}">${u.enabled ? 'Khóa' : 'Mở khóa'}</button></td>
      </tr>
    `).join('');

            document.querySelectorAll('[data-toggle]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await authFetch(`${API_BASE}/api/admin/users/${btn.dataset.toggle}/toggle`, { method: 'PUT' });
                    loadAdminUsers();
                });
            });

        } catch (err) {
            rows.innerHTML = '<tr><td colspan="6">Không thể tải dữ liệu</td></tr>';
        }
    }

    async function loadAdminCategories() {
        const rows = document.getElementById('categoryRows');
        const res = await fetch(`${API_BASE}/api/categories?size=100`);
        const data = await res.json();
        const categories = data.content || [];

        rows.innerHTML = categories.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.description || '-'}</td>
      <td><button class="btn small red" data-delcat="${c.id}">Xóa</button></td>
    </tr>
  `).join('');

        document.querySelectorAll('[data-delcat]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Xóa danh mục này?')) return;
                await authFetch(`${API_BASE}/api/admin/categories/${btn.dataset.delcat}`, { method: 'DELETE' });
                loadAdminCategories();
            });
        });
    }

    async function loadAdminStats() {
        const grid = document.getElementById('statsGrid');
        const rows = document.getElementById('statsRows');

        try {
            const res = await authFetch(`${API_BASE}/api/enrollments/statistics`);
            const stats = await res.json();

            const totalStudents = stats.reduce((sum, s) => sum + s.totalEnrolled, 0);
            const totalActive = stats.reduce((sum, s) => sum + s.activeCount, 0);

            grid.innerHTML = `
      <div class="metric-card"><strong>${stats.length}</strong><span>khóa học</span></div>
      <div class="metric-card"><strong>${totalStudents}</strong><span>lượt ghi danh</span></div>
      <div class="metric-card"><strong>${totalActive}</strong><span>đang học</span></div>
    `;

            rows.innerHTML = stats.map(s => `
      <tr>
        <td>${s.courseTitle}</td>
        <td>${s.totalEnrolled}</td>
        <td>${s.activeCount}</td>
        <td>${s.completedCount}</td>
        <td>${s.cancelledCount}</td>
      </tr>
    `).join('');

        } catch (err) {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Không thể tải thống kê</div>';
        }
    }
    document.addEventListener('DOMContentLoaded', () => {
        initAuthUI();
        initLoginPage();
        initRegisterPage();
        loadFeaturedCourses();
        initCoursesPage();
        initCourseDetailPage();
        initMyCoursesPage();
        initTeacherPage();
        initAdminPage();
    });
});