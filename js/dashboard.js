function loadDashboard() {
  const currentUser = storage.get('currentUser');
  
  if (!currentUser) {
    document.querySelector('[data-page="login"]').click();
    return;
  }
  
  const dashboardContainer = document.getElementById('dashboard');
  
  switch(currentUser.role) {
    case 'admin':
      loadAdminDashboard(dashboardContainer);
      break;
    case 'technician':
      loadTechnicianDashboard(dashboardContainer);
      break;
    case 'user':
      loadUserDashboard(dashboardContainer);
      break;
    default:
      console.error('Noma\'lum foydalanuvchi roli');
      break;
  }
}

function loadDashboardStructure(container, title) {
  container.innerHTML = `
    <div class="container dashboard-container">
      <div class="dashboard-header">
        <h1>${title}</h1>
        <p>Xush kelibsiz, <strong>${storage.get('currentUser').fullName}</strong>!</p>
      </div>
      <div class="dashboard-content">
        <div class="dashboard-sidebar">
          <ul id="dashboardNav">
            <!-- Bu yer navlar uchun -->
          </ul>
        </div>
        <div class="dashboard-main" id="dashboardMain">
          <!-- Bu yer asosiy ma'lumotlar uchun -->
        </div>
      </div>
    </div>
  `;
}
function getUserById(userId) {
  const users = storage.get('users') || [];
  return users.find(user => user.id === userId);
}

// So'rovlar statusini o'zgartirish
function updateRequestStatus(requestId, newStatus, technicianId = null) {
  const requests = storage.get('requests') || [];
  const updatedRequests = requests.map(request => {
    if (request.id === requestId) {
      return {
        ...request,
        status: newStatus,
        dateUpdated: new Date().toLocaleString(),
        ...(technicianId && { technicianId })
      };
    }
    return request;
  });
  
  storage.set('requests', updatedRequests);
  return true;
}

// So'rovga javob qo'shish
function addResponseToRequest(requestId, responseText, userId) {
  const requests = storage.get('requests') || [];
  const updatedRequests = requests.map(request => {
    if (request.id === requestId) {
      const responses = request.responses || [];
      return {
        ...request,
        dateUpdated: new Date().toLocaleString(),
        responses: [
          ...responses,
          {
            id: Date.now(),
            text: responseText,
            userId,
            date: new Date().toLocaleString()
          }
        ]
      };
    }
    return request;
  });
  
  storage.set('requests', updatedRequests);
  return true;
}

// Status nomi
function getStatusName(status) {
  switch(status) {
    case 'waiting':
      return 'Kutilmoqda';
    case 'in-progress':
      return 'Jarayonda';
    case 'completed':
      return 'Yakunlangan';
    default:
      return status;
  }
}

// Status CSS klassi
function getStatusClass(status) {
  switch(status) {
    case 'waiting':
      return 'waiting';
    case 'in-progress':
      return 'in-progress';
    case 'completed':
      return 'completed';
    default:
      return '';
  }
}

// So'rovni to'liq ko'rsatish
function renderRequestDetails(request) {
  const user = getUserById(request.userId);
  const technician = request.technicianId ? getUserById(request.technicianId) : null;
  
  let responsesHTML = '';
  if (request.responses && request.responses.length > 0) {
    responsesHTML = '<h3>Javoblar</h3><div class="responses">';
    request.responses.forEach(response => {
      const responder = getUserById(response.userId);
      responsesHTML += `
        <div class="response-item">
          <div class="response-header">
            <strong>${responder ? responder.fullName : 'Noma\'lum'}</strong> 
            <span>(${responder && responder.role === 'technician' ? 'Texnik' : 'Foydalanuvchi'})</span>
            <span class="response-date">${response.date}</span>
          </div>
          <div class="response-text">${response.text}</div>
        </div>
      `;
    });
    responsesHTML += '</div>';
  }
  
  let actionsHTML = '';
  const currentUser = storage.get('currentUser');
  
  // Texniklar uchun harakatlar
  if (currentUser.role === 'technician') {
    if (request.status === 'waiting') {
      actionsHTML = `
        <div class="request-actions">
          <button class="btn btn-primary" onclick="acceptRequest(${request.id})">Qabul qilish</button>
        </div>
      `;
    } else if (request.status === 'in-progress' && request.technicianId === currentUser.id) {
      actionsHTML = `
        <div class="request-actions">
          <button class="btn btn-success" onclick="completeRequest(${request.id})">Yakunlash</button>
        </div>
      `;
    }
    
    if ((request.status === 'in-progress' && request.technicianId === currentUser.id) || 
        (request.status === 'completed' && request.technicianId === currentUser.id)) {
      actionsHTML += `
        <div class="response-form">
          <h3>Javob yozish</h3>
          <textarea id="responseText" rows="4" placeholder="Javobingizni kiriting"></textarea>
          <button class="btn btn-primary" onclick="sendResponse(${request.id})">Yuborish</button>
        </div>
      `;
    }
  }
  
  // Foydalanuvchilar uchun harakatlar
  if (currentUser.role === 'user' && request.userId === currentUser.id) {
    actionsHTML += `
      <div class="response-form">
        <h3>Qo'shimcha ma'lumot yuborish</h3>
        <textarea id="responseText" rows="4" placeholder="Qo'shimcha ma'lumotingizni kiriting"></textarea>
        <button class="btn btn-primary" onclick="sendResponse(${request.id})">Yuborish</button>
      </div>
    `;
  }
  
  return `
    <div class="request-details">
      <div class="request-header">
        <h2>${request.title}</h2>
        <span class="request-status ${getStatusClass(request.status)}">${getStatusName(request.status)}</span>
      </div>
      
      <div class="request-meta">
        <p><strong>Yuborilgan sana:</strong> ${request.dateCreated}</p>
        ${request.dateUpdated ? `<p><strong>Yangilangan sana:</strong> ${request.dateUpdated}</p>` : ''}
        <p><strong>Foydalanuvchi:</strong> ${user ? user.fullName : 'Noma\'lum'}</p>
        ${technician ? `<p><strong>Texnik:</strong> ${technician.fullName}</p>` : ''}
      </div>
      
      <div class="request-description">
        <h3>Muammo tavsifi</h3>
        <p>${request.description}</p>
      </div>
      
      ${responsesHTML}
      ${actionsHTML}
    </div>
  `;
}