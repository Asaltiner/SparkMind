const API_BASE = 'http://localhost:3000/api/v1';
const CATEGORIES = ['tech', 'life', 'work', 'other'];

// --- API Functions ---
async function registerUser(email, password, categories) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, categories })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Kayıt başarısız');
  return res.json();
}

async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Giriş başarısız');
  return res.json();
}

async function getFeedbacks(token) {
  const res = await fetch(`${API_BASE}/feedback`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Feedbackler alınamadı');
  return res.json();
}

async function postFeedback(token, category, message) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ category, message })
  });
  if (!res.ok) throw new Error('Feedback gönderilemedi');
  return res.json();
}

// --- UI Rendering ---
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="container">
      <h2>Giriş Yap</h2>
      <form id="login-form">
        <input type="email" id="login-email" placeholder="E-posta" required />
        <input type="password" id="login-password" placeholder="Şifre" required />
        <button type="submit">Giriş</button>
      </form>
      <hr />
      <h2>Kayıt Ol</h2>
      <form id="register-form">
        <input type="email" id="register-email" placeholder="E-posta" required />
        <input type="password" id="register-password" placeholder="Şifre" required />
        <div class="checkbox-group">
          ${CATEGORIES.map(cat => `
            <label><input type="checkbox" name="categories" value="${cat}"> ${cat}</label>
          `).join('')}
        </div>
        <button type="submit">Kayıt Ol</button>
      </form>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      const { token } = await loginUser(email, password);
      localStorage.setItem('jwtToken', token);
      renderDashboard();
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const categories = Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(cb => cb.value);
    try {
      const { token } = await registerUser(email, password, categories);
      localStorage.setItem('jwtToken', token);
      renderDashboard();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function renderDashboard() {
  const token = localStorage.getItem('jwtToken');
  if (!token) return renderLogin();
  let feedbacks = [];
  try {
    feedbacks = await getFeedbacks(token);
  } catch (err) {
    alert('Feedbackler alınamadı, tekrar giriş yapın.');
    localStorage.removeItem('jwtToken');
    return renderLogin();
  }

  document.getElementById('app').innerHTML = `
    <div class="container">
      <h2>Dashboard</h2>
      <form id="feedback-form">
        <select id="feedback-category" required>
          <option value="">Kategori Seçin</option>
          ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
        <textarea id="feedback-message" placeholder="Mesajınız" required rows="3"></textarea>
        <button type="submit">Gönder</button>
      </form>
      <ul class="feedback-list">
        ${feedbacks.map(fb => `
          <li>
            <b>${fb.category}</b>
            <span>${fb.message}</span>
            <small>${new Date(fb.createdAt).toLocaleString('tr-TR')}</small>
          </li>
        `).join('')}
      </ul>
      <button class="logout-btn" id="logout-btn">Çıkış</button>
    </div>
  `;

  document.getElementById('feedback-form').addEventListener('submit', async e => {
    e.preventDefault();
    const category = document.getElementById('feedback-category').value;
    const message = document.getElementById('feedback-message').value;
    try {
      await postFeedback(token, category, message);
      renderDashboard();
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('jwtToken');
    renderLogin();
  });
}

// --- App Init ---
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    renderDashboard();
  } else {
    renderLogin();
  }
}); 