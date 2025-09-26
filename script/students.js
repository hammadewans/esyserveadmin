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
        option.textContent = `Template #${template.templateid}`;
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
  if (!userid) return alert("User ID not found in URL");

  // ------------------ Fetch Students ------------------
  async function fetchStudents(userid) {
    try {
      const response = await fetch(`https://esyserve.top/fetch/student/${userid}`, {
        credentials: 'include',
        method: 'GET'
      });
      const students = await response.json();
      if (!response.ok || !Array.isArray(students)) throw new Error('Failed to fetch students.');

      const container = document.getElementById('studentResultContainer');
      container.innerHTML = students.map(student => `
        <div style="display:flex; align-items:center; margin:5px 0;">
          <input type="checkbox" class="student-checkbox" value="${student.studentid}">
          <img src="assets/images/${student.imgstudent || ''}" alt="Student" style="height:50px;width:50px;border-radius:6px;margin:0 10px;">
          <span>${student.student || ''} (${student.class || ''} - ${student.sectionclass || ''})</span>
        </div>
      `).join('');
      container.style.display = 'block';

    } catch (error) {
      console.error('Fetch error:', error);
      alert('Unable to fetch student data.');
    }
  }
  fetchStudents(userid);

  // ------------------ Select All Checkboxes ------------------
  document.getElementById('selectAll').addEventListener('change', function () {
    document.querySelectorAll('.student-checkbox').forEach(cb => cb.checked = this.checked);
  });

  // ------------------ Show Cards ------------------
  document.getElementById('sendSelected').addEventListener('click', async () => {
    const selectedIds = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(cb => cb.value);
    const templateId = document.getElementById('dynamicSelect').value;

    if (!templateId) return alert('Please select a template.');
    if (!selectedIds.length) return alert('Please select at least one student.');

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cards Preview</title>
        <style>
          body { font-family:sans-serif; padding:10px; display:flex; flex-wrap:wrap; gap:10px; }
          .card-wrapper { border:1px solid #ccc; border-radius:6px; padding:10px; width:180px; text-align:center; }
          .card-wrapper img { width:100%; height:auto; border-radius:6px; }
        </style>
      </head>
      <body>
        <div id="cardsContainer">Loading cards...</div>
      </body>
      </html>
    `);
    win.document.close();

    const container = win.document.getElementById('cardsContainer');

    try {
      const formData = new FormData();
      formData.append('templateid', templateId);
      selectedIds.forEach(id => formData.append('studentids[]', id));

      const response = await fetch('https://esyserve.top/school/pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const cards = await response.json();
      if (!Array.isArray(cards)) throw new Error('Invalid response');

      container.innerHTML = cards.map(card => `<div class="card-wrapper">${card}</div>`).join('');

    } catch (error) {
      console.error(error);
      container.innerText = 'Error loading cards ❌';
    }
  });
});
