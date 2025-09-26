// ------------------ Fetch Templates ------------------
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

// ------------------ On DOM Ready ------------------
document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const userid = params.get('userid');

  if (!userid) {
    alert("User ID not found in URL");
    return;
  }

  // ------------------ Fetch Students ------------------
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
          <td><img src="assets/images/${student.imgstudent || ''}" 
              alt="Student" 
              style="height: 60px; width: 60px; object-fit: cover; border-radius: 6px;"></td>
        `;
        tableBody.appendChild(row);
      });

      container.style.display = 'block';

      if ($.fn.DataTable.isDataTable('#studentTable')) {
        $('#studentTable').DataTable().clear().destroy();
      }

      // ✅ DataTable with "Show All" option
      $('#studentTable').DataTable({
        pageLength: 90,
        lengthMenu: [[45, 90, 180, -1], ["45", "90", "180", "All"]]
      });

    } catch (error) {
      console.error('Fetch error:', error);
      alert('Unable to fetch student data.');
    }
  }

  fetchStudents(userid);

  // ------------------ Select All Checkboxes ------------------
  document.getElementById('selectAll').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  // ------------------ Send Selected Students ------------------
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

    // ✅ Open blank new tab for output
    const win = window.open('about:blank', '_blank');
    win.document.open();
    win.document.write(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Cards Preview</title>
         <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
            #cardsContainer { margin: 0; padding: 0; }
            .page {
                width: 210mm;
                height: 297mm;
                display: grid;
                grid-template-columns: repeat(2, 105mm);
                grid-template-rows: repeat(5, 59.4mm);
                gap: 0; /* ✅ No gaps between rows or columns */
                box-sizing: border-box;
                page-break-after: always;
              }
              
              .card {
                width: 105mm;
                height: 59.4mm;
                margin: 0;   /* ✅ Remove any spacing */
                padding: 0;  /* ✅ No padding between cards */
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              }
            .page:last-child { page-break-after: auto; }
            #loading { text-align: center; padding: 10px; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div id="cardsContainer"></div>
          <div id="loading">Loading all cards...</div>
        </body>
      </html>
    `);
    win.document.close();

    // ------------------ Fetch All Cards in One Request ------------------
    try {
      const formData = new FormData();
      formData.append('templateid', templateId);
      selectedStudentIds.forEach(id => formData.append('studentids[]', id));

      const response = await fetch('https://esyserve.top/school/pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();
      if (!response.ok || !Array.isArray(result)) {
        throw new Error('Invalid response from server');
      }

      // ✅ Split into A4 pages (10 cards per page → 2×5 layout)
      let html = '';
      for (let i = 0; i < result.length; i += 10) {
        html += '<div class="page">';
        result.slice(i, i + 10).forEach(card => {
          html += `<div class="card">${card}</div>`;
        });
        html += '</div>';
      }

      win.document.getElementById('cardsContainer').innerHTML = html;
      win.document.getElementById('loading').innerText = "All Cards Loaded ✅";

    } catch (error) {
      console.error(error);
      win.document.getElementById('loading').innerText = 'Error loading cards ❌';
    }
  });

});


