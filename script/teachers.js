(async function fetchTemplates() {
  try {
    const response = await fetch('https://esyserve.top/fetch/template', {
      credentials: 'include',
      method: 'GET'
    });

    const templates = await response.json();

    if (!response.ok) throw new Error(templates || 'Failed to fetch templates.');

    const select = document.getElementById('dynamicSelect');
    templates.forEach(template => {
      if (template.type === 'teachers') {
        const option = document.createElement('option');
        option.value = template.templateid;
        option.textContent = `Template #${template.templateid} - ${template.type}`;
        select.appendChild(option);
      }
    });

  } catch (error) {
    console.error('Fetch error:', error);
  }
})();


document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const userid = params.get('userid');

  if (!userid) {
    alert("User ID not found in URL");
    return;
  }

  async function fetchTeachers(userid) {
    try {
      const response = await fetch(`https://esyserve.top/fetch/teacher/${userid}`, {
        credentials: 'include',
        method: 'GET'
      });

      const teachers = await response.json();
      if (!response.ok || !Array.isArray(teachers)) throw new Error('Failed to fetch teachers.');

      const tableBody = document.querySelector('#teacherTable tbody');
      const container = document.getElementById('teacherResultContainer');
      tableBody.innerHTML = '';

      teachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="checkbox" class="teacher-checkbox" value="${teacher.teacherid}"></td>
          <td>${teacher.teacherid || ''}</td>
          <td>${teacher.teacher || ''}</td>
          <td>${teacher.role || ''}</td>
          <td><img src="assets/images/${teacher.imgteacher || ''}" alt="Teacher" style="height: 60px; width: 60px; object-fit: cover; border-radius: 6px;"></td>
        `;
        tableBody.appendChild(row);
      });

      container.style.display = 'block';

      if ($.fn.DataTable.isDataTable('#teacherTable')) {
        $('#teacherTable').DataTable().clear().destroy();
      }
      $('#teacherTable').DataTable();

    } catch (error) {
      console.error('Fetch error:', error);
      alert('Unable to fetch teacher data.');
    }
  }

  fetchTeachers(userid);

  document.getElementById('selectAllTeachers').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('.teacher-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  document.getElementById('sendSelectedTeachers').addEventListener('click', async () => {
    const selectedCheckboxes = Array.from(document.querySelectorAll('.teacher-checkbox:checked'));
    const selectedTeacherIds = selectedCheckboxes.map(cb => cb.value);
    const templateId = document.getElementById('dynamicSelect').value;

    if (!templateId) {
      alert('Please select a template.');
      return;
    }

    if (selectedTeacherIds.length === 0) {
      alert('Please select at least one teacher.');
      return;
    }

    const formData = new FormData();
    formData.append('templateid', templateId);
    selectedTeacherIds.forEach(id => formData.append('teacherids[]', id));

    try {
      const response = await fetch('https://esyserve.top/teacher/pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json(); // array of HTML card strings
      console.log(result);
      if (!response.ok || !Array.isArray(result)) {
        throw new Error('Invalid response from server');
      }

      let html = `
        <html>
          <head>
            <style>
              .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10mm;
              }
              .card {
                width: 85.60mm;
                height: 53.98mm;
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
      `;

      for (let i = 0; i < result.length; i += 3) {
        html += '<div class="row">';
        for (let j = i; j < i + 3 && j < result.length; j++) {
          html += `<div class="card">${result[j]}</div>`;
        }
        html += '</div>';
      }

      html += `</body></html>`;
      document.write(html);

    } catch (error) {
      console.error(error);
      alert('Failed to generate teacher cards.');
    }
  });
});

