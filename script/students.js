// ------------------ Fetch Templates ------------------
(async function fetchTemplates() {
  try {
    const response = await fetch('https://esyserve.top/fetch/template', {
      credentials: 'include',
      method: 'GET'
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const templates = await response.json();

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
    console.error('Fetch templates error:', error);
    alert('Unable to fetch templates: ' + error.message);
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

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const students = await response.json();
      if (!Array.isArray(students)) throw new Error('Invalid data format from server');

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
      console.error('Fetch students error:', error);
      alert('Unable to fetch student data: ' + error.message);
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

    // ✅ Open new window for cards preview
    const win = window.open('about:blank', '_blank');
    win.document.open();
    win.document.write(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Cards Preview</title>
          <style>
            body { margin:0; padding:10px; font-family: sans-serif; }
            #cardsContainer {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 10px;
            }
            .card-wrapper {
              border: 1px solid #ccc;
              border-radius: 6px;
              padding: 10px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .card-wrapper img {
              width: 100%;
              height: auto;
              object-fit: cover;
              border-radius: 6px;
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
          <script>
            const selectedStudentIds = ${JSON.stringify(selectedStudentIds)};
            const templateId = "${templateId}";
            const container = document.getElementById('cardsContainer');
            const loadingDiv = document.getElementById('loading');

            async function loadAllCards() {
              try {
                const formData = new FormData();
                formData.append('templateid', templateId);
                selectedStudentIds.forEach(id => formData.append('studentids[]', id));

                const response = await fetch('https://esyserve.top/school/pdf', {
                  method: 'POST',
                  body: formData,
                  credentials: 'include'
                });

                if (!response.ok) throw new Error('HTTP error! Status: ' + response.status);
                const cards = await response.json();
                if (!Array.isArray(cards)) throw new Error('Invalid data from server');

                cards.forEach(cardHTML => {
                  const wrapper = document.createElement('div');
                  wrapper.className = 'card-wrapper';
                  wrapper.innerHTML = cardHTML;
                  container.appendChild(wrapper);
                });

                loadingDiv.innerText = \`All ${selectedStudentIds.length} cards loaded ✅\`;
              } catch (e) {
                console.error('Cards fetch error:', e);
                loadingDiv.innerText = 'Error loading cards ❌';
                alert('Unable to load cards: ' + e.message);
              }
            }

            loadAllCards();
          </script>
        </body>
      </html>
    `);
    win.document.close();
  });
});
