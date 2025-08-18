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
      if (template.type === 'students') {
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

  async function fetchStudents(userid) {
    try {
      const response = await fetch(`https://esyserve.top/fetch/student/${userid}`, {
        credentials: 'include',
        method: 'GET'
      });

      const students = await response.json();
      if (!response.ok || !Array.isArray(students)) throw new Error('Failed to fetch students.');

      const tableBody = document.querySelector('#studentTable tbody');
      const container = document.getElementById('studentResultContainer');
      tableBody.innerHTML = '';

      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="checkbox" class="student-checkbox" value="${student.studentid}"></td>
          <td>${student.studentid || ''}</td>
          <td>${student.student || ''}</td>
          <td>${student.class || ''}</td>
          <td>${student.sectionclass || ''}</td>
          <td><img src="${student.imgstudent || ''}" alt="Student" style="height: 60px; width: 60px; object-fit: cover; border-radius: 6px;"></td>
        `;
        tableBody.appendChild(row);
      });

      container.style.display = 'block';

      if ($.fn.DataTable.isDataTable('#studentTable')) {
        $('#studentTable').DataTable().clear().destroy();
      }

      // ✅ DataTable with "Show All" option
      $('#studentTable').DataTable({
        pageLength: 10, // change to -1 if you want "All" by default
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]]
      });

    } catch (error) {
      console.error('Fetch error:', error);
      alert('Unable to fetch student data.');
    }
  }

  fetchStudents(userid);

  // Select all checkbox logic
  document.getElementById('selectAll').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  // Send selected students for PDF generation
  document.getElementById('sendSelected').addEventListener('click', async () => {
    const selectedCheckboxes = Array.from(document.querySelectorAll('.student-checkbox:checked'));
    const selectedStudentIds = selectedCheckboxes.map(cb => cb.value);
    const templateId = document.getElementById('dynamicSelect').value;

    if (!templateId) {
      alert('Please select a template.');
      return;
    }

    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student.');
      return;
    }

    const formData = new FormData();
    formData.append('templateid', templateId);
    selectedStudentIds.forEach(id => formData.append('studentids[]', id));

    try {
      const response = await fetch('https://esyserve.top/school/pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json(); // array of HTML card strings
      if (!response.ok || !Array.isArray(result)) {
        throw new Error('Invalid response from server');
      }

      // Build printable HTML
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

      // ✅ Open in new tab instead of replacing the current page
      const win = window.open('', '_blank');
      win.document.open();
      win.document.write(html);
      win.document.close();

    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF.');
    }
  });

});
