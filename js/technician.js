// technician.js - Texnik paneli uchun funktsiyalar

// Texnik panelini yuklash
function loadTechnicianDashboard(container) {
  loadDashboardStructure(container, 'Texnik paneli');
  
  // Menyu punktlarini yuklash
  const dashboardNav = document.getElementById('dashboardNav');
  dashboardNav.innerHTML = `
    <li><a href="#" class="active" data-section="new-requests">Yangi so'rovlar</a></li>
    <li><a href="#" data-section="my-requests">Mening so'rovlarim</a></li>
    <li><a href="#" data-section="completed">Yakunlangan</a></li>
    <li><a href="#" data-section="profile">Profil</a></li>
  `;
  
  // Menyu punktlariga event listener qo'shish
  const navLinks = dashboardNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const section = link.getAttribute('data-section');
      loadTechnicianSection(section);
    });
  });
  
  // Standart bo'limni yuklash
  loadTechnicianSection('new-requests');
}

// Texnik bo'limini yuklash
function loadTechnicianSection(section) {
  const dashboardMain = document.getElementById('dashboardMain');
  const currentUser = storage.get('currentUser');
  const requests = storage.get('requests') || [];
  
  switch(section) {
    case 'new-requests':
      // Yangi so'rovlarni yuklash (status=waiting)
      const newRequests = requests.filter(request => request.status === 'waiting');
      
      let requestsHTML = '';
      if (newRequests.length > 0) {
        requestsHTML = `<div class="requests-list">`;
        newRequests.forEach(request => {
          const user = getUserById(request.userId);
          requestsHTML += `
            <div class="request-item ${request.status}">
              <div class="request-header">
                <h3 class="request-title">${request.title}</h3>
                <span class="request-status ${getStatusClass(request.status)}">${getStatusName(request.status)}</span>
              </div>
              <div class="request-meta">
                <p>Foydalanuvchi: ${user ? user.fullName : 'Noma\'lum'}</p>
                <p>Yuborilgan sana: ${request.dateCreated}</p>
              </div>
              <div class="request-description">
                <p>${request.description.substring(0, 150)}${request.description.length > 150 ? '...' : ''}</p>
              </div>
              <button class="btn btn-primary" onclick="viewTechRequest(${request.id})">Batafsil</button>
            </div>
          `;
        });
        requestsHTML += `</div>`;
      } else {
        requestsHTML = `
          <div class="empty-state">
            <h3>Yangi so'rovlar mavjud emas</h3>
            <p>Hozirda ko'rib chiqish kutilayotgan so'rovlar yo'q.</p>
          </div>
        `;
      }
      
      dashboardMain.innerHTML = `
        <h2>Yangi so'rovlar</h2>
        <p>Bu yerda ko'rib chiqish kutilayotgan so'rovlar ro'yxati keltirilgan.</p>
        ${requestsHTML}
      `;
      break;
    
    case 'my-requests':
      // Texnikning so'rovlarini yuklash (status=in-progress)
      const myRequests = requests.filter(request => 
        request.status === 'in-progress' && 
        request.technicianId === currentUser.id
      );
      
      let myRequestsHTML = '';
      if (myRequests.length > 0) {
        myRequestsHTML = `<div class="requests-list">`;
        myRequests.forEach(request => {
          const user = getUserById(request.userId);
          myRequestsHTML += `
            <div class="request-item ${request.status}">
              <div class="request-header">
                <h3 class="request-title">${request.title}</h3>
                <span class="request-status ${getStatusClass(request.status)}">${getStatusName(request.status)}</span>
              </div>
              <div class="request-meta">
                <p>Foydalanuvchi: ${user ? user.fullName : 'Noma\'lum'}</p>
                <p>Yuborilgan sana: ${request.dateCreated}</p>
              </div>
              <div class="request-description">
                <p>${request.description.substring(0, 150)}${request.description.length > 150 ? '...' : ''}</p>
              </div>
              <button class="btn btn-primary" onclick="viewTechRequest(${request.id})">Batafsil</button>
            </div>
          `;
        });
        myRequestsHTML += `</div>`;
      } else {
        myRequestsHTML = `
          <div class="empty-state">
            <h3>Joriy so'rovlar mavjud emas</h3>
            <p>Hozirda siz qabul qilgan so'rovlar yo'q.</p>
            <a href="#" class="btn btn-primary" onclick="document.querySelector('[data-section=\'new-requests\']').click()">Yangi so'rovlarni ko'rish</a>
          </div>
        `;
      }
      
      dashboardMain.innerHTML = `
        <h2>Mening so'rovlarim</h2>
        <p>Bu yerda siz qabul qilgan va hozirda ishlayotgan so'rovlar ro'yxati keltirilgan.</p>
        ${myRequestsHTML}
      `;
      break;
    
    case 'completed':
      // Yakunlangan so'rovlar (status=completed)
      const completedRequests = requests.filter(request => 
        request.status === 'completed' && 
        request.technicianId === currentUser.id
      );
      
      let completedHTML = '';
      if (completedRequests.length > 0) {
        completedHTML = `<div class="requests-list">`;
        completedRequests.forEach(request => {
          const user = getUserById(request.userId);
          completedHTML += `
            <div class="request-item ${request.status}">
              <div class="request-header">
                <h3 class="request-title">${request.title}</h3>
                <span class="request-status ${getStatusClass(request.status)}">${getStatusName(request.status)}</span>
              </div>
              <div class="request-meta">
                <p>Foydalanuvchi: ${user ? user.fullName : 'Noma\'lum'}</p>
                <p>Yuborilgan sana: ${request.dateCreated}</p>
                <p>Yakunlangan sana: ${request.dateUpdated}</p>
              </div>
              <button class="btn btn-primary" onclick="viewTechRequest(${request.id})">Batafsil</button>
            </div>
          `;
        });
        completedHTML += `</div>`;
      } else {
        completedHTML = `
          <div class="empty-state">
            <h3>Yakunlangan so'rovlar mavjud emas</h3>
            <p>Hozirda siz yakunlagan so'rovlar yo'q.</p>
          </div>
        `;
      }
      
      dashboardMain.innerHTML = `
        <h2>Yakunlangan so'rovlar</h2>
        <p>Bu yerda siz tomondan yakunlangan so'rovlar ro'yxati keltirilgan.</p>
        ${completedHTML}
      `;
      break;
    
    case 'profile':
      // Texnik profilini ko'rsatish
      const user = getUserById(currentUser.id);
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
              <span class="user-role">Texnik mutaxassis</span>
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
      
      // Profilni yangilash formasini tinglash
      const updateProfileForm = document.getElementById('updateProfileForm');
      updateProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('profileFullName').value;
        const email = document.getElementById('profileEmail').value;
        const phone = document.getElementById('profilePhone').value;
        const password = document.getElementById('profilePassword').value;
        
        // Foydalanuvchini yangilash
        const users = storage.get('users') || [];
        const updatedUsers = users.map(u => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              fullName,
              email,
              phone,
              ...(password && { password }) // Parol o'zgargan bo'lsa yangilash
            };
          }
          return u;
        });
        
        storage.set('users', updatedUsers);
        
        // Joriy foydalanuvchini yangilash
        storage.set('currentUser', {
          ...currentUser,
          fullName
        });
        
        // Yangilangan foydalanuvchi ma'lumotlarini ko'rsatish
        openModal(`
          <h3>Ma'lumotlar saqlandi!</h3>
          <p>Sizning profil ma'lumotlaringiz muvaffaqiyatli yangilandi.</p>
          <button class="btn btn-primary" onclick="closeModal(); loadTechnicianSection('profile');">OK</button>
        `);
        
        // UI elementlarini yangilash
        document.getElementById('userName').textContent = fullName;
      });
      break;
      
    default:
      dashboardMain.innerHTML = `<p>Bo'lim topilmadi.</p>`;
  }
}

// So'rovni batafsil ko'rish
window.viewTechRequest = function(requestId) {
  const requests = storage.get('requests') || [];
  const request = requests.find(r => r.id === requestId);
  
  if (request) {
    const dashboardMain = document.getElementById('dashboardMain');
    
    // Eski bo'limni saqlab qolish
    const activeSection = document.querySelector('#dashboardNav a.active').getAttribute('data-section');
    
    dashboardMain.innerHTML = `
      <div class="flex justify-between align-center mb-md">
        <h2>So'rov tafsilotlari</h2>
        <button class="btn btn-outline" onclick="loadTechnicianSection('${activeSection}')">Orqaga</button>
      </div>
      ${renderRequestDetails(request)}
    `;
  }
};

// So'rovni qabul qilish
window.acceptRequest = function(requestId) {
  const currentUser = storage.get('currentUser');
  updateRequestStatus(requestId, 'in-progress', currentUser.id);
  
  // Javob yozish (avtomatik)
  addResponseToRequest(
    requestId, 
    'So\'rovingiz qabul qilindi. Yaqin vaqt ichida muammoni hal qilishga harakat qilamiz.', 
    currentUser.id
  );
  
  // So'rovni qaytadan yuklash
  viewTechRequest(requestId);
};

// So'rovni yakunlash
window.completeRequest = function(requestId) {
  updateRequestStatus(requestId, 'completed');
  
  // So'rovni qaytadan yuklash
  viewTechRequest(requestId);
};