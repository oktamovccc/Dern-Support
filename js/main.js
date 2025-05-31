// main.js - Asosiy JavaScript fayl

// Ma'lumotlarni saqlash uchun localStorage yordamchilari
const storage = {
  // Ma'lumotlarni localStorage'ga saqlash
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  // Ma'lumotlarni localStorage'dan olish
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      return null;
    }
  },
  // Ma'lumotlarni localStorage'dan o'chirish
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

// Sahifa navigatsiyasi
document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  setTimeout(() => {
    document.getElementById('preloader').style.display = 'none';
  }, 1000);
  
  // Sahifalarni boshqarish
  const pages = document.querySelectorAll('.page');
  const pageLinks = document.querySelectorAll('[data-page]');
  
  // Boshlang'ich sahifani ko'rsatish
  const initialPage = localStorage.getItem('currentPage') || 'home';
  showPage(initialPage);
  
  // Sahifa havolalarini ishga tushirish
  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = link.getAttribute('data-page');
      showPage(pageName);
      
      // Mobil menuni yopish
      if (document.getElementById('mainMenu').classList.contains('active')) {
        document.getElementById('mainMenu').classList.remove('active');
      }
      
      // Sahifani localStorage'ga saqlash
      localStorage.setItem('currentPage', pageName);
    });
  });
  
  // Sahifani ko'rsatish funksiyasi
  function showPage(pageName) {
    // Barcha sahifalarni yashirish
    pages.forEach(page => {
      page.classList.remove('active');
    });
    
    // Kerakli sahifani ko'rsatish
    const pageToShow = document.getElementById(pageName);
    if (pageToShow) {
      pageToShow.classList.add('active');
      
      // Faqat dashboard sahifasi uchun maxsus logika
      if (pageName === 'dashboard') {
        loadDashboard();
      }
    }
    
    // Aktiv menyuni yangilash
    pageLinks.forEach(link => {
      if (link.getAttribute('data-page') === pageName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
  // Mobil menyu uchun toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const mainMenu = document.getElementById('mainMenu');
  
  menuToggle.addEventListener('click', () => {
    mainMenu.classList.toggle('active');
  });
  
  // Guvohlar karuselini boshqarish
  const testimonials = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  let currentTestimonial = 0;
  
  // Keyingi guvohlikni ko'rsatish
  function showTestimonial(index) {
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
  }
  
  // Keyingi guvohlikga o'tish
  function nextTestimonial() {
    currentTestimonial++;
    if (currentTestimonial >= testimonials.length) {
      currentTestimonial = 0;
    }
    showTestimonial(currentTestimonial);
  }
  
  // Oldingi guvohlikga qaytish
  function prevTestimonial() {
    currentTestimonial--;
    if (currentTestimonial < 0) {
      currentTestimonial = testimonials.length - 1;
    }
    showTestimonial(currentTestimonial);
  }
  
  // Tugmalar uchun event listener
  if (prevBtn) prevBtn.addEventListener('click', prevTestimonial);
  if (nextBtn) nextBtn.addEventListener('click', nextTestimonial);
  
  // Dots uchun event listener
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentTestimonial = index;
      showTestimonial(currentTestimonial);
    });
  });
  
  // Auto slide every 5 seconds
  setInterval(() => {
    nextTestimonial();
  }, 5000);
  
  // Modal dialog
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.querySelector('.close-modal');
  
  // Modalni ochish
  window.openModal = function(content) {
    modalBody.innerHTML = content;
    modal.classList.add('active');
  };
  
  // Modalni yopish
  window.closeModal = function() {
    modal.classList.remove('active');
  };
  
  // X tugmasi orqali yopish
  if (closeModal) {
    closeModal.addEventListener('click', window.closeModal);
  }
  
  // Modal tashqarisini bosib yopish
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      window.closeModal();
    }
  });
  
  // Aloqa formasi uchun event listener
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Form ma'lumotlari
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const message = document.getElementById('message').value;
      
      // Ma'lumotlarni saqlash (aslida bu serverga yuboriladi)
      const messages = storage.get('contactMessages') || [];
      messages.push({
        id: Date.now(),
        name,
        email,
        phone,
        message,
        date: new Date().toLocaleString()
      });
      storage.set('contactMessages', messages);
      
      // Modal oynada xabar
      openModal(`
        <h3>Xabaringiz yuborildi!</h3>
        <p>Hurmatli ${name}, sizning xabaringiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.</p>
        <button class="btn btn-primary" onclick="closeModal()">Yopish</button>
      `);
      
      // Formani tozalash
      contactForm.reset();
    });
  }
});