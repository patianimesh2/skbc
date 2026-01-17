document.addEventListener('DOMContentLoaded', ()=>{
  const id = localStorage.getItem('studentId');
  if (!id) { alert('Not logged in'); window.location='/login.html'; return; }
  const nameEl = document.getElementById('name');
  const detailsEl = document.getElementById('details');
  const summaryEl = document.getElementById('summary');
  const mealControlsEl = document.getElementById('mealControls');
  const mealStatsEl = document.getElementById('mealStats');
  const dateInfoEl = document.getElementById('dateInfo');

  async function load(){
    const res = await fetch('/api/student/'+id);
    const user = await res.json();
    nameEl.textContent = '👤 ' + user.fullName;
    
    detailsEl.innerHTML = `
      <div class="card">
        <p><strong>📚 Department:</strong> ${user.dept}</p>
        <p><strong>🏠 Room No:</strong> ${user.roomNo}</p>
        <p><strong>👥 Roommate:</strong> ${user.roommate || 'Not assigned'}</p>
        <p><strong>📍 Address:</strong> ${user.address}</p>
        <p><strong>📅 Moved In:</strong> ${new Date(user.movedIn).toLocaleDateString()}</p>
        <p><strong>⏰ Expiry:</strong> ${new Date(user.expiry).toLocaleDateString()}</p>
      </div>
    `;

    // Meal controls for today - unified toggle
    const today = new Date();
    const todayRecords = user.mealRecords.filter(r => {
      const d = new Date(r.date);
      d.setHours(0,0,0,0);
      const t = new Date(today);
      t.setHours(0,0,0,0);
      return d.getTime() === t.getTime();
    });
    // Check any meal status (they're unified, so both have same status)
    const mealStatus = todayRecords.length > 0 ? todayRecords[0].on : false;
    
    mealStatsEl.innerHTML = `
      <div class="stat-box" style="background:${mealStatus ? 'rgba(16,185,129,0.2);border-color:#10b981' : 'rgba(236,72,153,0.2);border-color:#ec4899'}">
        <div class="stat-label">${mealStatus ? '✅' : '❌'} Today's Meal Status</div>
        <div class="stat-value">${mealStatus ? 'ON' : 'OFF'}</div>
      </div>
    `;

    mealControlsEl.innerHTML = `
      <button class="toggle-btn ${mealStatus ? 'on' : 'off'}" onclick="toggleMeal('meal', ${!mealStatus})">
        ${mealStatus ? '✓ MEAL ON ✓' : '✗ MEAL OFF ✗'} - Click to Toggle All Day
      </button>
    `;

    // Monthly summary
    const now = new Date();
    const ms = await (await fetch(`/api/student/${id}/month/${now.getFullYear()}/${now.getMonth()+1}`)).json();
    summaryEl.innerHTML = `
      <div class="stat-box">
        <div class="stat-label">🌅 Morning ON</div>
        <div class="stat-value">${ms.morningOn}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">🌅 Morning OFF</div>
        <div class="stat-value">${ms.morningOff}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">🌙 Night ON</div>
        <div class="stat-value">${ms.nightOn}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">🌙 Night OFF</div>
        <div class="stat-value">${ms.nightOff}</div>
      </div>
    `;

    dateInfoEl.innerHTML = `Today is <strong>${today.toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</strong>`;
  }
  load();

  window.toggleMeal = async (type, on) => {
    const today = new Date();
    const payload = { mealType: 'morning', date: today.toISOString(), on }; // Always send morning, backend will update both
    const res = await fetch('/api/student/'+id+'/toggleMeal',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if (res.ok) { load(); alert(`All day meals ${on ? 'turned ON ✓' : 'turned OFF ✗'}`); } 
    else alert('Failed to update meal');
  };

  window.logout = () => {
    localStorage.removeItem('studentId');
    window.location = '/login.html';
  };
});
