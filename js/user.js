function loadUserDashboard(container) {
  loadDashboardStructure(container, 'Foydalanuvchi paneli');
  
  const dashboardNav = document.getElementById('dashboardNav');
  dashboardNav.innerHTML = `
    <li><a href="#" class="active" data-section="requests">Mening so'rovlarim</a></li>
    <li><a href="#" data-section="new-request">Yangi so'rov</a></li>
    <li><a href="#" data-section="profile">Profil</a></li>
  `;
  
  const navLinks = dashboardNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const section = link.getAttribute('data-section');
      loadUserSection(section);
    });
  });
  loadUserSection('requests');
}
function loadUserSection(section) {
  const dashboardMain = document.getElementById('dashboardMain');
  const currentUser = storage.get('currentUser');
  
  switch(section) {
    case 'requests':
      const requests = storage.get('requests') || [];
      const userRequests = requests.filter(request => request.userId === currentUser.id);
      
      let requestsHTML = '';
      if (userRequests.length > 0) {
        requestsHTML = `<div class="requests-list">`;
        userRequests.forEach(request => {
          requestsHTML += `
            <div class="request-item ${request.status}">
              <div class="request-header">
                <h3 class="request-title">${request.title}</h3>
                <span class="request-status ${getStatusClass(request.status)}">${getStatusName(request.status)}</span>
              </div>
              <div class="request-meta">
                <p>Yuborilgan sana: ${request.dateCreated}</p>
              </div>
              <div class="request-description">
                <p>${request.description}</p>
              </div>
              <button class="btn btn-primary" onclick="viewRequest(${request.id})">Batafsil</button>
            </div>
          `;
        });
        requestsHTML += `</div>`;
      } else {
        requestsHTML = `
          <div class="empty-state">
            <h3>So'rovlar mavjud emas</h3>
            <p>Siz hali hech qanday so'rov yubormagansiz.</p>
            <a href="#" class="btn btn-primary" onclick="document.querySelector('[data-section=\'new-request\']').click()">Yangi so'rov yuborish</a>
          </div>
        `;
      }
      
      dashboardMain.innerHTML = `
        <h2>Mening so'rovlarim</h2>
        <p>Bu yerda siz yuborgan barcha so'rovlar va ularning holati ko'rsatilgan.</p>
        ${requestsHTML}
      `;
      break;
    
    case 'new-request':
      dashboardMain.innerHTML = `
        <h2>Yangi so'rov</h2>
        <p>Kompyuter ta'mirlash bo'yicha yangi so'rov yuborish uchun quyidagi formani to'ldiring.</p>
        
        <div class="new-request-form">
          <form id="newRequestForm">
            <div class="form-group">
              <label for="requestTitle">So'rov sarlavhasi</label>
              <input type="text" id="requestTitle" required placeholder="Muammo haqida qisqacha yozing">
            </div>
            <div class="form-group">
              <label for="requestDescription">Muammo tavsifi</label>
              <textarea id="requestDescription" rows="6" required placeholder="Muammoni batafsil tavsiflang..."></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary">So'rov yuborish</button>
          </form>
        </div>
      `;
      
      // Forma submit hodisasini tinglash
      const newRequestForm = document.getElementById('newRequestForm');
      newRequestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('requestTitle').value;
        const description = document.getElementById('requestDescription').value;
        
        // So'rovni saqlash
        const requests = storage.get('requests') || [];
        const newRequest = {
          id: Date.now(),
          userId: currentUser.id,
          title,
          description,
          status: 'waiting',
          dateCreated: new Date().toLocaleString(),
          responses: []
        };
        
        requests.push(newRequest);
        storage.set('requests', requests);
        
        // Xabar ko'rsatish
        openModal(`
          <h3>So'rov yuborildi!</h3>
          <p>Sizning so'rovingiz muvaffaqiyatli qabul qilindi. Tez orada texnik mutaxassislarimiz sizning muammoingizni ko'rib chiqadi.</p>
        `);
        
        // Formani tozalash
        newRequestForm.reset();
      });
      break;
    
    case 'profile':
      // Foydalanuvchi profilini ko'rsatish
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
              <span class="user-role">Foydalanuvchi</span>
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
          <button class="btn btn-primary" onclick="closeModal(); loadUserSection('profile');">OK</button>
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
window.viewRequest = function(requestId) {
  const requests = storage.get('requests') || [];
  const request = requests.find(r => r.id === requestId);
  
  if (request) {
    const dashboardMain = document.getElementById('dashboardMain');
    dashboardMain.innerHTML = `
      <div class="flex justify-between align-center mb-md">
        <h2>So'rov tafsilotlari</h2>
        <button class="btn btn-outline" onclick="loadUserSection('requests')">Orqaga</button>
      </div>
      ${renderRequestDetails(request)}
    `;
  }
};

// Javob yuborish
window.sendResponse = function(requestId) {
  const responseText = document.getElementById('responseText').value;
  if (!responseText.trim()) {
    alert('Iltimos, xabarni kiriting');
    return;
  }
  
  const currentUser = storage.get('currentUser');
  addResponseToRequest(requestId, responseText, currentUser.id);
  
  // So'rovni qaytadan yuklash
  viewRequest(requestId);
};