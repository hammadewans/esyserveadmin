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


// ------------------ On DOM Ready ------------------
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
          <td>
            <img src="assets/images/${teacher.imgteacher || ''}" 
            alt="Teacher" 
            style="height: 60px; width: 60px; object-fit: cover; border-radius: 6px;">
          </td>
        `;
        tableBody.appendChild(row);
      });

      container.style.display = 'block';

      if ($.fn.DataTable.isDataTable('#teacherTable')) {
        $('#teacherTable').DataTable().clear().destroy();
      }

      $('#teacherTable').DataTable({
        pageLength: 90,
        lengthMenu: [[45, 90, 180, -1], ["45", "90", "180", "All"]]
      });

    } catch (error) {
      console.error('Fetch error:', error);
      alert('Unable to fetch teacher data.');
    }
  }

  fetchTeachers(userid);

  // Select All
  document.getElementById('selectAllTeachers').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('.teacher-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  // Send Selected
  document.getElementById('sendSelectedTeachers').addEventListener('click', () => {
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

    const win = window.open('about:blank', '_blank');
    win.document.open();

    win.document.write(`
<html>
<head>
<meta charset="UTF-8">
<title>Teacher Cards Preview</title>

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
  size: A4;
  margin: 0;
}

body {
  margin: 0;
  padding: 0;
}

.page {
  width: 210mm;
  height: 297mm;
  padding: 0.25mm;
  display: grid;
  grid-template-columns: repeat(2, 86mm);
  grid-template-rows: repeat(5, 54.4mm);
  justify-content: center;
  align-content: center;
  column-gap: 12mm;
  row-gap: 1.5mm;
  page-break-after: always;
}

.card {
  width: 86mm;
  height: 54.4mm;
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
const selectedTeacherIds = ${JSON.stringify(selectedTeacherIds)};
const templateId = "${templateId}";
const pagesContainer = document.getElementById('pagesContainer');

let index = 0;
const batchSize = 50;
let isFetching = false;
let cardCount = 0; // ✅ IMPORTANT FIX

async function fetchNextBatch() {
  if (index >= selectedTeacherIds.length || isFetching) return;
  isFetching = true;

  const batchIds = selectedTeacherIds.slice(index, index + batchSize);

  const formData = new FormData();
  formData.append('templateid', templateId);
  batchIds.forEach(id => formData.append('teacherids[]', id));

  try {
    const response = await fetch('https://esyserve.top/teacher/pdf', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const result = await response.json();

    let currentPage = null;

    result.forEach((cardHTML) => {
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
