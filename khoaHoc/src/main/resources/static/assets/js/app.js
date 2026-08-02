const API = {
  tokenKey: 'course_access_token',
  userKey: 'course_username',
  token() {
    return localStorage.getItem(this.tokenKey);
  },
  user() {
    return localStorage.getItem(this.userKey);
  },
  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const token = this.token();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(path, { ...options, headers });
    const text = await response.text();
    let data = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      data = text;
    }
    if (!response.ok) {
      const message = data?.message || data?.error || data || 'Thao tác thất bại';
      throw new Error(message);
    }
    return data;
  },
  pageItems(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },
  setAuth(data) {
    localStorage.setItem(this.tokenKey, data.accessToken);
    localStorage.setItem(this.userKey, data.username || '');
  },
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = 'login.html';
  }
};

function text(value, fallback = '-') {
  return value === null || value === undefined || value === '' ? fallback : String(value);
}

function money(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} VND`;
}

function dateVi(value) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '-';
}

function statusVi(status) {
  const map = {
    DRAFT: 'Bản nháp',
    PUBLISHED: 'Đã xuất bản',
    ARCHIVED: 'Lưu trữ',
    PENDING: 'Chờ duyệt',
    ACTIVE: 'Đang học',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
  };
  return map[status] || text(status);
}

function roleVi(role) {
  const map = { ADMIN: 'Admin', INSTRUCTOR: 'Giảng viên', STUDENT: 'Học viên' };
  return map[role] || text(role);
}

let CURRENT_ROLE_CACHE = null;

// Vì token JWT không mang theo role và backend chưa có API /me,
// ta suy ra vai trò hiện tại bằng cách thử gọi lần lượt các API chỉ dành riêng cho từng vai trò.
async function detectRole() {
  if (!API.token()) return null;
  if (CURRENT_ROLE_CACHE) return CURRENT_ROLE_CACHE;
  try {
    await API.request('/api/admin/statistics/overview');
    CURRENT_ROLE_CACHE = 'ADMIN';
    return CURRENT_ROLE_CACHE;
  } catch (error) { /* not admin */ }
  try {
    await API.request('/api/instructor/statistics');
    CURRENT_ROLE_CACHE = 'INSTRUCTOR';
    return CURRENT_ROLE_CACHE;
  } catch (error) { /* not instructor */ }
  try {
    await API.request('/api/student/statistics');
    CURRENT_ROLE_CACHE = 'STUDENT';
    return CURRENT_ROLE_CACHE;
  } catch (error) { /* unknown */ }
  return null;
}

function monthKeys() {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

function renderBarChart(elementId, rows, keyA, keyB, labelA, labelB) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const max = Math.max(1, ...rows.map((r) => Math.max(Number(r[keyA] || 0), Number(r[keyB] || 0))));
  el.innerHTML = rows.map((r) => {
    const a = Number(r[keyA] || 0);
    const b = Number(r[keyB] || 0);
    const hA = Math.round((a / max) * 140);
    const hB = Math.round((b / max) * 140);
    return `
      <div class="bar-col" title="Tháng ${r.month}: ${labelA} ${a}, ${labelB} ${b}">
        <div class="bar-stack">
          <div class="bar a" style="height:${hA}px"></div>
          <div class="bar b" style="height:${hB}px"></div>
        </div>
        <span>T${r.month}</span>
      </div>`;
  }).join('');
}

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
  document.querySelectorAll('[data-username]').forEach((node) => {
    node.textContent = API.user() || 'Tài khoản';
  });
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', API.logout);
  });
}

function showMessage(id, value, ok = false) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = value;
  node.classList.toggle('ok', ok);
}

function fillOptions(select, items, placeholder = 'Chọn dữ liệu') {
  if (!select) return;
  select.innerHTML = `<option value="">${placeholder}</option>` + items
    .map((item) => `<option value="${item.id}">${text(item.name || item.title)}</option>`)
    .join('');
}

async function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const data = await API.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: body.username, password: body.password })
      });
      API.setAuth(data);
      window.location.href = 'courses.html';
    } catch (error) {
      showMessage('loginMessage', error.message);
    }
  });
}

async function initRegister() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      await API.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showMessage('registerMessage', 'Đăng ký thành công. Bạn có thể đăng nhập.', true);
      form.reset();
    } catch (error) {
      showMessage('registerMessage', error.message);
    }
  });
}

function courseCard(course) {
  return `
    <article class="course-card">
      <div class="course-thumb">${text(course.title, 'KH').slice(0, 2).toUpperCase()}</div>
      <div class="course-body">
        <h3>${text(course.title, 'Khóa học')}</h3>
        <p>${text(course.description, 'Nội dung khóa học đang được cập nhật.')}</p>
        <p><strong>${text(course.categoryName, 'Danh mục chung')}</strong> · ${text(course.instructorName, 'Giảng viên')}</p>
        <p>${money(course.price)}</p>
        <div class="row-actions">
          <a class="btn" href="course-detail.html?id=${course.id}">Chi tiết</a>
          <button class="btn primary" data-enroll="${course.id}">Đăng ký</button>
        </div>
      </div>
    </article>`;
}

async function loadCourses(keyword = '') {
  const list = document.getElementById('courseList');
  const count = document.getElementById('courseCount');
  const countText = document.getElementById('courseCountText');
  if (!list) return [];
  list.className = 'empty-state';
  list.innerHTML = 'Đang tải khóa học...';
  try {
    const path = keyword
      ? `/api/courses/search?keyword=${encodeURIComponent(keyword)}&page=0&size=12`
      : '/api/courses?page=0&size=12&sort=createdAt,desc';
    const data = await API.request(path, { method: 'GET' });
    const items = API.pageItems(data);
    if (count) count.textContent = String(items.length);
    if (countText) countText.textContent = `${items.length} khóa học`;
    list.className = items.length ? 'course-grid' : 'empty-state';
    list.innerHTML = items.length ? items.map(courseCard).join('') : 'Không tìm thấy khóa học phù hợp.';
    return items;
  } catch (error) {
    list.className = 'empty-state';
    list.innerHTML = error.message;
    return [];
  }
}

async function loadCategories() {
  const data = await API.request('/api/categories?page=0&size=50', { method: 'GET' });
  return API.pageItems(data);
}

async function initCourses() {
  if (!document.getElementById('courseList')) return;
  try {
    const categories = await loadCategories();
    const list = document.getElementById('categoryList');
    if (list) {
      list.innerHTML = categories.length
        ? categories.map((item) => `<li>${text(item.name)}</li>`).join('')
        : '<li>Chưa có danh mục</li>';
    }
  } catch (error) {
    const list = document.getElementById('categoryList');
    if (list) list.innerHTML = '<li>Không tải được danh mục</li>';
  }
  await loadCourses();
  document.getElementById('courseSearch')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = new FormData(event.currentTarget).get('keyword') || '';
    loadCourses(keyword.trim());
  });
}

async function enrollCourse(courseId, button) {
  if (!API.token()) {
    window.location.href = 'login.html';
    return;
  }
  await API.request('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify({ courseId: Number(courseId) })
  });
  if (button) {
    button.textContent = 'Đã đăng ký';
    button.disabled = true;
  }
}

async function initEnrollmentButtons() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-enroll]');
    if (!button) return;
    try {
      await enrollCourse(button.dataset.enroll, button);
    } catch (error) {
      alert(error.message);
    }
  });
}

async function initCourseDetail() {
  const root = document.getElementById('courseDetail');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    root.innerHTML = '<div class="empty-state">Thiếu mã khóa học.</div>';
    return;
  }
  try {
    const course = await API.request(`/api/courses/${id}`);
    const chapters = course.chapters || [];
    const lessons = chapters.flatMap((chapter) => chapter.lessons || []);
    document.getElementById('detailTitle').textContent = course.title || 'Chi tiết khóa học';
    document.getElementById('detailChapterCount').textContent = chapters.length;
    document.getElementById('detailLessonCount').textContent = lessons.length;
    root.innerHTML = `
      <div class="section-head">
        <h2>${text(course.title, 'Khóa học')}</h2>
        <span class="badge">${statusVi(course.status)}</span>
      </div>
      <div class="schedule-grid">
        <article class="schedule-item"><h3>Danh mục</h3><p>${text(course.categoryName)}</p></article>
        <article class="schedule-item"><h3>Giảng viên</h3><p>${text(course.instructorName)}</p></article>
        <article class="schedule-item"><h3>Học phí</h3><p>${money(course.price)}</p></article>
        <article class="schedule-item"><h3>Ngày tạo</h3><p>${dateVi(course.createdAt)}</p></article>
      </div>
      <p class="detail-copy">${text(course.description, 'Khóa học chưa có mô tả.')}</p>
      <div class="inline-actions">
        <button class="btn primary" data-enroll="${course.id}">Đăng ký khóa học</button>
        <a class="btn" href="management.html">Sửa nội dung (chương/bài học)</a>
        <button class="btn red" data-delete-course="${course.id}">Xóa khóa học</button>
      </div>
      <div class="section-head"><h2>Chương trình học</h2><span class="count">${lessons.length} bài học</span></div>
      <div class="chapter-list">
        ${chapters.length ? chapters.map((chapter) => `
          <article class="chapter-box">
            <h3>${chapter.chapterOrder || 0}. ${text(chapter.title, 'Chương học')}</h3>
            <ul>
              ${(chapter.lessons || []).map((lesson) => `<li>${lesson.lessonOrder || 0}. ${text(lesson.title)}${lesson.videoUrl ? ' · Có video' : ''}</li>`).join('') || '<li>Chưa có bài học</li>'}
            </ul>
          </article>
        `).join('') : '<div class="empty-state">Khóa học chưa có chương/bài học.</div>'}
      </div>
      <div class="section-head"><h2>Quản lý ghi danh</h2><span class="count">Chỉ hiển thị nếu bạn là chủ khóa học hoặc Admin</span></div>
      <table class="table">
        <thead><tr><th>Học viên</th><th>Trạng thái</th><th>Ngày đăng ký</th><th>Thao tác</th></tr></thead>
        <tbody id="courseEnrollmentRows"><tr><td colspan="4">Đang tải danh sách ghi danh...</td></tr></tbody>
      </table>`;
    await loadCourseEnrollments(course.id);
  } catch (error) {
    root.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

async function loadCourseEnrollments(courseId, targetId = 'courseEnrollmentRows') {
  const body = document.getElementById(targetId);
  if (!body) return;
  if (!API.token()) {
    body.innerHTML = '<tr><td colspan="4">Đăng nhập với quyền Admin/Giảng viên để xem ghi danh.</td></tr>';
    return;
  }
  try {
    const list = await API.request(`/api/courses/${courseId}/enrollments`);
    const items = Array.isArray(list) ? list : API.pageItems(list);
    body.innerHTML = items.length ? items.map((item) => `
      <tr>
        <td>${text(item.studentName || item.username || item.userId)}</td>
        <td><span class="badge">${statusVi(item.status)}</span></td>
        <td>${dateVi(item.enrolledDate)}</td>
        <td class="inline-actions">
          <button class="btn small" data-approve-enroll="${item.id}" data-course-id="${courseId}" data-target-id="${targetId}" ${item.status !== 'PENDING' ? 'disabled' : ''}>Duyệt</button>
          <button class="btn small red" data-cancel-enroll="${item.id}" data-course-id="${courseId}" data-target-id="${targetId}" ${item.status === 'CANCELLED' ? 'disabled' : ''}>Hủy</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="4">Chưa có học viên ghi danh khóa học này.</td></tr>';
  } catch (error) {
    body.innerHTML = `<tr><td colspan="4">${error.message === 'Thao tác thất bại' ? 'Bạn không có quyền xem danh sách ghi danh của khóa học này.' : error.message}</td></tr>`;
  }
}

function initCourseOwnerActions() {
  document.addEventListener('click', async (event) => {
    const del = event.target.closest('[data-delete-course]');
    if (del) {
      if (!confirm('Xóa khóa học này? Hành động không thể hoàn tác.')) return;
      try {
        await API.request(`/api/courses/${del.dataset.deleteCourse}`, { method: 'DELETE' });
        alert('Đã xóa khóa học.');
        window.location.href = 'management.html';
      } catch (error) {
        alert(error.message);
      }
      return;
    }
    const approve = event.target.closest('[data-approve-enroll]');
    if (approve) {
      try {
        await API.request(`/api/enrollments/${approve.dataset.approveEnroll}/approve`, { method: 'PUT' });
        await loadCourseEnrollments(approve.dataset.courseId, approve.dataset.targetId || 'courseEnrollmentRows');
      } catch (error) {
        alert(error.message);
      }
      return;
    }
    const cancel = event.target.closest('[data-cancel-enroll]');
    if (cancel) {
      try {
        await API.request(`/api/enrollments/${cancel.dataset.cancelEnroll}/cancel`, { method: 'PUT' });
        await loadCourseEnrollments(cancel.dataset.courseId, cancel.dataset.targetId || 'courseEnrollmentRows');
      } catch (error) {
        alert(error.message);
      }
    }
  });
}

async function loadMyCourses(targetId = 'myCourseRows') {
  const body = document.getElementById(targetId);
  if (!body) return [];
  if (!API.token()) {
    body.innerHTML = '<tr><td colspan="5">Đăng nhập để xem dữ liệu.</td></tr>';
    return [];
  }
  try {
    const data = await API.request('/api/student/courses?page=0&size=50');
    const items = API.pageItems(data);
    body.innerHTML = items.length ? items.map((item) => `
      <tr>
        <td>${text(item.courseTitle || item.title, 'Khóa học')}</td>
        <td><span class="badge">${statusVi(item.status)}</span></td>
        <td><div class="progress"><span style="width:${item.status === 'COMPLETED' ? 100 : item.status === 'ACTIVE' ? 55 : item.status === 'CANCELLED' ? 0 : 15}%"></span></div></td>
        <td>${dateVi(item.enrolledDate)}</td>
        <td><button class="btn" data-cancel="${item.id}" ${item.status === 'CANCELLED' ? 'disabled' : ''}>Hủy</button></td>
      </tr>`).join('') : '<tr><td colspan="5">Bạn chưa đăng ký khóa học nào.</td></tr>';
    return items;
  } catch (error) {
    body.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    return [];
  }
}

async function initMyCourses() {
  if (!document.getElementById('myCourseRows')) return;
  const items = await loadMyCourses();
  updateStudentProgress(items);
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-cancel]');
    if (!button) return;
    try {
      await API.request(`/api/enrollments/${button.dataset.cancel}/cancel`, { method: 'PUT' });
      await loadMyCourses();
    } catch (error) {
      alert(error.message);
    }
  });
}

function updateStudentProgress(items) {
  const total = items.length;
  const active = items.filter((item) => item.status === 'ACTIVE').length;
  const completed = items.filter((item) => item.status === 'COMPLETED').length;
  const pending = items.filter((item) => item.status === 'PENDING').length;
  const cancelled = items.filter((item) => item.status === 'CANCELLED').length;
  const percent = total ? Math.round(((active * 0.55) + completed) / total * 100) : 0;
  const map = { studentTotal: total, studentActive: active, studentCompleted: completed, studentPending: pending, studentCancelled: cancelled, studentProgress: `${percent}%` };
  Object.entries(map).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  });
  document.querySelectorAll('[data-student-active]').forEach((node) => { node.textContent = active; });
  document.querySelectorAll('[data-student-pending]').forEach((node) => { node.textContent = pending; });
  document.querySelectorAll('[data-student-completed]').forEach((node) => { node.textContent = completed; });
  document.querySelectorAll('[data-student-cancelled]').forEach((node) => { node.textContent = cancelled; });
  const bar = document.getElementById('studentProgressBar');
  if (bar) bar.style.width = `${percent}%`;
}

async function initStudentPage() {
  const body = document.getElementById('studentCourseRows');
  if (!body) return;
  const items = await loadMyCourses('studentCourseRows');
  updateStudentProgress(items);
  const subjectsEl = document.getElementById('studentSubjects');
  if (subjectsEl && API.token()) {
    try {
      const stats = await API.request('/api/student/statistics');
      subjectsEl.textContent = text(stats.totalSubjects, '0');
    } catch (error) {
      subjectsEl.textContent = '-';
    }
  }
}

async function loadManagementLookups() {
  const categories = await loadCategories().catch(() => []);
  fillOptions(document.getElementById('courseCategoryId'), categories, 'Chọn danh mục');
  const courses = API.token()
    ? API.pageItems(await API.request('/api/instructor/courses?page=0&size=50').catch(() => ({ content: [] })))
    : [];
  fillOptions(document.getElementById('chapterCourseId'), courses, 'Chọn khóa học');
  fillOptions(document.getElementById('lessonCourseId'), courses, 'Chọn khóa học');
  fillOptions(document.getElementById('enrollmentCourseId'), courses, 'Chọn khóa học');
  return courses;
}

async function initCategoryAdmin() {
  const table = document.getElementById('categoryRows');
  const form = document.getElementById('categoryForm');
  if (!table && !form) return;
  async function render() {
    try {
      const items = await loadCategories();
      const count = document.getElementById('categoryCount');
      if (count) count.textContent = items.length;
      if (table) {
        table.innerHTML = items.length ? items.map((item) => `
          <tr>
            <td>${item.id}</td>
            <td>${text(item.name)}</td>
            <td>${text(item.description, 'Chưa có mô tả')}</td>
            <td class="inline-actions">
              <button class="btn small" data-edit-category="${item.id}" data-name="${text(item.name).replace(/"/g, '&quot;')}" data-description="${text(item.description, '').replace(/"/g, '&quot;')}">Sửa</button>
              <button class="btn small red" data-delete-category="${item.id}">Xóa</button>
            </td>
          </tr>`).join('') : '<tr><td colspan="4">Chưa có danh mục.</td></tr>';
      }
    } catch (error) {
      if (table) table.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
    }
  }
  const submitBtn = form?.querySelector('button[type="submit"]');
  let editingId = null;
  function resetEditState() {
    editingId = null;
    if (submitBtn) submitBtn.textContent = 'Tạo danh mục';
    const flag = document.getElementById('categoryEditFlag');
    if (flag) flag.classList.remove('on');
  }
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      if (editingId) {
        await API.request(`/api/admin/categories/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        showMessage('categoryMessage', 'Đã cập nhật danh mục.', true);
      } else {
        await API.request('/api/admin/categories', { method: 'POST', body: JSON.stringify(body) });
        showMessage('categoryMessage', 'Đã tạo danh mục.', true);
      }
      form.reset();
      resetEditState();
      await render();
    } catch (error) {
      showMessage('categoryMessage', error.message);
    }
  });
  document.addEventListener('click', async (event) => {
    const editBtn = event.target.closest('[data-edit-category]');
    if (editBtn && form) {
      editingId = editBtn.dataset.editCategory;
      form.elements.name.value = editBtn.dataset.name || '';
      form.elements.description.value = editBtn.dataset.description || '';
      if (submitBtn) submitBtn.textContent = 'Cập nhật danh mục';
      const flag = document.getElementById('categoryEditFlag');
      if (flag) flag.classList.add('on');
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const cancelEdit = event.target.closest('[data-cancel-category-edit]');
    if (cancelEdit && form) {
      form.reset();
      resetEditState();
      return;
    }
    const button = event.target.closest('[data-delete-category]');
    if (!button) return;
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await API.request(`/api/admin/categories/${button.dataset.deleteCategory}`, { method: 'DELETE' });
      await render();
    } catch (error) {
      alert(error.message);
    }
  });
  await render();
}

async function initManagement() {
  if (!document.getElementById('managementPanel')) return;
  if (!API.token()) {
    showMessage('managementMessage', 'Đăng nhập tài khoản ADMIN hoặc INSTRUCTOR để thao tác dữ liệu.');
  }
  let courses = await loadManagementLookups();
  renderTeacherCourses(courses);
  await renderStatistics();
  await renderAdminOverviewIfAdmin();

  const courseForm = document.getElementById('courseForm');
  const courseSubmitBtn = courseForm?.querySelector('button[type="submit"]');
  let editingCourseId = null;
  function resetCourseEdit() {
    editingCourseId = null;
    if (courseSubmitBtn) courseSubmitBtn.textContent = 'Tạo khóa học bản nháp';
    const flag = document.getElementById('courseEditFlag');
    if (flag) flag.classList.remove('on');
  }

  courseForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    body.price = Number(body.price || 0);
    body.categoryId = Number(body.categoryId);
    try {
      if (editingCourseId) {
        await API.request(`/api/courses/${editingCourseId}`, { method: 'PUT', body: JSON.stringify(body) });
        showMessage('managementMessage', 'Đã cập nhật khóa học.', true);
      } else {
        await API.request('/api/courses', { method: 'POST', body: JSON.stringify(body) });
        showMessage('managementMessage', 'Đã tạo khóa học bản nháp.', true);
      }
      event.currentTarget.reset();
      resetCourseEdit();
      courses = await loadManagementLookups();
      renderTeacherCourses(courses);
    } catch (error) {
      showMessage('managementMessage', error.message);
    }
  });

  document.getElementById('chapterForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const courseId = body.courseId;
    delete body.courseId;
    body.chapterOrder = Number(body.chapterOrder || 0);
    try {
      await API.request(`/api/courses/${courseId}/chapters`, { method: 'POST', body: JSON.stringify(body) });
      showMessage('managementMessage', 'Đã thêm chương học.', true);
      event.currentTarget.reset();
      if (document.getElementById('chapterCourseId').value === courseId) await loadChapterList(courseId);
    } catch (error) {
      showMessage('managementMessage', error.message);
    }
  });

  document.getElementById('chapterCourseId')?.addEventListener('change', (event) => {
    if (event.target.value) loadChapterList(event.target.value);
    else { const t = document.getElementById('chapterListRows'); if (t) t.innerHTML = '<tr><td colspan="4">Chọn khóa học để xem chương.</td></tr>'; }
  });

  document.getElementById('lessonCourseId')?.addEventListener('change', loadChapterOptions);
  document.getElementById('lessonChapterId')?.addEventListener('change', (event) => {
    if (event.target.value) loadLessonList(event.target.value);
    else { const t = document.getElementById('lessonListRows'); if (t) t.innerHTML = '<tr><td colspan="4">Chọn chương để xem bài học.</td></tr>'; }
  });
  document.getElementById('lessonForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const chapterId = body.chapterId;
    delete body.chapterId;
    delete body.courseId;
    body.lessonOrder = Number(body.lessonOrder || 0);
    try {
      await API.request(`/api/chapters/${chapterId}/lessons`, { method: 'POST', body: JSON.stringify(body) });
      showMessage('managementMessage', 'Đã thêm bài học.', true);
      event.currentTarget.reset();
      if (document.getElementById('lessonChapterId').value === chapterId) await loadLessonList(chapterId);
    } catch (error) {
      showMessage('managementMessage', error.message);
    }
  });

  document.getElementById('enrollmentCourseId')?.addEventListener('change', (event) => {
    if (event.target.value) loadCourseEnrollments(event.target.value, 'mgmtEnrollmentRows');
    else { const t = document.getElementById('mgmtEnrollmentRows'); if (t) t.innerHTML = '<tr><td colspan="4">Chọn khóa học để xem ghi danh.</td></tr>'; }
  });

  document.addEventListener('click', async (event) => {
    const editBtn = event.target.closest('[data-edit-course]');
    if (editBtn && courseForm) {
      const course = JSON.parse(decodeURIComponent(editBtn.dataset.editCourse));
      editingCourseId = course.id;
      courseForm.elements.title.value = course.title || '';
      courseForm.elements.description.value = course.description || '';
      courseForm.elements.thumbnailUrl.value = course.thumbnailUrl || '';
      courseForm.elements.price.value = course.price || 0;
      if (course.categoryId) courseForm.elements.categoryId.value = course.categoryId;
      if (courseSubmitBtn) courseSubmitBtn.textContent = 'Cập nhật khóa học';
      const flag = document.getElementById('courseEditFlag');
      if (flag) flag.classList.add('on');
      courseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const cancelCourseEdit = event.target.closest('[data-cancel-course-edit]');
    if (cancelCourseEdit && courseForm) {
      courseForm.reset();
      resetCourseEdit();
      return;
    }
    const delCourse = event.target.closest('[data-delete-course-mgmt]');
    if (delCourse) {
      if (!confirm('Xóa khóa học này?')) return;
      try {
        await API.request(`/api/courses/${delCourse.dataset.deleteCourseMgmt}`, { method: 'DELETE' });
        courses = await loadManagementLookups();
        renderTeacherCourses(courses);
      } catch (error) {
        alert(error.message);
      }
      return;
    }
    const delChapter = event.target.closest('[data-delete-chapter]');
    if (delChapter) {
      if (!confirm('Xóa chương này? Các bài học bên trong cũng sẽ mất.')) return;
      try {
        await API.request(`/api/chapters/${delChapter.dataset.deleteChapter}`, { method: 'DELETE' });
        await loadChapterList(document.getElementById('chapterCourseId').value);
      } catch (error) {
        alert(error.message);
      }
      return;
    }
    const delLesson = event.target.closest('[data-delete-lesson]');
    if (delLesson) {
      if (!confirm('Xóa bài học này?')) return;
      try {
        await API.request(`/api/lessons/${delLesson.dataset.deleteLesson}`, { method: 'DELETE' });
        await loadLessonList(document.getElementById('lessonChapterId').value);
      } catch (error) {
        alert(error.message);
      }
    }
  });
}

async function loadChapterList(courseId) {
  const body = document.getElementById('chapterListRows');
  if (!body) return;
  body.innerHTML = '<tr><td colspan="4">Đang tải...</td></tr>';
  try {
    const chapters = await API.request(`/api/courses/${courseId}/chapters`);
    const items = Array.isArray(chapters) ? chapters : API.pageItems(chapters);
    body.innerHTML = items.length ? items.map((c) => `
      <tr>
        <td>${c.id}</td>
        <td>${c.chapterOrder || 0}</td>
        <td>${text(c.title)}</td>
        <td class="inline-actions"><button class="btn small red" data-delete-chapter="${c.id}">Xóa</button></td>
      </tr>`).join('') : '<tr><td colspan="4">Khóa học chưa có chương.</td></tr>';
  } catch (error) {
    body.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
  }
}

async function loadLessonList(chapterId) {
  const body = document.getElementById('lessonListRows');
  if (!body) return;
  body.innerHTML = '<tr><td colspan="4">Đang tải...</td></tr>';
  try {
    const lessons = await API.request(`/api/chapters/${chapterId}/lessons`);
    const items = Array.isArray(lessons) ? lessons : API.pageItems(lessons);
    body.innerHTML = items.length ? items.map((l) => `
      <tr>
        <td>${l.id}</td>
        <td>${l.lessonOrder || 0}</td>
        <td>${text(l.title)}${l.videoUrl ? ' · Có video' : ''}</td>
        <td class="inline-actions"><button class="btn small red" data-delete-lesson="${l.id}">Xóa</button></td>
      </tr>`).join('') : '<tr><td colspan="4">Chương chưa có bài học.</td></tr>';
  } catch (error) {
    body.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
  }
}

async function renderAdminOverviewIfAdmin() {
  const grid = document.getElementById('adminOverviewGrid');
  if (!grid) return;
  if (!API.token()) {
    grid.innerHTML = '<div class="empty-state">Đăng nhập với quyền Admin để xem tổng quan hệ thống.</div>';
    return;
  }
  try {
    const o = await API.request('/api/admin/statistics/overview');
    const cards = [
      ['Người dùng', o.totalUsers], ['Học viên', o.totalStudents], ['Giảng viên', o.totalInstructors], ['Admin', o.totalAdmins],
      ['Khóa học', o.totalCourses], ['Bản nháp', o.totalDraftCourses], ['Đã xuất bản', o.totalPublishedCourses], ['Lưu trữ', o.totalArchivedCourses],
      ['Danh mục', o.totalCategories], ['Bài học', o.totalLessons],
      ['Tổng ghi danh', o.totalEnrollments], ['Chờ duyệt', o.totalPendingEnrollments], ['Đang học', o.totalActiveEnrollments], ['Hoàn thành', o.totalCompletedEnrollments], ['Đã hủy', o.totalCancelledEnrollments]
    ];
    grid.innerHTML = cards.map(([label, value]) => `<div class="overview-card"><strong>${text(value, '0')}</strong><span>${label}</span></div>`).join('');
    const chartWrap = document.getElementById('adminMonthlyChartWrap');
    if (chartWrap) {
      chartWrap.style.display = '';
      const monthly = await API.request('/api/admin/statistics/courses/monthly');
      renderBarChart('adminMonthlyChart', monthly, 'createdCourseCount', 'enrollmentCount', 'Khóa học mới', 'Lượt ghi danh');
    }
  } catch (error) {
    grid.innerHTML = `<div class="empty-state">${error.message === 'Thao tác thất bại' ? 'Chỉ tài khoản ADMIN mới xem được tổng quan hệ thống.' : error.message}</div>`;
  }
}

async function loadChapterOptions() {
  const courseId = document.getElementById('lessonCourseId')?.value;
  const select = document.getElementById('lessonChapterId');
  if (!courseId || !select) return;
  const chapters = await API.request(`/api/courses/${courseId}/chapters`);
  fillOptions(select, chapters, 'Chọn chương');
}

function renderTeacherCourses(courses) {
  const body = document.getElementById('teacherCourseRows');
  const count = document.getElementById('teacherCourseCount');
  if (count) count.textContent = courses.length;
  if (!body) return;
  const editable = !!document.getElementById('courseForm');
  body.innerHTML = courses.length ? courses.map((course) => `
    <tr>
      <td>${course.id}</td>
      <td>${text(course.title)}</td>
      <td>${statusVi(course.status)}</td>
      <td>${text(course.categoryName)}</td>
      <td class="inline-actions">
        <a class="btn small" href="course-detail.html?id=${course.id}">Nội dung</a>
        ${editable ? `<button class="btn small" data-edit-course="${encodeURIComponent(JSON.stringify(course))}">Sửa</button>
        <button class="btn small red" data-delete-course-mgmt="${course.id}">Xóa</button>` : ''}
      </td>
    </tr>`).join('') : '<tr><td colspan="5">Chưa có khóa học do tài khoản này tạo hoặc chưa đăng nhập.</td></tr>';
}

async function initTeacherPage() {
  if (!document.getElementById('teacherCourseRows')) return;
  const courses = API.token()
    ? API.pageItems(await API.request('/api/instructor/courses?page=0&size=50').catch(() => ({ content: [] })))
    : [];
  renderTeacherCourses(courses);
  await renderStatistics();
  await renderInstructorSummary();
}

async function renderInstructorSummary() {
  const wrap = document.getElementById('instructorSummary');
  if (!wrap) return;
  if (!API.token()) {
    wrap.innerHTML = '<div class="empty-state">Đăng nhập với tài khoản Giảng viên để xem tổng quan.</div>';
    return;
  }
  try {
    const stats = await API.request('/api/instructor/statistics');
    wrap.innerHTML = `
      <div class="metric-grid">
        <div class="metric-card"><strong>${text(stats.totalCourses, '0')}</strong>Khóa phụ trách</div>
        <div class="metric-card"><strong>${text(stats.totalStudents, '0')}</strong>Học viên</div>
        <div class="metric-card"><strong>${text(stats.totalLessons, '0')}</strong>Bài học đã đăng</div>
      </div>`;
    const monthly = await API.request('/api/instructor/statistics/activity/monthly');
    renderBarChart('instructorMonthlyChart', monthly, 'lessonCount', 'enrollmentCount', 'Bài học mới', 'Lượt ghi danh');
    const chartWrap = document.getElementById('instructorMonthlyChartWrap');
    if (chartWrap) chartWrap.style.display = '';
  } catch (error) {
    wrap.innerHTML = `<div class="empty-state">${error.message === 'Thao tác thất bại' ? 'Chỉ tài khoản Giảng viên/Admin mới xem được số liệu này.' : error.message}</div>`;
  }
}

async function renderStatistics() {
  const body = document.getElementById('statRows');
  const progressBody = document.getElementById('progressRows');
  if (!body && !progressBody) return [];
  if (!API.token()) {
    const msg = '<tr><td colspan="6">Đăng nhập ADMIN hoặc INSTRUCTOR để xem thống kê ghi danh.</td></tr>';
    if (body) body.innerHTML = msg;
    if (progressBody) progressBody.innerHTML = msg;
    return [];
  }
  try {
    const stats = await API.request('/api/enrollments/statistics');
    const totalCourses = stats.length;
    const totalEnrolled = stats.reduce((sum, item) => sum + Number(item.totalEnrolled || 0), 0);
    const active = stats.reduce((sum, item) => sum + Number(item.activeCount || 0), 0);
    const completed = stats.reduce((sum, item) => sum + Number(item.completedCount || 0), 0);
    const cancelled = stats.reduce((sum, item) => sum + Number(item.cancelledCount || 0), 0);
    const pending = Math.max(totalEnrolled - active - completed - cancelled, 0);
    const doneRate = totalEnrolled ? Math.round(completed / totalEnrolled * 100) : 0;
    const activeRate = totalEnrolled ? Math.round(active / totalEnrolled * 100) : 0;
    const topCourse = stats.reduce((best, item) => Number(item.totalEnrolled || 0) > Number(best?.totalEnrolled || 0) ? item : best, null);
    const values = {
      statCourseTotal: totalCourses,
      statEnrollTotal: totalEnrolled,
      statPendingTotal: pending,
      statActiveTotal: active,
      statCompletedTotal: completed,
      statCancelledTotal: cancelled,
      statDoneRate: `${doneRate}%`,
      statDoneRateCard: `${doneRate}%`,
      statActiveRate: `${activeRate}%`,
      statTopCourse: topCourse ? text(topCourse.courseTitle) : '-',
      statTopCourseNote: topCourse ? `${topCourse.totalEnrolled} lượt ghi danh, ${topCourse.completedCount} hoàn thành.` : 'Chưa có dữ liệu ghi danh để đánh giá.'
    };
    Object.entries(values).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    });
    if (body) {
      body.innerHTML = stats.length ? stats.map((item) => `
        <tr>
          <td>${item.courseId}</td>
          <td>${text(item.courseTitle)}</td>
          <td>${item.totalEnrolled}</td>
          <td>${item.activeCount}</td>
          <td>${item.completedCount}</td>
          <td>${item.cancelledCount}</td>
        </tr>`).join('') : '<tr><td colspan="6">Chưa có dữ liệu thống kê.</td></tr>';
    }
    if (progressBody) {
      progressBody.innerHTML = stats.length ? stats.map((item) => {
        const total = Number(item.totalEnrolled || 0);
        const percent = total ? Math.round(Number(item.completedCount || 0) / total * 100) : 0;
        return `
          <tr>
            <td>${text(item.courseTitle)}</td>
            <td><div class="progress"><span style="width:${percent}%"></span></div></td>
            <td>${percent}%</td>
            <td>${item.activeCount} đang học / ${item.completedCount} hoàn thành</td>
          </tr>`;
      }).join('') : '<tr><td colspan="4">Chưa có tiến độ.</td></tr>';
    }
    return stats;
  } catch (error) {
    const msg = `<tr><td colspan="6">${error.message}</td></tr>`;
    if (body) body.innerHTML = msg;
    if (progressBody) progressBody.innerHTML = msg;
    return [];
  }
}

async function initStatisticsPage() {
  if (!document.getElementById('statRows') && !document.getElementById('progressRows')) return;
  await renderStatistics();
  await renderAdminOverviewIfAdmin();
}

async function initAdminPage() {
  if (!document.getElementById('adminOverviewGrid')) return;
  await renderAdminOverviewIfAdmin();
}

/* ===== Quản lý điểm số (chưa có API backend — lưu cục bộ trên trình duyệt) ===== */
const GRADE_STORE_KEY = 'course_grade_records_v1';

function loadGradeStore() {
  try {
    return JSON.parse(localStorage.getItem(GRADE_STORE_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function saveGradeStore(rows) {
  localStorage.setItem(GRADE_STORE_KEY, JSON.stringify(rows));
}

function computeFinalGrade(attendance, midterm, final) {
  const a = Number(attendance || 0);
  const m = Number(midterm || 0);
  const f = Number(final || 0);
  return Math.round((a * 0.1 + m * 0.3 + f * 0.6) * 10) / 10;
}

async function initGradeManagement() {
  const form = document.getElementById('gradeForm');
  const table = document.getElementById('gradeRows');
  if (!form && !table) return;

  let editingId = null;
  const submitBtn = form.querySelector('[data-grade-submit]');

  function currentClass() {
    return form.elements.classCode.value;
  }

  function render() {
    const rows = loadGradeStore().filter((r) => r.classCode === currentClass());
    const title = document.getElementById('gradeClassTitle');
    if (title) title.textContent = form.elements.classCode.selectedOptions[0]?.textContent || '';
    table.innerHTML = rows.length ? rows.map((r) => `
      <tr>
        <td>${text(r.studentCode)}</td>
        <td>${text(r.studentName)}</td>
        <td>${text(r.attendance)}</td>
        <td>${text(r.midterm)}</td>
        <td>${text(r.final)}</td>
        <td><strong>${text(r.total)}</strong></td>
        <td class="inline-actions">
          <button class="btn small" data-edit-grade="${r.id}">Sửa</button>
          <button class="btn small red" data-delete-grade="${r.id}">Xóa</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="7">Chưa có dữ liệu điểm cho lớp này.</td></tr>';
  }

  function resetForm() {
    editingId = null;
    form.reset();
    if (submitBtn) submitBtn.textContent = 'Lưu điểm';
  }

  form?.addEventListener('change', (event) => {
    if (event.target.name === 'classCode') render();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    const total = computeFinalGrade(body.attendance, body.midterm, body.final);
    const rows = loadGradeStore();
    if (editingId) {
      const idx = rows.findIndex((r) => r.id === editingId);
      if (idx >= 0) rows[idx] = { ...rows[idx], ...body, total };
    } else {
      rows.push({ id: `g${Date.now()}`, ...body, total });
    }
    saveGradeStore(rows);
    resetForm();
    render();
  });

  table?.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-edit-grade]');
    if (editBtn) {
      const row = loadGradeStore().find((r) => r.id === editBtn.dataset.editGrade);
      if (!row) return;
      editingId = row.id;
      form.elements.studentCode.value = row.studentCode || '';
      form.elements.studentName.value = row.studentName || '';
      form.elements.classCode.value = row.classCode;
      form.elements.attendance.value = row.attendance || '';
      form.elements.midterm.value = row.midterm || '';
      form.elements.final.value = row.final || '';
      form.elements.note.value = row.note || '';
      if (submitBtn) submitBtn.textContent = 'Cập nhật điểm';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const delBtn = event.target.closest('[data-delete-grade]');
    if (delBtn) {
      if (!confirm('Xóa điểm của học sinh này?')) return;
      const rows = loadGradeStore().filter((r) => r.id !== delBtn.dataset.deleteGrade);
      saveGradeStore(rows);
      render();
    }
  });

  render();
}

/* ===== Quản lý người dùng (chưa có API backend — lưu cục bộ trên trình duyệt) ===== */
const USER_STORE_KEY = 'course_user_records_v1';

function loadUserStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(USER_STORE_KEY) || 'null');
    if (stored) return stored;
  } catch (error) { /* ignore */ }
  const seed = [
    { id: 'u1', username: 'student', fullName: 'Hà Trọng Đồng', role: 'STUDENT', email: 'student@demo.vn', phone: '', status: 'ACTIVE' },
    { id: 'u2', username: 'instructor', fullName: 'Giảng viên Demo', role: 'INSTRUCTOR', email: 'teacher@demo.vn', phone: '', status: 'ACTIVE' }
  ];
  saveUserStore(seed);
  return seed;
}

function saveUserStore(rows) {
  localStorage.setItem(USER_STORE_KEY, JSON.stringify(rows));
}

function roleBadgeClass(role) {
  if (role === 'ADMIN') return 'admin';
  if (role === 'INSTRUCTOR') return 'instructor';
  return 'student';
}

async function initUserManagement() {
  const form = document.getElementById('userForm');
  const table = document.getElementById('userRows');
  const search = document.getElementById('userSearch');
  if (!form && !table) return;

  let editingId = null;
  const submitBtn = form.querySelector('[data-user-submit]');

  function render() {
    const keyword = (search?.value || '').trim().toLowerCase();
    const rows = loadUserStore().filter((r) =>
      !keyword || r.username.toLowerCase().includes(keyword) || r.fullName.toLowerCase().includes(keyword));
    const count = document.getElementById('userCount');
    if (count) count.textContent = loadUserStore().length;
    table.innerHTML = rows.length ? rows.map((r) => `
      <tr>
        <td>${text(r.username)}</td>
        <td>${text(r.fullName)}</td>
        <td><span class="role-badge ${roleBadgeClass(r.role)}">${roleVi(r.role)}</span></td>
        <td>${text(r.email)}</td>
        <td>${r.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}</td>
        <td class="inline-actions">
          <button class="btn small" data-edit-user="${r.id}">Sửa</button>
          <button class="btn small red" data-delete-user="${r.id}">Xóa</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="6">Không tìm thấy người dùng phù hợp.</td></tr>';
  }

  function resetForm() {
    editingId = null;
    form.reset();
    if (submitBtn) submitBtn.textContent = 'Tạo tài khoản';
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    if (!body.username || !body.fullName) return;
    const rows = loadUserStore();
    if (editingId) {
      const idx = rows.findIndex((r) => r.id === editingId);
      if (idx >= 0) rows[idx] = { ...rows[idx], ...body };
    } else {
      if (rows.some((r) => r.username === body.username)) {
        alert('Tên đăng nhập đã tồn tại trong danh sách.');
        return;
      }
      rows.push({ id: `u${Date.now()}`, ...body });
    }
    saveUserStore(rows);
    resetForm();
    render();
  });

  search?.addEventListener('input', render);

  table?.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-edit-user]');
    if (editBtn) {
      const row = loadUserStore().find((r) => r.id === editBtn.dataset.editUser);
      if (!row) return;
      editingId = row.id;
      form.elements.username.value = row.username || '';
      form.elements.fullName.value = row.fullName || '';
      form.elements.role.value = row.role || 'STUDENT';
      form.elements.email.value = row.email || '';
      form.elements.phone.value = row.phone || '';
      form.elements.status.value = row.status || 'ACTIVE';
      if (submitBtn) submitBtn.textContent = 'Cập nhật tài khoản';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const delBtn = event.target.closest('[data-delete-user]');
    if (delBtn) {
      if (!confirm('Xóa người dùng này khỏi danh sách?')) return;
      const rows = loadUserStore().filter((r) => r.id !== delBtn.dataset.deleteUser);
      saveUserStore(rows);
      render();
    }
  });

  render();
}

setActiveNav();
initLogin();
initRegister();
initCourses();
initEnrollmentButtons();
initCourseOwnerActions();
initCourseDetail();
initMyCourses();
initStudentPage();
initCategoryAdmin();
initManagement();
initTeacherPage();
initStatisticsPage();
initAdminPage();
initGradeManagement();
initUserManagement();
