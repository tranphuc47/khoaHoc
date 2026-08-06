// ============================================================
// app.js — Logic dùng chung cho 4 trang: index / auth / course / dashboard
// ============================================================
const API_BASE = '';

// ---------- Helper dùng chung ----------
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = 'auth.html';
        throw new Error('Unauthorized');
    }
    return res;
}

function requireLogin() {
    if (!localStorage.getItem('accessToken')) { window.location.href = 'auth.html'; return false; }
    return true;
}

function formatCurrency(v) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function statusBadge(status) {
    const map = { PENDING: 'gray', ACTIVE: 'green', COMPLETED: 'green', CANCELLED: 'red', DRAFT: 'gray', PUBLISHED: 'green', ARCHIVED: 'red', PAID: 'green' };
    return `<span class="badge ${map[status] || 'gray'}">${status}</span>`;
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function debounce(fn, delay) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3000);
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function initModals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    });
}

// ---------- 1. Auth UI (mọi trang) ----------
async function initAuthUI() {
    const token = localStorage.getItem('accessToken');
    let username = localStorage.getItem('username');
    let role = localStorage.getItem('role');

    document.querySelectorAll('[data-guest-only]').forEach(el => el.style.display = token ? 'none' : '');
    document.querySelectorAll('[data-auth-only]').forEach(el => el.style.display = token ? '' : 'none');
    document.querySelectorAll('[data-username]').forEach(el => el.textContent = username || 'Tài khoản');
    document.querySelectorAll('[data-role-badge]').forEach(el => el.textContent = role || '');

    function updateNavByRole(r) {
        const nav = document.querySelector('a[data-auth-only][data-nav]');
        if (!nav) return;
        if (r === 'ADMIN') {
            nav.href = 'admin.html'; nav.textContent = 'Quản trị hệ thống';
        } else if (r === 'INSTRUCTOR') {
            nav.href = 'teacher.html'; nav.textContent = 'Bảng giảng viên';
        } else {
            nav.href = 'dashboard.html'; nav.textContent = 'Khóa học của tôi';
        }
    }

    if (role) updateNavByRole(role);

    // Đồng bộ vai trò & thông tin từ backend
    if (token) {
        try {
            const profileRes = await fetch(`${API_BASE}/api/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const p = await profileRes.json();
                if (p.roleName) {
                    role = p.roleName;
                    localStorage.setItem('role', role);
                    document.querySelectorAll('[data-role-badge]').forEach(el => el.textContent = role);
                    updateNavByRole(role);
                }
                if (p.username) {
                    localStorage.setItem('username', p.username);
                    document.querySelectorAll('[data-username]').forEach(el => el.textContent = p.username);
                }
            }
        } catch (_) {}
    }

    document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', async () => {
            try { await authFetch(`${API_BASE}/api/auth/logout`, { method: 'POST' }); } catch (_) {}
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = 'index.html';
        });
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const view = getQueryParam('view');
    document.querySelectorAll('[data-nav]').forEach(a => {
        const href = a.getAttribute('href') || '';
        const isProfile = view === 'profile' && href.includes('view=profile');
        const isPage = href === currentPage;
        if (isProfile || (isPage && !href.includes('view=profile'))) a.classList.add('active');
    });
}

// ---------- 2. Trang auth.html ----------
function initAuthPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const tabBtns = document.querySelectorAll('[data-authtab]');
    const registerForm = document.getElementById('registerForm');

    function showTab(tab) {
        tabBtns.forEach(b => b.classList.toggle('active', b.dataset.authtab === tab));
        loginForm.style.display = tab === 'login' ? '' : 'none';
        registerForm.style.display = tab === 'register' ? '' : 'none';
    }

    tabBtns.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.authtab)));
    showTab(getQueryParam('tab') === 'register' ? 'register' : 'login');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('loginMessage');
        msg.textContent = ''; msg.classList.remove('ok');

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('loginUsername').value.trim(),
                    password: document.getElementById('loginPassword').value
                })
            });
            if (res.status === 403) { msg.textContent = 'Tài khoản đã bị khóa'; return; }
            if (!res.ok) { msg.textContent = 'Sai tên đăng nhập hoặc mật khẩu'; return; }
            const data = await res.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('username', data.username);

            let userRole = 'STUDENT';
            try {
                const profileRes = await fetch(`${API_BASE}/api/users/profile`, {
                    headers: { 'Authorization': `Bearer ${data.accessToken}` }
                });
                if (profileRes.ok) {
                    const p = await profileRes.json();
                    if (p.roleName) userRole = p.roleName;
                }
            } catch (_) {}

            localStorage.setItem('role', userRole);
            msg.textContent = 'Đăng nhập thành công...'; msg.classList.add('ok');

            let targetUrl = 'dashboard.html';
            if (userRole === 'ADMIN') targetUrl = 'admin.html';
            else if (userRole === 'INSTRUCTOR') targetUrl = 'teacher.html';

            setTimeout(() => window.location.href = targetUrl, 400);
        } catch { msg.textContent = 'Không thể kết nối máy chủ'; }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('registerMessage');
        msg.textContent = ''; msg.classList.remove('ok');

        const body = {
            username: document.getElementById('regUsername').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            password: document.getElementById('regPassword').value,
            fullName: document.getElementById('regFullName').value.trim(),
            phone: document.getElementById('regPhone').value.trim()
        };

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
            const text = await res.text();
            if (!res.ok) { msg.textContent = text || 'Đăng ký thất bại'; return; }
            msg.textContent = 'Đăng ký thành công! Chuyển sang đăng nhập...'; msg.classList.add('ok');
            setTimeout(() => showTab('login'), 900);
        } catch { msg.textContent = 'Không thể kết nối máy chủ'; }
    });
}

// ---------- 3. Trang index.html ----------
let idxState = { page: 0, size: 9, keyword: '', categoryId: '', sort: 'createdAt,desc' };

function renderPriceBox(price) {
    if (!price || price <= 0) return `<span class="price-free">Miễn phí</span>`;
    return `<span class="price-sale">${formatCurrency(price)}</span>`;
}

function renderCourseCard(c) {
    return `
    <a class="course-card" href="course.html?id=${c.id}">
      <div class="course-thumb">${(c.title || '?').charAt(0).toUpperCase()}</div>
      <div class="course-body">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:600; color:var(--blue);">${escapeHtml(c.categoryName || 'Danh mục')}</span>
            ${c.status ? statusBadge(c.status) : ''}
        </div>
        <h3>${escapeHtml(c.title)}</h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">👨‍🏫 ${escapeHtml(c.instructorName || 'Giảng viên')}</p>
        <div class="price-box">
            ${renderPriceBox(c.price)}
            <span style="font-size:13px; font-weight:600; color:var(--blue);">Xem chi tiết &rarr;</span>
        </div>
      </div>
    </a>`;
}

async function initIndexPage() {
    const grid = document.getElementById('courseGrid');
    if (!grid) return;

    await loadCategoryTabs();

    document.getElementById('searchInput').addEventListener('input', debounce(() => {
        idxState.page = 0;
        idxState.keyword = document.getElementById('searchInput').value.trim();
        loadCourseList();
    }, 400));

    document.getElementById('sortSelect').addEventListener('change', () => {
        idxState.sort = document.getElementById('sortSelect').value;
        loadCourseList();
    });

    loadCourseList();
}

async function loadCategoryTabs() {
    const container = document.getElementById('categoryTabs');
    if (!container) return;
    try {
        const res = await fetch(`${API_BASE}/api/categories?size=50`);
        const data = await res.json();
        (data.content || []).forEach(c => {
            const btn = document.createElement('button');
            btn.textContent = c.name; btn.dataset.cat = c.id;
            container.appendChild(btn);
        });
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                idxState.page = 0; idxState.categoryId = btn.dataset.cat;
                loadCourseList();
            });
        });
    } catch (err) { console.error(err); }
}

async function loadCourseList() {
    const grid = document.getElementById('courseGrid');
    grid.innerHTML = '<div class="empty-state">Đang tải khóa học...</div>';
    try {
        let url = idxState.keyword
            ? `${API_BASE}/api/courses/search?keyword=${encodeURIComponent(idxState.keyword)}&page=${idxState.page}&size=${idxState.size}&sort=${idxState.sort}`
            : `${API_BASE}/api/courses?page=${idxState.page}&size=${idxState.size}&sort=${idxState.sort}`;

        const res = await fetch(url);
        const data = await res.json();
        let courses = data.content || [];
        if (idxState.categoryId) courses = courses.filter(c => String(c.categoryId) === idxState.categoryId);

        if (courses.length === 0) { grid.innerHTML = '<div class="empty-state">Không có khóa học phù hợp</div>'; document.getElementById('pager').innerHTML = ''; return; }

        grid.innerHTML = courses.map(renderCourseCard).join('');
        renderPager(data.totalPages || 1, data.number || 0);
    } catch { grid.innerHTML = '<div class="empty-state">Không thể tải dữ liệu</div>'; }
}

function renderPager(totalPages, current) {
    const pager = document.getElementById('pager');
    if (!pager) return;
    if (totalPages <= 1) { pager.innerHTML = ''; return; }
    pager.innerHTML = Array.from({ length: totalPages }, (_, i) =>
        `<button class="btn ${i === current ? 'blue' : ''}" data-page="${i}">${i + 1}</button>`).join('');
    pager.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => {
        idxState.page = parseInt(b.dataset.page, 10); loadCourseList(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
}

// ---------- 4. Trang course.html ----------
async function initCoursePage() {
    const titleEl = document.getElementById('courseTitle');
    if (!titleEl) return;

    initModals();

    const courseId = getQueryParam('id');
    if (!courseId) { titleEl.textContent = 'Không tìm thấy khóa học'; return; }

    try {
        const res = await fetch(`${API_BASE}/api/courses/${courseId}`);
        if (!res.ok) { titleEl.textContent = 'Không tìm thấy khóa học'; return; }
        const course = await res.json();

        titleEl.textContent = course.title;
        document.getElementById('courseDescription').textContent = course.description || '';
        document.getElementById('coursePriceBox').innerHTML = renderPriceBox(course.price);
        const metaEl = document.getElementById('courseMeta');
        if (metaEl) {
            const lessonCount = (course.chapters || []).reduce((s, ch) => s + (ch.lessons || []).length, 0);
            metaEl.innerHTML = `<span>Giảng viên: <strong>${escapeHtml(course.instructorName || '—')}</strong></span>
                <span>${(course.chapters || []).length} chương · ${lessonCount} bài</span>`;
        }

        const enrollment = await findMyEnrollment(courseId);
        renderActionArea(course, enrollment);
        renderChapters(course.chapters || [], enrollment && enrollment.status === 'ACTIVE');

    } catch { titleEl.textContent = 'Lỗi tải dữ liệu'; }
}

async function findMyEnrollment(courseId) {
    if (!localStorage.getItem('accessToken')) return null;
    try {
        const res = await authFetch(`${API_BASE}/api/student/courses?size=100`);
        if (!res.ok) return null;
        const data = await res.json();
        return (data.content || []).find(e => String(e.courseId) === String(courseId)) || null;
    } catch { return null; }
}

function renderActionArea(course, enrollment) {
    const area = document.getElementById('actionArea');
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');

    if (!token) { area.innerHTML = `<a class="btn red" href="auth.html">Đăng nhập để đăng ký</a>`; return; }
    if (role !== 'STUDENT') { area.innerHTML = ''; return; }

    if (!enrollment) {
        area.innerHTML = `<button class="btn red" id="enrollBtn">Đăng ký khóa học</button>`;
        document.getElementById('enrollBtn').addEventListener('click', () => doEnroll(course.id, course.price));
    } else if (enrollment.status === 'PENDING') {
        area.innerHTML = `
            <button class="btn red" id="payBtn">Thanh toán ngay</button>
            <button class="btn" id="viewPayBtn">Xem thanh toán</button>`;
        document.getElementById('payBtn').addEventListener('click', () => doPay(enrollment.id));
        document.getElementById('viewPayBtn').addEventListener('click', () => showPaymentDetail(enrollment.id));
    } else if (enrollment.status === 'ACTIVE') {
        area.innerHTML = `<span class="badge green">Đã đăng ký — cuộn xuống để học</span>
            <button class="btn small" id="viewPayBtn">Chi tiết thanh toán</button>`;
        const vp = document.getElementById('viewPayBtn');
        if (vp) vp.addEventListener('click', () => showPaymentDetail(enrollment.id));
    }
}

async function doEnroll(courseId, price) {
    const msg = document.getElementById('actionMessage');
    const res = await authFetch(`${API_BASE}/api/enrollments`, { method: 'POST', body: JSON.stringify({ courseId: parseInt(courseId, 10) }) });
    const text = await res.text();
    if (!res.ok) { msg.textContent = text; return; }
    const isFree = !price || price <= 0;
    msg.textContent = isFree ? 'Đăng ký thành công! Bạn có thể học ngay.' : 'Đăng ký thành công! Vui lòng thanh toán để kích hoạt.';
    msg.classList.add('ok');
    showToast(isFree ? 'Đăng ký thành công!' : 'Đăng ký thành công — chờ thanh toán');
    setTimeout(() => location.reload(), 900);
}

async function doPay(enrollmentId) {
    const msg = document.getElementById('actionMessage');
    if (!confirm('Xác nhận thanh toán khóa học này?')) return;
    const res = await authFetch(`${API_BASE}/api/enrollments/${enrollmentId}/confirm-payment`, { method: 'POST' });
    const text = await res.text();
    if (!res.ok) { msg.textContent = text; return; }
    msg.textContent = 'Thanh toán thành công! Email xác nhận đã được gửi.';
    msg.classList.add('ok');
    showToast('Thanh toán thành công!');
    await showPaymentDetail(enrollmentId);
    setTimeout(() => location.reload(), 2000);
}

async function showPaymentDetail(enrollmentId) {
    openModal('paymentModal');
    const box = document.getElementById('paymentDetail');
    box.innerHTML = '<div class="empty-state">Đang tải...</div>';
    try {
        const res = await authFetch(`${API_BASE}/api/enrollments/${enrollmentId}/payment`);
        if (!res.ok) { box.innerHTML = '<div class="empty-state">Chưa có thông tin thanh toán</div>'; return; }
        const p = await res.json();
        box.innerHTML = `
            <div class="payment-row"><span>Khóa học</span><strong>${escapeHtml(p.courseTitle || '—')}</strong></div>
            <div class="payment-row"><span>Số tiền</span><strong>${formatCurrency(p.amount || 0)}</strong></div>
            <div class="payment-row"><span>Mã giao dịch</span><strong>${escapeHtml(p.transactionCode || '—')}</strong></div>
            <div class="payment-row"><span>Trạng thái</span>${statusBadge(p.status || 'PENDING')}</div>
            <div class="payment-row"><span>Thời gian</span><strong>${p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : 'Chưa thanh toán'}</strong></div>`;
    } catch { box.innerHTML = '<div class="empty-state">Không thể tải dữ liệu</div>'; }
}

function renderChapters(chapters, unlocked) {
    const container = document.getElementById('chapterAccordion');
    if (chapters.length === 0) { container.innerHTML = '<div class="empty-state">Chưa có nội dung</div>'; return; }

    container.innerHTML = chapters.map((ch, ci) => `
    <div>
      <div class="chapter-header" data-chapter="${ci}">
        <span>${escapeHtml(ch.title)}</span><span>▾</span>
      </div>
      <div class="chapter-body" id="chapter-body-${ci}">
        ${(ch.lessons || []).map((l, li) => `
          <div class="lesson-item ${unlocked ? '' : 'locked'}" data-lesson-title="${escapeHtml(l.title)}" data-lesson-content="${escapeHtml(l.content || 'Chưa có nội dung')}" data-video="${escapeHtml(l.videoUrl || '')}">
            <span class="lesson-num">${li + 1}</span>
            <span>${escapeHtml(l.title)}</span>
            <span style="margin-left:auto">${unlocked ? '' : '🔒'}</span>
          </div>
        `).join('') || '<div style="padding:10px 12px;color:var(--muted)">Chưa có bài học</div>'}
      </div>
    </div>
  `).join('');

    container.querySelectorAll('.chapter-header').forEach(h => {
        h.addEventListener('click', () => {
            document.getElementById(`chapter-body-${h.dataset.chapter}`).classList.toggle('open');
        });
    });

    if (unlocked) {
        container.querySelectorAll('.lesson-item').forEach(item => {
            item.addEventListener('click', () => {
                const box = document.getElementById('lessonContentBox');
                const video = item.dataset.video;
                box.innerHTML = `<h3 style="margin-bottom:8px">${item.dataset.lessonTitle}</h3>
                    ${video ? `<p><a href="${item.dataset.video}" target="_blank" rel="noopener">▶ Xem video</a></p>` : ''}
                    <p>${item.dataset.lessonContent}</p>`;
                box.classList.add('open');
                box.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }
}

// ---------- 5. Trang dashboard.html ----------
async function initDashboardPage() {
    const studentView = document.getElementById('view-student');
    if (!studentView) return;
    if (!requireLogin()) return;

    initModals();

    const token = localStorage.getItem('accessToken');
    let role = localStorage.getItem('role');

    if (token) {
        try {
            const profileRes = await fetch(`${API_BASE}/api/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const p = await profileRes.json();
                if (p.roleName) {
                    role = p.roleName;
                    localStorage.setItem('role', role);
                    document.querySelectorAll('[data-role-badge]').forEach(el => el.textContent = role);
                    const dashNav = document.querySelector('a[href="dashboard.html"][data-nav]');
                    if (dashNav) dashNav.textContent = role === 'STUDENT' ? 'Khóa học của tôi' : 'Bảng điều khiển';
                }
                if (p.username) {
                    localStorage.setItem('username', p.username);
                    document.querySelectorAll('[data-username]').forEach(el => el.textContent = p.username);
                }
            }
        } catch (_) {}
    }

    const viewProfile = getQueryParam('view') === 'profile';

    document.getElementById('view-student').classList.toggle('active', !viewProfile && role === 'STUDENT');
    document.getElementById('view-instructor').classList.toggle('active', !viewProfile && role === 'INSTRUCTOR');
    document.getElementById('view-admin').classList.toggle('active', !viewProfile && role === 'ADMIN');
    document.getElementById('view-profile').classList.toggle('active', viewProfile);

    if (viewProfile) { initProfilePage(); loadProfileData(); }
    else if (role === 'STUDENT') loadStudentDashboard();
    else if (role === 'INSTRUCTOR') loadInstructorDashboard();
    else if (role === 'ADMIN') loadAdminDashboard();
}

// -- Profile (mọi role) --
let profileInited = false;

function initProfilePage() {
    if (profileInited) return;
    profileInited = true;

    document.querySelectorAll('[data-ptab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-ptab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('ptab-info').style.display = btn.dataset.ptab === 'info' ? '' : 'none';
            document.getElementById('ptab-password').style.display = btn.dataset.ptab === 'password' ? '' : 'none';
        });
    });

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('profileMessage');
        const body = {
            fullName: document.getElementById('pfFullName').value.trim(),
            phone: document.getElementById('pfPhone').value.trim()
        };
        const res = await authFetch(`${API_BASE}/api/users/profile`, { method: 'PUT', body: JSON.stringify(body) });
        const text = await res.text();
        if (!res.ok) { msg.textContent = text; msg.classList.remove('ok'); return; }
        msg.textContent = 'Cập nhật thành công'; msg.classList.add('ok');
        showToast('Đã cập nhật hồ sơ');
        loadProfileData();
    });

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('passwordMessage');
        const newPw = document.getElementById('pwNew').value;
        const confirm = document.getElementById('pwConfirm').value;
        if (newPw !== confirm) { msg.textContent = 'Mật khẩu xác nhận không khớp'; msg.classList.remove('ok'); return; }
        const body = { oldPassword: document.getElementById('pwOld').value, newPassword: newPw };
        const res = await authFetch(`${API_BASE}/api/users/change-password`, { method: 'PUT', body: JSON.stringify(body) });
        const text = await res.text();
        if (!res.ok) { msg.textContent = text; msg.classList.remove('ok'); return; }
        msg.textContent = 'Đổi mật khẩu thành công'; msg.classList.add('ok');
        document.getElementById('passwordForm').reset();
        showToast('Đổi mật khẩu thành công');
    });
}

async function loadProfileData() {
    try {
        const res = await authFetch(`${API_BASE}/api/users/profile`);
        const p = await res.json();
        document.getElementById('profileAvatar').textContent = (p.fullName || p.username || '?').charAt(0).toUpperCase();
        document.getElementById('profileFullName').textContent = p.fullName || '—';
        document.getElementById('profileRole').textContent = p.roleName || '—';
        document.getElementById('profileUsername').textContent = p.username || '—';
        document.getElementById('profileEmail').textContent = p.email || '—';
        document.getElementById('profilePhone').textContent = p.phone || '—';
        document.getElementById('pfFullName').value = p.fullName || '';
        document.getElementById('pfPhone').value = p.phone || '';
    } catch { showToast('Không thể tải hồ sơ', 'error'); }
}

// -- Student --
async function loadStudentDashboard() {
    const rows = document.getElementById('studentRows');
    try {
        const res = await authFetch(`${API_BASE}/api/student/courses?size=50`);
        const data = await res.json();
        const list = data.content || [];
        if (list.length === 0) { rows.innerHTML = '<tr><td colspan="4">Chưa đăng ký khóa nào. <a href="index.html">Khám phá ngay</a></td></tr>'; return; }

        rows.innerHTML = list.map(e => `
      <tr>
        <td>${escapeHtml(e.courseTitle)}</td>
        <td>${statusBadge(e.status)}</td>
        <td>${e.enrolledDate ? new Date(e.enrolledDate).toLocaleDateString('vi-VN') : '-'}</td>
        <td class="row-actions">
          ${e.status === 'ACTIVE' ? `<a class="btn small blue" href="course.html?id=${e.courseId}">Vào học</a>` : ''}
          ${e.status === 'PENDING' ? `<button class="btn small red" data-pay="${e.id}">Thanh toán</button>` : ''}
          ${e.status === 'PENDING' || e.status === 'ACTIVE' ? `<button class="btn small" data-viewpay="${e.id}">Chi tiết TT</button>` : ''}
          ${e.status !== 'CANCELLED' ? `<button class="btn small" data-cancel="${e.id}">Hủy</button>` : ''}
        </td>
      </tr>`).join('');

        rows.querySelectorAll('[data-pay]').forEach(b => b.addEventListener('click', async () => {
            if (!confirm('Xác nhận thanh toán?')) return;
            const res = await authFetch(`${API_BASE}/api/enrollments/${b.dataset.pay}/confirm-payment`, { method: 'POST' });
            if (res.ok) { showToast('Thanh toán thành công!'); loadStudentDashboard(); }
            else showToast(await res.text(), 'error');
        }));
        rows.querySelectorAll('[data-viewpay]').forEach(b => b.addEventListener('click', () => showPaymentDetail(b.dataset.viewpay)));
        rows.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', async () => {
            if (!confirm('Xác nhận hủy đăng ký?')) return;
            await authFetch(`${API_BASE}/api/enrollments/${b.dataset.cancel}/cancel`, { method: 'PUT' });
            showToast('Đã hủy đăng ký');
            loadStudentDashboard();
        }));
    } catch { rows.innerHTML = '<tr><td colspan="4">Không thể tải dữ liệu</td></tr>'; }
}

// -- Instructor --
let instructorCoursesCache = [];

function loadInstructorDashboard() {
    document.querySelectorAll('[data-itab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-itab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ['list', 'create', 'content'].forEach(t => {
                document.getElementById(`itab-${t}`).style.display = t === btn.dataset.itab ? '' : 'none';
            });
            document.getElementById('instructorEnrollmentPanel').style.display = btn.dataset.itab === 'content' ? 'none' : '';
            if (btn.dataset.itab === 'content') loadContentCourseSelect();
        });
    });

    loadCategoriesIntoSelect('cCategory');
    loadCategoriesIntoSelect('editCategory');
    loadInstructorCourses();

    document.getElementById('createCourseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('createCourseMessage');
        const body = {
            title: document.getElementById('cTitle').value.trim(),
            description: document.getElementById('cDescription').value.trim(),
            categoryId: parseInt(document.getElementById('cCategory').value, 10),
            price: parseFloat(document.getElementById('cPrice').value) || 0
        };
        const res = await authFetch(`${API_BASE}/api/courses`, { method: 'POST', body: JSON.stringify(body) });
        const text = await res.text();
        if (!res.ok) { msg.textContent = text; msg.classList.remove('ok'); return; }
        msg.textContent = 'Tạo khóa học thành công'; msg.classList.add('ok');
        showToast('Tạo khóa học thành công');
        document.getElementById('createCourseForm').reset();
        loadInstructorCourses();
    });

    document.getElementById('contentCourseSelect').addEventListener('change', (e) => {
        const id = e.target.value;
        if (id) loadChapterManager(id);
        else {
            document.getElementById('chapterManager').innerHTML = '<div class="empty-state">Chọn khóa học để quản lý nội dung</div>';
            document.getElementById('addChapterForm').style.display = 'none';
        }
    });

    document.getElementById('addChapterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const courseId = document.getElementById('contentCourseSelect').value;
        if (!courseId) return;
        const body = {
            title: document.getElementById('newChapterTitle').value.trim(),
            chapterOrder: parseInt(document.getElementById('newChapterOrder').value, 10) || undefined
        };
        const res = await authFetch(`${API_BASE}/api/courses/${courseId}/chapters`, { method: 'POST', body: JSON.stringify(body) });
        if (!res.ok) { showToast(await res.text(), 'error'); return; }
        showToast('Thêm chương thành công');
        document.getElementById('newChapterTitle').value = '';
        document.getElementById('newChapterOrder').value = '';
        loadChapterManager(courseId);
    });

    document.getElementById('editCourseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('editCourseMessage');
        const id = document.getElementById('editCourseId').value;
        const body = {
            title: document.getElementById('editTitle').value.trim(),
            description: document.getElementById('editDescription').value.trim(),
            categoryId: parseInt(document.getElementById('editCategory').value, 10),
            price: parseFloat(document.getElementById('editPrice').value) || 0,
            status: document.getElementById('editStatus').value
        };
        const res = await authFetch(`${API_BASE}/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        const text = await res.text();
        if (!res.ok) { msg.textContent = text; msg.classList.remove('ok'); return; }
        showToast('Cập nhật khóa học thành công');
        closeModal('editCourseModal');
        loadInstructorCourses();
    });
}

async function loadCategoriesIntoSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    if (select.options.length > 1) return;
    const res = await fetch(`${API_BASE}/api/categories?size=100`);
    const data = await res.json();
    (data.content || []).forEach(c => {
        const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name;
        select.appendChild(opt);
    });
}

async function loadInstructorCourses() {
    const rows = document.getElementById('instructorCourseRows');
    try {
        const res = await authFetch(`${API_BASE}/api/instructor/courses?size=50`);
        const data = await res.json();
        instructorCoursesCache = data.content || [];
        if (instructorCoursesCache.length === 0) { rows.innerHTML = '<tr><td colspan="5">Chưa tạo khóa học nào</td></tr>'; return; }

        rows.innerHTML = instructorCoursesCache.map(c => `
      <tr>
        <td>${escapeHtml(c.title)}</td><td>${escapeHtml(c.categoryName || '-')}</td><td>${statusBadge(c.status)}</td>
        <td><button class="btn small" data-view="${c.id}" data-name="${escapeHtml(c.title)}">Xem HV</button></td>
        <td class="row-actions">
          <button class="btn small blue" data-edit="${c.id}">Sửa</button>
          <button class="btn small" data-content="${c.id}">Nội dung</button>
          <button class="btn small red" data-del="${c.id}">Xóa</button>
        </td>
      </tr>`).join('');

        rows.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => loadCourseEnrollments(b.dataset.view, b.dataset.name)));
        rows.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openEditCourseModal(b.dataset.edit)));
        rows.querySelectorAll('[data-content]').forEach(b => b.addEventListener('click', () => {
            document.querySelector('[data-itab="content"]').click();
            document.getElementById('contentCourseSelect').value = b.dataset.content;
            loadChapterManager(b.dataset.content);
        }));
        rows.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
            if (!confirm('Xóa khóa học này?')) return;
            await authFetch(`${API_BASE}/api/courses/${b.dataset.del}`, { method: 'DELETE' });
            showToast('Đã xóa khóa học');
            loadInstructorCourses();
        }));
    } catch { rows.innerHTML = '<tr><td colspan="5">Không thể tải dữ liệu</td></tr>'; }
}

async function openEditCourseModal(courseId) {
    const course = instructorCoursesCache.find(c => String(c.id) === String(courseId));
    if (!course) return;
    document.getElementById('editCourseId').value = course.id;
    document.getElementById('editTitle').value = course.title || '';
    document.getElementById('editDescription').value = course.description || '';
    document.getElementById('editCategory').value = course.categoryId || '';
    document.getElementById('editPrice').value = course.price || 0;
    document.getElementById('editStatus').value = course.status || 'DRAFT';
    document.getElementById('editCourseMessage').textContent = '';
    openModal('editCourseModal');
}

async function loadContentCourseSelect() {
    const select = document.getElementById('contentCourseSelect');
    select.innerHTML = '<option value="">Chọn khóa học...</option>';
    if (instructorCoursesCache.length === 0) {
        const res = await authFetch(`${API_BASE}/api/instructor/courses?size=50`);
        const data = await res.json();
        instructorCoursesCache = data.content || [];
    }
    instructorCoursesCache.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = c.title;
        select.appendChild(opt);
    });
}

async function loadChapterManager(courseId) {
    const container = document.getElementById('chapterManager');
    document.getElementById('addChapterForm').style.display = '';
    container.innerHTML = '<div class="empty-state">Đang tải...</div>';
    try {
        const res = await authFetch(`${API_BASE}/api/courses/${courseId}/chapters`);
        const chapters = await res.json();
        if (!chapters.length) {
            container.innerHTML = '<div class="empty-state">Chưa có chương nào — thêm chương bên dưới</div>';
            return;
        }
        const withLessons = await Promise.all(chapters.map(async ch => {
            const lr = await authFetch(`${API_BASE}/api/chapters/${ch.id}/lessons`);
            ch.lessons = lr.ok ? await lr.json() : [];
            return ch;
        }));
        container.innerHTML = withLessons.map(ch => renderChapterEditor(ch, courseId)).join('');
        bindChapterEditorEvents(courseId);
    } catch { container.innerHTML = '<div class="empty-state">Không thể tải dữ liệu</div>'; }
}

function renderChapterEditor(ch, courseId) {
    const lessons = ch.lessons || [];
    return `
    <div class="chapter-editor" data-chapter-id="${ch.id}">
      <div class="chapter-editor-head">
        <strong>${escapeHtml(ch.title)}</strong>
        <span class="row-actions">
          <button class="btn small" data-edit-ch="${ch.id}" data-title="${escapeHtml(ch.title)}" data-order="${ch.chapterOrder || ''}">Sửa</button>
          <button class="btn small red" data-del-ch="${ch.id}">Xóa</button>
        </span>
      </div>
      <div class="lesson-list">
        ${lessons.map(l => `
          <div class="lesson-editor-row">
            <span>${escapeHtml(l.title)}</span>
            <span class="row-actions">
              <button class="btn small" data-edit-lesson="${l.id}" data-chapter="${ch.id}"
                data-title="${escapeHtml(l.title)}" data-content="${escapeHtml(l.content || '')}"
                data-video="${escapeHtml(l.videoUrl || '')}" data-order="${l.lessonOrder || ''}">Sửa</button>
              <button class="btn small red" data-del-lesson="${l.id}">Xóa</button>
            </span>
          </div>`).join('') || '<div class="empty-hint">Chưa có bài học</div>'}
      </div>
      <form class="inline-form lesson-add-form" data-chapter="${ch.id}">
        <input class="field" name="title" placeholder="Tên bài học" required>
        <input class="field" name="videoUrl" placeholder="Link video (tuỳ chọn)">
        <textarea class="field textarea" name="content" placeholder="Nội dung bài học" rows="2"></textarea>
        <button class="btn small blue" type="submit">+ Bài học</button>
      </form>
    </div>`;
}

function bindChapterEditorEvents(courseId) {
    const container = document.getElementById('chapterManager');

    container.querySelectorAll('[data-del-ch]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Xóa chương này và tất cả bài học bên trong?')) return;
            await authFetch(`${API_BASE}/api/chapters/${btn.dataset.delCh}`, { method: 'DELETE' });
            showToast('Đã xóa chương');
            loadChapterManager(courseId);
        });
    });

    container.querySelectorAll('[data-edit-ch]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const title = prompt('Tên chương:', btn.dataset.title);
            if (!title) return;
            const order = prompt('Thứ tự (số):', btn.dataset.order || '1');
            await authFetch(`${API_BASE}/api/chapters/${btn.dataset.editCh}`, {
                method: 'PUT', body: JSON.stringify({ title: title.trim(), chapterOrder: parseInt(order, 10) || 1 })
            });
            showToast('Đã cập nhật chương');
            loadChapterManager(courseId);
        });
    });

    container.querySelectorAll('[data-del-lesson]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Xóa bài học này?')) return;
            await authFetch(`${API_BASE}/api/lessons/${btn.dataset.delLesson}`, { method: 'DELETE' });
            showToast('Đã xóa bài học');
            loadChapterManager(courseId);
        });
    });

    container.querySelectorAll('[data-edit-lesson]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const title = prompt('Tên bài học:', btn.dataset.title);
            if (!title) return;
            const content = prompt('Nội dung:', btn.dataset.content);
            const videoUrl = prompt('Link video:', btn.dataset.video);
            await authFetch(`${API_BASE}/api/lessons/${btn.dataset.editLesson}`, {
                method: 'PUT', body: JSON.stringify({
                    title: title.trim(), content: content || '', videoUrl: videoUrl || '',
                    lessonOrder: parseInt(btn.dataset.order, 10) || 1
                })
            });
            showToast('Đã cập nhật bài học');
            loadChapterManager(courseId);
        });
    });

    container.querySelectorAll('.lesson-add-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const chapterId = form.dataset.chapter;
            const fd = new FormData(form);
            const body = {
                title: fd.get('title').trim(),
                content: fd.get('content').trim(),
                videoUrl: fd.get('videoUrl').trim()
            };
            const res = await authFetch(`${API_BASE}/api/chapters/${chapterId}/lessons`, { method: 'POST', body: JSON.stringify(body) });
            if (!res.ok) { showToast(await res.text(), 'error'); return; }
            showToast('Thêm bài học thành công');
            form.reset();
            loadChapterManager(courseId);
        });
    });
}

async function loadCourseEnrollments(courseId, courseName) {
    document.getElementById('selectedCourseName').textContent = courseName || '';
    const rows = document.getElementById('enrollmentRows');
    rows.innerHTML = '<tr><td colspan="3">Đang tải...</td></tr>';
    try {
        const res = await authFetch(`${API_BASE}/api/courses/${courseId}/enrollments`);
        const list = await res.json();
        if (list.length === 0) { rows.innerHTML = '<tr><td colspan="3">Chưa có học viên</td></tr>'; return; }

        rows.innerHTML = list.map(e => `
      <tr>
        <td>${escapeHtml(e.userFullName)}</td><td>${statusBadge(e.status)}</td>
        <td class="row-actions">
          ${e.status === 'PENDING' ? `<button class="btn small blue" data-approve="${e.id}">Duyệt</button>` : ''}
          <button class="btn small red" data-icancel="${e.id}">Hủy</button>
        </td>
      </tr>`).join('');

        rows.querySelectorAll('[data-approve]').forEach(b => b.addEventListener('click', async () => {
            await authFetch(`${API_BASE}/api/enrollments/${b.dataset.approve}/approve`, { method: 'PUT' });
            showToast('Đã duyệt ghi danh');
            loadCourseEnrollments(courseId, courseName);
        }));
        rows.querySelectorAll('[data-icancel]').forEach(b => b.addEventListener('click', async () => {
            await authFetch(`${API_BASE}/api/enrollments/${b.dataset.icancel}/cancel`, { method: 'PUT' });
            showToast('Đã hủy ghi danh');
            loadCourseEnrollments(courseId, courseName);
        }));
    } catch { rows.innerHTML = '<tr><td colspan="3">Không thể tải dữ liệu</td></tr>'; }
}

// -- Admin --
function loadAdminDashboard() {
    document.querySelectorAll('[data-atab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-atab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ['courses', 'users', 'categories', 'stats'].forEach(t =>
                document.getElementById(`atab-${t}`).style.display = t === btn.dataset.atab ? '' : 'none');
            if (btn.dataset.atab === 'users') loadAdminUsers();
            if (btn.dataset.atab === 'categories') loadAdminCategories();
            if (btn.dataset.atab === 'stats') loadAdminStats();
        });
    });

    loadAdminPendingCourses();

    document.getElementById('createCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('categoryMessage');
        const body = { name: document.getElementById('catName').value.trim(), description: document.getElementById('catDescription').value.trim() };
        const res = await authFetch(`${API_BASE}/api/admin/categories`, { method: 'POST', body: JSON.stringify(body) });
        const text = await res.text();
        if (!res.ok) { msg.textContent = text; msg.classList.remove('ok'); return; }
        msg.textContent = 'Thêm thành công'; msg.classList.add('ok');
        showToast('Thêm danh mục thành công');
        document.getElementById('createCategoryForm').reset();
        loadAdminCategories();
    });

    document.getElementById('editCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('editCategoryMessage');
        const id = document.getElementById('editCatId').value;
        const body = {
            name: document.getElementById('editCatName').value.trim(),
            description: document.getElementById('editCatDescription').value.trim()
        };
        const res = await authFetch(`${API_BASE}/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        const text = await res.text();
        if (!res.ok) { msg.textContent = text; msg.classList.remove('ok'); return; }
        showToast('Cập nhật danh mục thành công');
        closeModal('editCategoryModal');
        loadAdminCategories();
    });
}

async function loadAdminPendingCourses() {
    const rows = document.getElementById('adminCourseRows');
    try {
        const res = await authFetch(`${API_BASE}/api/admin/courses?size=100`);
        const data = await res.json();
        const courses = data.content || [];
        if (courses.length === 0) { rows.innerHTML = '<tr><td colspan="4">Không có khóa học</td></tr>'; return; }

        rows.innerHTML = courses.map(c => `
      <tr>
        <td>${escapeHtml(c.title)}</td><td>${escapeHtml(c.instructorName || '-')}</td><td>${statusBadge(c.status)}</td>
        <td class="row-actions">
          ${c.status !== 'PUBLISHED' ? `<button class="btn small blue" data-approve-course="${c.id}" data-title="${escapeHtml(c.title)}">Duyệt</button>` : ''}
          ${c.status !== 'ARCHIVED' ? `<button class="btn small red" data-archive-course="${c.id}" data-title="${escapeHtml(c.title)}">Gỡ</button>` : ''}
        </td>
      </tr>`).join('');

        rows.querySelectorAll('[data-approve-course]').forEach(b => b.addEventListener('click', async () => {
            await authFetch(`${API_BASE}/api/courses/${b.dataset.approveCourse}`, {
                method: 'PUT', body: JSON.stringify({ title: b.dataset.title, status: 'PUBLISHED' })
            });
            showToast('Đã duyệt khóa học');
            loadAdminPendingCourses();
        }));
        rows.querySelectorAll('[data-archive-course]').forEach(b => b.addEventListener('click', async () => {
            await authFetch(`${API_BASE}/api/courses/${b.dataset.archiveCourse}`, {
                method: 'PUT', body: JSON.stringify({ title: b.dataset.title, status: 'ARCHIVED' })
            });
            showToast('Đã gỡ khóa học');
            loadAdminPendingCourses();
        }));
    } catch { rows.innerHTML = '<tr><td colspan="4">Không thể tải dữ liệu</td></tr>'; }
}

async function loadAdminUsers() {
    const rows = document.getElementById('userRows');
    const res = await authFetch(`${API_BASE}/api/admin/users?size=50`);
    const data = await res.json();
    const users = data.content || [];
    rows.innerHTML = users.map(u => `
    <tr>
      <td>${escapeHtml(u.username)}</td><td>${escapeHtml(u.fullName || '-')}</td><td>${u.roleName}</td>
      <td>${u.enabled ? statusBadge('ACTIVE') : statusBadge('CANCELLED')}</td>
      <td><button class="btn small ${u.enabled ? 'red' : 'blue'}" data-toggle="${u.id}">${u.enabled ? 'Khóa' : 'Mở'}</button></td>
    </tr>`).join('');
    rows.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', async () => {
        await authFetch(`${API_BASE}/api/admin/users/${b.dataset.toggle}/toggle`, { method: 'PUT' });
        showToast('Đã cập nhật trạng thái tài khoản');
        loadAdminUsers();
    }));
}

let adminCategoriesCache = [];

async function loadAdminCategories() {
    const rows = document.getElementById('categoryRows');
    const res = await fetch(`${API_BASE}/api/categories?size=100`);
    const data = await res.json();
    adminCategoriesCache = data.content || [];
    rows.innerHTML = adminCategoriesCache.map(c => `
    <tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.description || '-')}</td>
    <td class="row-actions">
      <button class="btn small blue" data-editcat="${c.id}">Sửa</button>
      <button class="btn small red" data-delcat="${c.id}">Xóa</button>
    </td></tr>`).join('');
    rows.querySelectorAll('[data-editcat]').forEach(b => b.addEventListener('click', () => {
        const cat = adminCategoriesCache.find(x => String(x.id) === b.dataset.editcat);
        if (!cat) return;
        document.getElementById('editCatId').value = cat.id;
        document.getElementById('editCatName').value = cat.name;
        document.getElementById('editCatDescription').value = cat.description || '';
        document.getElementById('editCategoryMessage').textContent = '';
        openModal('editCategoryModal');
    }));
    rows.querySelectorAll('[data-delcat]').forEach(b => b.addEventListener('click', async () => {
        if (!confirm('Xóa danh mục này?')) return;
        await authFetch(`${API_BASE}/api/admin/categories/${b.dataset.delcat}`, { method: 'DELETE' });
        showToast('Đã xóa danh mục');
        loadAdminCategories();
    }));
}

async function loadAdminStats() {
    const grid = document.getElementById('statsGrid');
    const rows = document.getElementById('statsRows');
    const res = await authFetch(`${API_BASE}/api/enrollments/statistics`);
    const stats = await res.json();
    const total = stats.reduce((s, x) => s + x.totalEnrolled, 0);
    const active = stats.reduce((s, x) => s + x.activeCount, 0);
    grid.innerHTML = `
    <div class="metric-card"><strong>${stats.length}</strong><span>khóa học</span></div>
    <div class="metric-card"><strong>${total}</strong><span>lượt ghi danh</span></div>
    <div class="metric-card"><strong>${active}</strong><span>đang học</span></div>`;
    rows.innerHTML = stats.map(s => `
    <tr><td>${escapeHtml(s.courseTitle)}</td><td>${s.totalEnrolled}</td><td>${s.activeCount}</td><td>${s.completedCount}</td><td>${s.cancelledCount}</td></tr>`).join('');
}

function initAdminPage() {
    const adminCourseRows = document.getElementById('adminCourseRows');
    if (!adminCourseRows) return;
    if (!requireLogin()) return;

    initModals();
    loadAdminDashboard();
}

function initTeacherPage() {
    const instructorCourseRows = document.getElementById('instructorCourseRows');
    if (!instructorCourseRows) return;
    if (!requireLogin()) return;

    initModals();
    loadInstructorDashboard();
}

// ---------- Khởi chạy ----------
document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    initAuthPage();
    initIndexPage();
    initCoursePage();
    initDashboardPage();
    initAdminPage();
    initTeacherPage();
});
