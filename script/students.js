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

    // ✅ Open blank new tab
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
              padding: 20px;
              box-sizing: border-box;
              font-family: sans-serif;
            }
            .newpage {
              margin-bottom: 40px; /* space between each 10-card block */
            }
            .row {
              display: flex;
              margin-bottom: 10px; /* space between rows */
            }
            .card {
              flex: 1; /* 2 cards per row → each takes 50% */
              margin-right: 10px;
              display: flex;
              justify-content: center;
              align-items: center;
              border: 1px solid #ccc;
              height: 150px; /* adjust height */
              box-sizing: border-box;
              overflow: hidden;
            }
            .row .card:last-child {
              margin-right: 0;
            }
            #loading {
              text-align: center;
              padding: 10px;
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
    const batchSize = 30; // load 30 students per request

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

        // Render batch: every 10 cards → newpage, every 2 cards → row
        for (let i = 0; i < result.length; i += 10) {
          const newPage = win.document.createElement('div');
          newPage.className = 'newpage';
          const pageCards = result.slice(i, i + 10);

          for (let j = 0; j < pageCards.length; j += 2) {
            const row = win.document.createElement('div');
            row.className = 'row';
            const rowCards = pageCards.slice(j, j + 2);

            rowCards.forEach(card => {
              const cardDiv = win.document.createElement('div');
              cardDiv.className = 'card';
              cardDiv.innerHTML = card;
              row.appendChild(cardDiv);
            });

            newPage.appendChild(row);
          }

          container.appendChild(newPage);
        }

        index += batchSize;
        loadingDiv.innerText = `Loaded ${Math.min(index, selectedStudentIds.length)} of ${selectedStudentIds.length} cards...`;

      } catch (error) {
        console.error(error);
        loadingDiv.innerText = 'Error loading cards ❌';
      }
    }

    // Initial load
    fetchNextBatch();

    // Lazy load on scroll
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
