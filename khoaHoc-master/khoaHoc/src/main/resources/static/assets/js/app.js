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
      <button class="btn primary" data-enroll="${course.id}">Đăng ký khóa học</button>
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
      </div>`;
  } catch (error) {
    root.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
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
}

async function loadManagementLookups() {
  const categories = await loadCategories().catch(() => []);
  fillOptions(document.getElementById('courseCategoryId'), categories, 'Chọn danh mục');
  const courses = API.token()
    ? API.pageItems(await API.request('/api/instructor/courses?page=0&size=50').catch(() => ({ content: [] })))
    : [];
  fillOptions(document.getElementById('chapterCourseId'), courses, 'Chọn khóa học');
  fillOptions(document.getElementById('lessonCourseId'), courses, 'Chọn khóa học');
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
            <td><button class="btn" data-delete-category="${item.id}">Xóa</button></td>
          </tr>`).join('') : '<tr><td colspan="4">Chưa có danh mục.</td></tr>';
      }
    } catch (error) {
      if (table) table.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
    }
  }
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      await API.request('/api/admin/categories', { method: 'POST', body: JSON.stringify(body) });
      showMessage('categoryMessage', 'Đã tạo danh mục.', true);
      form.reset();
      await render();
    } catch (error) {
      showMessage('categoryMessage', error.message);
    }
  });
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-category]');
    if (!button) return;
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
  const courses = await loadManagementLookups();
  renderTeacherCourses(courses);
  await renderStatistics();

  document.getElementById('courseForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    body.price = Number(body.price || 0);
    body.categoryId = Number(body.categoryId);
    try {
      await API.request('/api/courses', { method: 'POST', body: JSON.stringify(body) });
      showMessage('managementMessage', 'Đã tạo khóa học bản nháp.', true);
      event.currentTarget.reset();
      renderTeacherCourses(await loadManagementLookups());
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
    } catch (error) {
      showMessage('managementMessage', error.message);
    }
  });

  document.getElementById('lessonCourseId')?.addEventListener('change', loadChapterOptions);
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
    } catch (error) {
      showMessage('managementMessage', error.message);
    }
  });
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
  body.innerHTML = courses.length ? courses.map((course) => `
    <tr>
      <td>${course.id}</td>
      <td>${text(course.title)}</td>
      <td>${statusVi(course.status)}</td>
      <td>${text(course.categoryName)}</td>
      <td><a class="btn" href="course-detail.html?id=${course.id}">Nội dung</a></td>
    </tr>`).join('') : '<tr><td colspan="5">Chưa có khóa học do tài khoản này tạo hoặc chưa đăng nhập.</td></tr>';
}

async function initTeacherPage() {
  if (!document.getElementById('teacherCourseRows')) return;
  const courses = API.token()
    ? API.pageItems(await API.request('/api/instructor/courses?page=0&size=50').catch(() => ({ content: [] })))
    : [];
  renderTeacherCourses(courses);
  await renderStatistics();
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
}

setActiveNav();
initLogin();
initRegister();
initCourses();
initEnrollmentButtons();
initCourseDetail();
initMyCourses();
initStudentPage();
initCategoryAdmin();
initManagement();
initTeacherPage();
initStatisticsPage();
