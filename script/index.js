// 🏫 Fetch total school count
(async function fetchSchoolCount() {
  try {
    const response = await fetch('http://esyserve.top/count/school', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) return window.location.href = 'login.html';
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    document.getElementById('totalSchools').textContent = data || 0;
    console.log('Total School:', data);
  } catch (error) {
    console.error('Error fetching school count:', error);
  }
})();




// 🏫 Fetch total school count
(async function fetchSchoolCount() {
  try {
    const response = await fetch('http://esyserve.top/count/student', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) return window.location.href = 'login.html';
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    document.getElementById('totalStudents').textContent = data || 0;
    console.log('Total Student:', data);
  } catch (error) {
    console.error('Error fetching school count:', error);
  }
})();


// 🏫 Fetch total school count
(async function fetchSchoolCount() {
  try {
    const response = await fetch('http://esyserve.top/count/teacher', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) return window.location.href = 'login.html';
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    document.getElementById('totalTeachers').textContent = data || 0;
    console.log('Total Teachers:', data);
  } catch (error) {
    console.error('Error fetching school count:', error);
  }
})();


// 🔒 Fetch blocked users and populate table
(async function fetchBlockedUsers() {
  try {
    const response = await fetch('http://esyserve.top/user/blocked', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) return window.location.href = 'login.html';
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log('Blocked Users:', data);

    const tableBody = document.getElementById('blockedUsersTable');
    tableBody.innerHTML = '';

    if ($.fn.DataTable.isDataTable('#schoolsTable')) {
      $('#schoolsTable').DataTable().clear().destroy();
    }

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.userid || '-'}</td>
          <td>${user.email || '-'}</td>
          <td>
            <button class="btn btn-sm btn-success reactivate-btn" data-userid="${user.userid}">
              Reactivate
            </button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }

    $('#schoolsTable').DataTable({
      language: { emptyTable: "No blocked users found." }
    });

  } catch (error) {
    console.error('Error fetching blocked users:', error);
  }
})();

// ✅ Reactivate user handler
document.addEventListener('click', async function (event) {
  if (!event.target.classList.contains('reactivate-btn')) return;

  const userId = event.target.getAttribute('data-userid');
  if (!userId) return console.error('User ID not found.');

  if (!confirm(`Are you sure you want to reactivate user ${userId}?`)) return;

  try {
    const response = await fetch(`http://esyserve.top/user/reactivate/${userId}`, {
      method: 'POST',
      credentials: 'include'
    });
    if (response.status === 401) return window.location.href = 'login.html';
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    await response.json();
    location.reload();
  } catch (err) {
    console.error('Reactivation failed:', err);
  }
});


