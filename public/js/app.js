// Common app JS: Mobile menu toggle and student login
document.addEventListener('DOMContentLoaded', ()=>{
  // Mobile menu toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (navToggle && navMenu){
    navToggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      navMenu.classList.toggle('active');
    });
    
    // Close menu when a link is clicked
    document.querySelectorAll('.nav-menu a').forEach(link=>{
      link.addEventListener('click', ()=>{
        navMenu.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e)=>{
      if (!e.target.closest('.nav')){
        navMenu.classList.remove('active');
      }
    });
  }

  // Student login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const id = document.getElementById('id').value;
      const password = document.getElementById('password').value;
      const res = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, password }) });
      const j = await res.json();
      if (res.ok){
        // store user id and go to student page
        localStorage.setItem('studentId', j.user._id);
        window.location = '/student.html';
      } else alert(j.error || 'Login failed');
    });
  }
});
