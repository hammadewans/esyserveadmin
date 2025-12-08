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
          <td>${student.father || ''}</td>
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

  document.getElementById('selectAll').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  document.getElementById('sendSelected').addEventListener('click', () => {
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

    const win = window.open('about:blank', '_blank');
    win.document.open();
    win.document.write(`
     <html>
  <head>
    <meta charset="UTF-8">
    <title>Cards Preview</title>
    <style>
     
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html, body {
        width: 100%;
        height: 100%;
      }

      @page {
        size: A4 landscape;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
      }

      /* A4 page grid (5x2) with horizontal gap only */
      .page {
        width: 297mm;
        height: 210mm; 
        padding: 0.25mm;
        display: grid;
        grid-template-columns: repeat(5, 53.98mm);
        grid-template-rows: repeat(2, 85.6mm);
        justify-content: center;
        align-content: center;
        column-gap: 1.5mm; /* ✅ spacing only between columns */
        row-gap: 12mm;    /* no space between rows */
        page-break-after: always;
      }

      .card {
        width: 53.98mm;
        height: 85.6mm;
        overflow: hidden;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page {
          page-break-after: always;
        }
      }
    </style>
  </head>
  <body>
    <div id="pagesContainer"></div>

    <script>
      const selectedStudentIds = ${JSON.stringify(selectedStudentIds)};
      const templateId = "${templateId}";
      const pagesContainer = document.getElementById('pagesContainer');
      let index = 0;
      const batchSize = 50;
      let isFetching = false;

      async function fetchNextBatch() {
        if (index >= selectedStudentIds.length || isFetching) return;
        isFetching = true;

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

          let currentPage = null;
          let cardCount = 0;

          result.forEach((cardHTML, i) => {
            if (cardCount % 10 === 0) {
              currentPage = document.createElement('div');
              currentPage.className = 'page';
              pagesContainer.appendChild(currentPage);
            }

            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            cardDiv.innerHTML = cardHTML;
            currentPage.appendChild(cardDiv);

            cardCount++;
          });

          index += batchIds.length;
        } catch (err) {
          console.error(err);
        } finally {
          isFetching = false;
        }
      }

      fetchNextBatch();

      window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
          fetchNextBatch();
        }
      });
    </script>
  </body>
</html>


    `);
    win.document.close();
  });
});










