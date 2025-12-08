// ❌ Deactivate user handler
document.addEventListener('click', async function (event) {
  if (!event.target.classList.contains('deactivate-btn')) return;

  const userId = event.target.getAttribute('data-userid');
  if (!userId) return console.error('User ID not found.');

  if (!confirm(`Are you sure you want to deactivate user ${userId}?`)) return;

  try {
    const response = await fetch(`https://esyserve.top/user/deactivate/${userId}`, {
      method: 'POST',
      credentials: 'include'
    });
    if (response.status === 401) return window.location.href = 'login.html';
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    await response.json();
    location.reload();
  } catch (err) {
    console.error('Deactivation failed:', err);
  }
});



(async function fetchAllUsers() {
  try {
    const response = await fetch('https://esyserve.top/user/all', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) return window.location.href = 'login.html';
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const users = await response.json();
    console.log('All Users:', users);

    const tableBody = document.getElementById('allUsersTableBody');
    tableBody.innerHTML = ''; // Clear existing rows if any

    // Destroy previous DataTable instance if exists
    if ($.fn.DataTable.isDataTable('#allUsersTable')) {
      $('#allUsersTable').DataTable().clear().destroy();
    }

    users.forEach(user => {
      const address = [
        user.location,
        user.area,
        user.city,
        user.district,
        user.state,
        user.pincode
      ].filter(Boolean).join(', ');

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.userid || '-'}</td>
        <td>${user.school || '-'}</td>
        <td>${user.udise || '-'}</td>
        <td>${address || '-'}</td>
        <td>${user.principal || '-'}</td>
        <td>${user.contact || '-'}</td>
        <td>${user.board || '-'}</td>
        <td>
          <button class="btn btn-sm btn-danger deactivate-btn" data-userid="${user.userid}">
            Deactivate
          </button>
        </td>
        <td>
          <a href="students.html?userid=${user.userid}" class="btn btn-sm btn-primary" target="_blank">
            PDF Students
          </a>
        </td>
        <td>
          <a href="student.html?userid=${user.userid}" class="btn btn-sm btn-primary" target="_blank">
            PDF Portrait Students
          </a>
        </td>
        <td>
          <a href="teachers.html?userid=${user.userid}" class="btn btn-sm btn-secondary" target="_blank">
            PDF Teachers
          </a>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // ✅ Initialize DataTable after rows are added
    $('#allUsersTable').DataTable({
      language: {
        emptyTable: "No users found."
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
  }
})();


