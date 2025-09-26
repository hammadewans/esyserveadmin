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

    // ✅ Open new window
    const win = window.open('about:blank', '_blank');
    win.document.open();
    win.document.write(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Cards Preview</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: sans-serif;
            }
            #cardsContainer {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: repeat(5, auto);
              gap: 0;
              width: 100vw;
              height: 100vh;
            }
            .card-wrapper {
              width: 100%;
              height: 20vh;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            #loading {
              position: fixed;
              bottom: 0;
              width: 100%;
              background: #fff;
              text-align: center;
              padding: 5px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div id="cardsContainer"></div>
          <div id="loading">Loading cards...</div>
        </body>
      </html>
    `);
    win.document.close();

    const container = win.document.getElementById('cardsContainer');
    const loadingDiv = win.document.getElementById('loading');
    let index = 0;
    const batchSize = 10; // 10 cards per page (2x5)

    async function fetchNextBatch() {
      if (index >= selectedStudentIds.length) {
        loadingDiv.innerText = "All Cards Loaded ✅";
        return;
      }

      const batchIds = selectedStudentIds.slice(index, index + batchSize);

      const formData = new FormData();
      formData.append('templateid', templateId);
      batchIds.forEach(id => formData.append('studentids[]', id));

      try {
        const response = await fetch('https://esyserve.top/school/pdf', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const result = await response.json();
        if (!response.ok || !Array.isArray(result)) throw new Error('Invalid response');

        result.forEach(card => {
          const wrapper = win.document.createElement('div');
          wrapper.className = 'card-wrapper';
          wrapper.innerHTML = card;
          container.appendChild(wrapper);
        });

        index += batchSize;
        loadingDiv.innerText = `Loaded ${Math.min(index, selectedStudentIds.length)} of ${selectedStudentIds.length} cards...`;

      } catch (error) {
        console.error(error);
        loadingDiv.innerText = 'Error loading cards ❌';
      }
    }

    fetchNextBatch();

    // Lazy load next batch on scroll
    win.addEventListener('scroll', () => {
      const scrollTop = win.scrollY || win.document.documentElement.scrollTop;
      const windowHeight = win.innerHeight;
      const scrollHeight = win.document.body.scrollHeight;

      if (scrollTop + windowHeight >= scrollHeight - 50) {
        fetchNextBatch();
      }
    });
  });
});
