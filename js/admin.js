function loadAdminDashboard(container) {
  loadDashboardStructure(container, 'Admin paneli');
  const dashboardNav = document.getElementById('dashboardNav');
  dashboardNav.innerHTML = `
    <li><a href="#" class="active" data-section="overview">Umumiy ma'lumot</a></li>
    <li><a href="#" data-section="users">Foydalanuvchilar</a></li>
    <li><a href="#" data-section="requests">Barcha so'rovlar</a></li>
    <li><a href="#" data-section="profile">Profil</a></li>
  `;
  
  const navLinks = dashboardNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const section = link.getAttribute('data-section');
      loadAdminSection(section);
    });
  });
  
  loadAdminSection('overview');
}

function loadAdminSection(section) {
  const dashboardMain = document.getElementById('dashboardMain');
  const users = storage.get('users') || [];
  const requests = storage.get('requests') || [];
  
  switch(section) {
    case 'overview':
      const userCount = users.length;
      const technicianCount = users.filter(user => user.role === 'technician').length;
      const requestCount = requests.length;
      const waitingCount = requests.filter(request => request.status === 'waiting').length;
      const inProgressCount = requests.filter(request => request.status === 'in-progress').length;
      const completedCount = requests.filter(request => request.status === 'completed').length;
      
      dashboardMain.innerHTML = `
        <h2>Umumiy ma'lumot</h2>
        <p>Tizim bo'yicha umumiy statistika.</p>
        
        <div class="dashboard-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <h3>${userCount}</h3>
              <p>Foydalanuvchilar</p>
            </div>
            <div class="stat-card">
              <h3>${technicianCount}</h3>
              <p>Texnik xodimlar</p>
            </div>
            <div class="stat-card">
              <h3>${requestCount}</h3>
              <p>Jami so'rovlar</p>
            </div>
          </div>
          
          <h3 class="mt-20">So'rovlar holati</h3>
          <div class="stats-grid">
            <div class="stat-card waiting">
              <h3>${waitingCount}</h3>
              <p>Kutilmoqda</p>
            </div>
            <div class="stat-card in-progress">
              <h3>${inProgressCount}</h3>
              <p>Jarayonda</p>
            </div>
            <div class="stat-card completed">
              <h3>${completedCount}</h3>
              <p>Yakunlangan</p>
            </div>
          </div>
        </div>
        
        <h3 class="mt-20">So'nggi so'rovlar</h3>
        <div class="recent-requests">
          ${requests.length > 0 
            ? generateRecentRequestsTable(requests.slice(0, 5)) 
            : '<p>So\'rovlar mavjud emas.</p>'}
        </div>
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        .dashboard-stats {
          margin-top: var(--spacing-xl);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        
        .stat-card {
          background-color: var(--bg-white);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          text-align: center;
        }
        
        .stat-card h3 {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-xs);
        }
        
        .stat-card.waiting {
          border-left: 4px solid var(--warning-color);
        }
        
        .stat-card.in-progress {
          border-left: 4px solid var(--primary-color);
        }
        
        .stat-card.completed {
          border-left: 4px solid var(--success-color);
        }
        
        .recent-requests {
          margin-top: var(--spacing-md);
        }
      `;
      document.head.appendChild(style);
      break;
    
    case 'users':
      dashboardMain.innerHTML = `
        <div class="flex justify-between align-center mb-md">
          <h2>Foydalanuvchilar</h2>
          <button class="btn btn-primary" onclick="openAddUserModal()">+ Yangi foydalanuvchi</button>
        </div>
        <div class="users-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ism-familiya</th>
                <th>Foydalanuvchi nomi</th>
                <th>E-pochta</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Ro'yxat sanasi</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => `
                <tr>
                  <td>${user.id}</td>
                  <td>${user.fullName}</td>
                  <td>${user.username}</td>
                  <td>${user.email}</td>
                  <td>${user.phone}</td>
                  <td>${getUserRoleName(user.role)}</td>
                  <td>${user.dateRegistered}</td>
                  <td class="table-actions">
                    <button class="action-btn edit" onclick="editUser(${user.id})"><i class="fa-solid fa-pencil"></i></button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})">🗑️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      break;
    
    case 'requests':
      dashboardMain.innerHTML = `
        <h2>Barcha so'rovlar</h2>
        <p>Tizimga yuborilgan barcha so'rovlar ro'yxati.</p>
        
        <div class="filter-container mb-md">
          <label for="statusFilter">Status bo'yicha saralash:</label>
          <select id="statusFilter" onchange="filterRequests()">
            <option value="all">Barchasi</option>
            <option value="waiting">Kutilmoqda</option>
            <option value="in-progress">Jarayonda</option>
            <option value="completed">Yakunlangan</option>
          </select>
        </div>
        
        <div id="requestsContainer">
          ${generateRequestsTable(requests)}
        </div>
      `;
      window.filterRequests = function() {
        const status = document.getElementById('statusFilter').value;
        let filteredRequests = requests;
        
        if (status !== 'all') {
          filteredRequests = requests.filter(request => request.status === status);
        }
        
        document.getElementById('requestsContainer').innerHTML = generateRequestsTable(filteredRequests);
      };
      break;
    
    case 'profile':
      const user = getUserById(storage.get('currentUser').id);
      if (!user) {
        dashboardMain.innerHTML = `<p>Foydalanuvchi ma'lumotlari topilmadi.</p>`;
        return;
      }
      
      dashboardMain.innerHTML = `
        <h2>Mening profilim</h2>
        <div class="user-profile">
          <div class="user-profile-sidebar">
            <div class="user-avatar">${user.fullName.charAt(0)}</div>
            <div class="user-info">
              <h3>${user.fullName}</h3>
              <span class="user-role">Administrator</span>
              <p>A'zo bo'lgan sana: ${user.dateRegistered}</p>
            </div>
          </div>
          <div class="user-profile-main">
            <h3>Shaxsiy ma'lumotlar</h3>
            <form id="updateProfileForm">
              <div class="form-group">
                <label for="profileFullName">To'liq ism-familiya</label>
                <input type="text" id="profileFullName" value="${user.fullName}" required>
              </div>
              <div class="form-group">
                <label for="profileUsername">Foydalanuvchi nomi</label>
                <input type="text" id="profileUsername" value="${user.username}" required readonly>
                <small>Foydalanuvchi nomini o'zgartirib bo'lmaydi</small>
              </div>
              <div class="form-group">
                <label for="profileEmail">E-pochta</label>
                <input type="email" id="profileEmail" value="${user.email}" required>
              </div>
              <div class="form-group">
                <label for="profilePhone">Telefon raqam</label>
                <input type="tel" id="profilePhone" value="${user.phone}" required>
              </div>
              <div class="form-group">
                <label for="profilePassword">Yangi parol (o'zgartirish uchun)</label>
                <input type="password" id="profilePassword">
                <small>Parolni o'zgartirish uchun to'ldiring, aks holda bo'sh qoldiring</small>
              </div>
              <button type="submit" class="btn btn-primary">Saqlash</button>
            </form>
          </div>
        </div>
      `;
      const updateProfileForm = document.getElementById('updateProfileForm');
      updateProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('profileFullName').value;
        const email = document.getElementById('profileEmail').value;
        const phone = document.getElementById('profilePhone').value;
        const password = document.getElementById('profilePassword').value;
        const users = storage.get('users') || [];
        const updatedUsers = users.map(u => {
          if (u.id === user.id) {
            return {
              ...u,
              fullName,
              email,
              phone,
              ...(password && { password })
            };
          }
          return u;
        });
        storage.set('users', updatedUsers);
        const currentUser = storage.get('currentUser');
        storage.set('currentUser', {
          ...currentUser,
          fullName
        });
        
        openModal(`
          <h3>Ma'lumotlar saqlandi!</h3>
          <p>Sizning profil ma'lumotlaringiz muvaffaqiyatli yangilandi.</p>
          <button class="btn btn-primary" onclick="closeModal(); loadAdminSection('profile');">OK</button>
        `);
        document.getElementById('userName').textContent = fullName;
      });
      break;
      
    default:
      dashboardMain.innerHTML = `<p>Bo'lim topilmadi.</p>`;
  }
}
function generateRecentRequestsTable(requests) {
  return `
    <table class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Sarlavha</th>
          <th>Foydalanuvchi</th>
          <th>Status</th>
          <th>Sana</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        ${requests.map(request => {
          const user = getUserById(request.userId);
          return `
            <tr>
              <td>${request.id}</td>
              <td>${request.title}</td>
              <td>${user ? user.fullName : 'Noma\'lum'}</td>
              <td><span class="request-status ${getStatusClass(request.status)}">${getStatusName(request.status)}</span></td>
              <td>${request.dateCreated}</td>
              <td>
                <button class="btn btn-outline btn-sm" onclick="viewAdminRequest(${request.id})">Ko'rish</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function generateRequestsTable(requests) {
  if (requests.length === 0) {
    return `<p>So'rovlar topilmadi.</p>`;
  }
  return `
    <table class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Sarlavha</th>
          <th>Foydalanuvchi</th>
          <th>Status</th>
          <th>Texnik</th>
          <th>Yaratilgan sana</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        ${requests.map(request => {
          const user = getUserById(request.userId);
          const technician = request.technicianId ? getUserById(request.technicianId) : null;
          return `
            <tr>
              <td>${request.id}</td>
              <td>${request.title}</td>
              <td>${user ? user.fullName : 'Noma\'lum'}</td>
              <td><span class="request-status ${getStatusClass(request.status)}">${getStatusName(request.status)}</span></td>
              <td>${technician ? technician.fullName : '-'}</td>
              <td>${request.dateCreated}</td>
              <td>
                <button class="btn btn-outline btn-sm" onclick="viewAdminRequest(${request.id})">Ko'rish</button>
                <button class="action-btn delete" onclick="deleteRequest(${request.id})">🗑️</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}
function getUserRoleName(role) {
  switch(role) {
    case 'admin':
      return 'Administrator';
    case 'technician':
      return 'Texnik mutaxassis';
    case 'user':
      return 'Foydalanuvchi';
    default:
      return role;
  }
}
window.editUser = function(userId) {
  const users = storage.get('users') || [];
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return;
  }
  openModal(`
    <h3>Foydalanuvchini tahrirlash</h3>
    <form id="editUserForm">
      <div class="form-group">
        <label for="editFullName">To'liq ism-familiya</label>
        <input type="text" id="editFullName" value="${user.fullName}" required>
      </div>
      <div class="form-group">
        <label for="editEmail">E-pochta</label>
        <input type="email" id="editEmail" value="${user.email}" required>
      </div>
      <div class="form-group">
        <label for="editPhone">Telefon raqam</label>
        <input type="tel" id="editPhone" value="${user.phone}" required>
      </div>
      <div class="form-group">
        <label for="editRole">Rol</label>
        <select id="editRole" required>
          <option value="user" ${user.role === 'user' ? 'selected' : ''}>Foydalanuvchi</option>
          <option value="technician" ${user.role === 'technician' ? 'selected' : ''}>Texnik mutaxassis</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
        </select>
      </div>
      <div class="form-group">
        <label for="editPassword">Yangi parol (ixtiyoriy)</label>
        <input type="password" id="editPassword">
        <small>Parolni o'zgartirish uchun to'ldiring</small>
      </div>
      <button type="submit" class="btn btn-primary">Saqlash</button>
    </form>
  `);
  document.getElementById('editUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('editFullName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const role = document.getElementById('editRole').value;
    const password = document.getElementById('editPassword').value;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          fullName,
          email,
          phone,
          role,
          ...(password && { password })
        };
      }
      return u;
    });
    
    storage.set('users', updatedUsers);
    closeModal();
    openModal(`
      <h3>Foydalanuvchi saqlandi</h3>
      <p>Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi.</p>
      <button class="btn btn-primary" onclick="closeModal(); loadAdminSection('users');">OK</button>
    `);
  });
};
window.deleteUser = function(userId) {
  openModal(`
    <h3>Foydalanuvchini o'chirish</h3>
    <p>Siz rostdan ham bu foydalanuvchini o'chirib tashlamoqchimisiz? Bu amalni qaytarib bo'lmaydi.</p>
    <div class="flex gap-md">
      <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
      <button class="btn btn-primary" onclick="confirmDeleteUser(${userId})">O'chirish</button>
    </div>
  `);
};
window.confirmDeleteUser = function(userId) {
  const users = storage.get('users') || [];
  const updatedUsers = users.filter(u => u.id !== userId);
  
  storage.set('users', updatedUsers);
  
  closeModal();
  loadAdminSection('users');
};
window.deleteRequest = function(requestId) {
  openModal(`
    <h3>So'rovni o'chirish</h3>
    <p>Siz rostdan ham bu so'rovni o'chirib tashlamoqchimisiz? Bu amalni qaytarib bo'lmaydi.</p>
    <div class="flex gap-md">
      <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
      <button class="btn btn-primary" onclick="confirmDeleteRequest(${requestId})">O'chirish</button>
    </div>
  `);
};
window.confirmDeleteRequest = function(requestId) {
  const requests = storage.get('requests') || [];
  const updatedRequests = requests.filter(r => r.id !== requestId);
  
  storage.set('requests', updatedRequests);
  
  closeModal();
  loadAdminSection('requests');
};
window.openAddUserModal = function() {
  openModal(`
    <h3>Yangi foydalanuvchi qo'shish</h3>
    <form id="addUserForm">
      <div class="form-group">
        <label for="addFullName">To'liq ism-familiya</label>
        <input type="text" id="addFullName" required>
      </div>
      <div class="form-group">
        <label for="addUsername">Foydalanuvchi nomi</label>
        <input type="text" id="addUsername" required>
      </div>
      <div class="form-group">
        <label for="addEmail">E-pochta</label>
        <input type="email" id="addEmail" required>
      </div>
      <div class="form-group">
        <label for="addPhone">Telefon raqam</label>
        <input type="tel" id="addPhone" required>
      </div>
      <div class="form-group">
        <label for="addRole">Rol</label>
        <select id="addRole" required>
          <option value="user">Foydalanuvchi</option>
          <option value="technician">Texnik mutaxassis</option>
          <option value="admin">Administrator</option>
        </select>
      </div>
      <div class="form-group">
        <label for="addPassword">Parol</label>
        <input type="password" id="addPassword" required>
      </div>
      <button type="submit" class="btn btn-primary">Qo'shish</button>
    </form>
  `);
  document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('addFullName').value;
    const username = document.getElementById('addUsername').value;
    const email = document.getElementById('addEmail').value;
    const phone = document.getElementById('addPhone').value;
    const role = document.getElementById('addRole').value;
    const password = document.getElementById('addPassword').value;
    const users = storage.get('users') || [];
    const existingUser = users.find(u => u.username === username || u.email === email);
    
    if (existingUser) {
      alert('Bu foydalanuvchi nomi yoki elektron pochta allaqachon ro\'yxatdan o\'tgan.');
      return;
    }
    const newUser = {
      id: Date.now(),
      fullName,
      username,
      email,
      phone,
      password,
      role,
      dateRegistered: new Date().toLocaleString()
    };
    
    users.push(newUser);
    storage.set('users', users);

    closeModal();
    openModal(`
      <h3>Foydalanuvchi qo'shildi</h3>
      <p>Yangi foydalanuvchi muvaffaqiyatli qo'shildi.</p>
      <button class="btn btn-primary" onclick="closeModal(); loadAdminSection('users');">OK</button>
    `);
  });
};
window.viewAdminRequest = function(requestId) {
  const requests = storage.get('requests') || [];
  const request = requests.find(r => r.id === requestId);
  
  if (request) {
    const dashboardMain = document.getElementById('dashboardMain');
    const activeSection = document.querySelector('#dashboardNav a.active').getAttribute('data-section');
    
    dashboardMain.innerHTML = `
      <div class="flex justify-between align-center mb-md">
        <h2>So'rov tafsilotlari</h2>
        <button class="btn btn-outline" onclick="loadAdminSection('${activeSection}')">Orqaga</button>
      </div>
      ${renderRequestDetails(request)}
      
      <div class="admin-actions mt-20">
        <h3>Admin harakatlari</h3>
        <div class="flex gap-md">
          <button class="btn btn-primary" onclick="changeRequestStatus(${request.id}, 'waiting')">Kutish holatiga o'tkazish</button>
          <button class="btn btn-primary" onclick="changeRequestStatus(${request.id}, 'in-progress')">Jarayonga o'tkazish</button>
          <button class="btn btn-primary" onclick="changeRequestStatus(${request.id}, 'completed')">Yakunlangan deb belgilash</button>
        </div>
      </div>
    `;
  }
};
window.changeRequestStatus = function(requestId, newStatus) {
  updateRequestStatus(requestId, newStatus);
  viewAdminRequest(requestId);
};