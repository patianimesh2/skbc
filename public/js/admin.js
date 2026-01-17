document.addEventListener('DOMContentLoaded', ()=>{
  const roomsEl = document.getElementById('rooms');
  const roomDetailsEl = document.getElementById('roomDetails');
  const todayStatsEl = document.getElementById('todayStats');
  const adminLoginForm = document.getElementById('adminLogin');

  if (adminLoginForm){
    // Admin login page
    adminLoginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('apassword').value;
      const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) });
      if (res.ok){
        localStorage.setItem('isAdmin','1');
        window.location = '/admin.html';
      } else { const j = await res.json(); alert(j.error || 'Admin login failed'); }
    });
    return;
  }

  // Admin dashboard page
  if (!localStorage.getItem('isAdmin')) { alert('Not authorized'); window.location='/admin_login.html'; return; }

  async function loadTodayStats(){
    const res = await fetch('/api/admin/today/stats');
    const stats = await res.json();
    todayStatsEl.innerHTML = `
      <div class="stat-box" style="background:rgba(16,185,129,0.2);border-color:#10b981">
        <div class="stat-label">✅ Meals ON</div>
        <div class="stat-value">${stats.mealOn}</div>
      </div>
      <div class="stat-box" style="background:rgba(236,72,153,0.2);border-color:#ec4899">
        <div class="stat-label">❌ Meals OFF</div>
        <div class="stat-value">${stats.mealOff}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">👥 Total Students</div>
        <div class="stat-value">${stats.totalStudents}</div>
      </div>
    `;
  }

  async function loadRooms(){
    const res = await fetch('/api/admin/rooms');
    const rooms = await res.json();
    roomsEl.innerHTML = rooms.map(r=>`<button class="roomBtn" data-room="${r.roomNo}">${r.roomNo}${r.count > 0 ? ' (' + r.count + ')' : ''}</button>`).join('');
    document.querySelectorAll('.roomBtn').forEach(b=>b.addEventListener('click', async ()=>{
      document.querySelectorAll('.roomBtn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const roomNo = b.dataset.room;
      const rr = await (await fetch('/api/admin/room/'+roomNo)).json();
      if (rr.length === 0){
        roomDetailsEl.innerHTML = '<p style="color:#e9d5ff">No students in this room</p>';
        return;
      }
      roomDetailsEl.innerHTML = rr.map(s=>`
        <div class="card" onclick="viewStudentMeals('${s._id}', '${s.fullName}')">
          <h4>👤 ${s.fullName}</h4>
          <p><strong>📚 Dept:</strong> ${s.dept}</p>
          <p><strong>📱 Mobile:</strong> ${s.mobile}</p>
          <p><strong>📍 Address:</strong> ${s.address}</p>
          <p><strong>Today Status:</strong> 🌅 ${s.todayMorning ? '✓ ON' : '✗ OFF'} | 🌙 ${s.todayNight ? '✓ ON' : '✗ OFF'}</p>
          <p style="color:#a78bfa"><em>Click to view meal details...</em></p>
        </div>
      `).join('');
    }));
  }

  loadTodayStats();
  loadRooms();

  window.logoutAdmin = () => {
    localStorage.removeItem('isAdmin');
    window.location = '/admin_login.html';
  };

  window.viewStudentMeals = async (studentId, studentName) => {
    const details = await (await fetch(`/api/admin/student/${studentId}/details`)).json();
    alert(`${studentName}\n\nDept: ${details.dept}\nRoom: ${details.roomNo}\nMobile: ${details.mobile}\n\nToday:\n🌅 Morning: ${details.todayMorning ? 'ON ✓' : 'OFF ✗'}\n🌙 Night: ${details.todayNight ? 'ON ✓' : 'OFF ✗'}`);
  };
});
