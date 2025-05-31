// auth.js - Autentifikatsiya bilan bog'liq funktsiyalar

document.addEventListener('DOMContentLoaded', () => {

  checkAuthStatus();
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
    
      const fullName = document.getElementById('registerFullName').value;
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const phone = document.getElementById('registerPhone').value;
      const password = document.getElementById('registerPassword').value;
      const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
      
      if (password !== passwordConfirm) {
        openModal(`
          <h3>Xato!</h3>
          <p>Parollar bir-biriga mos kelmadi. Iltimos, qaytadan urinib ko'ring.</p>
          <button class="btn btn-primary" onclick="closeModal()">Yopish</button>
        `);
        return;
      }
      
      const users = storage.get('users') || [];
      const existingUser = users.find(u => u.username === username || u.email === email);
      
      if (existingUser) {
        openModal(`
          <h3>Xato!</h3>
          <p>Bu foydalanuvchi nomi yoki elektron pochta allaqachon ro'yxatdan o'tgan.</p>
          <button class="btn btn-primary" onclick="closeModal()">Yopish</button>
        `);
        return;
      }
      
      const newUser = {
        id: Date.now(),
        fullName,
        username,
        email,
        phone,
        password,
        role: 'user',
        dateRegistered: new Date().toLocaleString()
      };
      
      users.push(newUser);
      storage.set('users', users);
      storage.set('currentUser', {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role
      });
      
      openModal(`
        <h3>Tabriklaymiz!</h3>
        <p>Siz muvaffaqiyatli ro'yxatdan o'tdingiz va tizimga kirdingiz.</p>
      `);
      registerForm.reset();
  
      checkAuthStatus();
    });
  }
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      const users = storage.get('users') || [];
      const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
      
      if (!user) {
        openModal(`
          <h3>Xato!</h3>
          <p>Noto'g'ri foydalanuvchi nomi yoki parol. Iltimos, qaytadan urinib ko'ring.</p>
          <button class="btn btn-primary" onclick="closeModal()">Yopish</button>
        `);
        return;
      }
      
      storage.set('currentUser', {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      });
      
      openModal(`
        <h3>Xush kelibsiz!</h3>
        <p>Siz muvaffaqiyatli tizimga kirdingiz.</p>
      `);
      
      loginForm.reset();
      
      checkAuthStatus();
    });
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      storage.remove('currentUser');
      
      window.location.href = '#';
      document.querySelector('[data-page="home"]').click();
      
      checkAuthStatus();
    });
  }
});

function checkAuthStatus() {
  const currentUser = storage.get('currentUser');
  const authLinks = document.getElementById('authLinks');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  
  if (currentUser) {
    // Foydalanuvchi tizimga kirgan
    authLinks.classList.add('hidden');
    userInfo.classList.remove('hidden');
    userName.textContent = currentUser.fullName || currentUser.username;

    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
      dashboardLink.setAttribute('data-page', 'dashboard');
    }
  } else {
    // Foydalanuvchi tizimga kirmagan
    authLinks.classList.remove('hidden');
    userInfo.classList.add('hidden');
  }
}
function initializeDemoData() {
  // Foydalanuvchilar
  const users = storage.get('users');
  if (!users || users.length === 0) {
    const demoUsers = [
      {
        id: 1,
        fullName: 'Admin Adminov',
        username: 'admin',
        email: 'admin@dernsupport.uz',
        phone: '+998901234567',
        password: 'admin123',
        role: 'admin',
        dateRegistered: new Date().toLocaleString()
      },
      {
        id: 2,
        fullName: 'Texnik Ustanov',
        username: 'texnik',
        email: 'texnik@dernsupport.uz',
        phone: '+998901234568',
        password: 'texnik123',
        role: 'technician',
        dateRegistered: new Date().toLocaleString()
      },
      {
        id: 3,
        fullName: 'Foydalanuvchi Testov',
        username: 'user',
        email: 'user@example.com',
        phone: '+998901234569',
        password: 'user123',
        role: 'user',
        dateRegistered: new Date().toLocaleString()
      }
    ];
    storage.set('users', demoUsers);
  }
  const requests = storage.get('requests');
  if (!requests || requests.length === 0) {
    const demoRequests = [
      {
        id: 1,
        userId: 3,
        title: 'Kompyuter ishga tushmayapti',
        description: 'Kompyuterim yoqilganda qora ekran ko\'rsatyapti va ishga tushmayapti.',
        status: 'waiting', // waiting, in-progress, completed
        dateCreated: new Date(Date.now() - 86400000).toLocaleString(),
        responses: []
      },
      {
        id: 2,
        userId: 3,
        title: 'Windows yangilanmayapti',
        description: 'Windows yangilashni boshlasa ham, 50% da to\'xtab qoladi.',
        status: 'in-progress',
        dateCreated: new Date(Date.now() - 172800000).toLocaleString(),
        dateUpdated: new Date(Date.now() - 86400000).toLocaleString(),
        technicianId: 2,
        responses: [
          {
            id: 1,
            text: 'Muammoni ko\'rib chiqdim. Iltimos, Windows sozlamalaridan yangilashlarni tekshirib ko\'ring.',
            userId: 2,
            date: new Date(Date.now() - 86400000).toLocaleString()
          }
        ]
      }
    ];
    storage.set('requests', demoRequests);
  }
}

initializeDemoData();