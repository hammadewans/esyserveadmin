---

### ✅ Corrected Final Snippet
```js
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
   if (!response.ok) throw new Error(students || 'Failed to fetch students.');
   if (!Array.isArray(students)) throw new Error('Invalid student data.');

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
       <td><img src="assets/images/${student.imgstudent || ''}" alt="Student" style="height: 60px; width: 60px; object-fit: cover; border-radius: 6px;"></td>
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

fetchStudents(userid); // ✅ Call function
});        const result = await response.json();
        if (!response.ok || !Array.isArray(result)) {
          throw new Error('Invalid response from server');
        }

        // ✅ Append batch cards into rows of 2
        let html = '';
        for (let i = 0; i < result.length; i += 2) {
          html += '<div class="row">';
          for (let j = i; j < i + 2 && j < result.length; j++) {
            html += `<div class="card">${result[j]}</div>`;
          }
          html += '</div>';
        }

        win.document.getElementById('cardsContainer')
          .insertAdjacentHTML('beforeend', html);

        offset += limit;
        loading = false;

      } catch (error) {
        console.error(error);
        win.document.getElementById('loading').innerText = 'Error loading cards ❌';
      }
    }

    // Lazy load on scroll
    win.addEventListener('scroll', () => {
      const nearBottom =
        win.innerHeight + win.scrollY >= win.document.body.offsetHeight - 200;

      if (nearBottom) {
        loadBatch();
      }
    });

    // First batch load
    loadBatch();
  });

});on  win.addEventListener('scroll', () => {
      const nearBottom =
        win.innerHeight + win.scrollY >= win.document.body.offsetHeight - 200;

      if (nearBottom) {
        loadBatch();
      }
    });

    // First batch load
    loadBatch();
  });

});    try {
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
          <td><img src="assets/images/${student.imgstudent || ''}" alt="Student" style="height: 60px; width: 60px; object-fit: cover; border-radius: 6px;"></td>
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

  // Select all checkbox logic
  document.getElementById('selectAll').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  // Send selected students for template rendering with lazy loading
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

    // ✅ Pagination setup
    const limit = 10;   // 10 cards per A4
    let offset = 0;
    let total = selectedStudentIds.length;
    let loading = false;

    // Open new tab for output
    const win = window.open('', '_blank');
    win.document.open();
    win.document.write(`
      <html>
        <head>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
            .page {
              width: 210mm;
              height: 297mm;
              display: flex;
              flex-wrap: wrap;
              box-sizing: border-box;
              page-break-after: always;
            }
            .card {
              width: 105mm;
              height: 59.4mm;
              box-sizing: border-box;
              border: 1px solid #ddd;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            #loading { text-align:center; padding:10px; font-family:sans-serif; }
          </style>
        </head>
        <body>
          <div id="cardsContainer"></div>
          <div id="loading">Loading...</div>
        </body>
      </html>
    `);
    win.document.close();

    async function loadBatch() {
      if (loading) return;
      if (offset >= total) {
        win.document.getElementById('loading').innerText = "All Cards Loaded";
        return;
      }

      loading = true;
      const batchIds = selectedStudentIds.slice(offset, offset + limit);
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
        if (!response.ok || !Array.isArray(result)) {
          throw new Error('Invalid response from server');
        }

        // ✅ Make one A4 page with 2×5 layout
        let html = '<div class="page">';
        result.forEach(card => {
          html += `<div class="card">${card}</div>`;
        });
        html += '</div>';

        win.document.getElementById('cardsContainer')
          .insertAdjacentHTML('beforeend', html);

        offset += limit;
        loading = false;

      } catch (error) {
        console.error(error);
        win.document.getElementById('loading').innerText = 'Error loading cards ❌';
      }
    }

    // Lazy load on scroll
    win.addEventListener('scroll', () => {
      const nearBottom =
        win.innerHeight + win.scrollY >= win.document.body.offsetHeight - 200;

      if (nearBottom) {
        loadBatch();
      }
    });

    // First batch load
    loadBatch();
  });

});          html += `<div class="card">${result[j]}</div>`;  
          }  
          html += '</div>';  
        }  

        win.document.getElementById('cardsContainer').insertAdjacentHTML('beforeend', html);  
        offset += limit;  
        loading = false;  

      } catch (error) {  
        console.error(error);  
        win.document.getElementById('loading').innerText = 'Error loading cards ❌';  
      }  
    }  

    win.addEventListener('scroll', () => {  
      const nearBottom = win.innerHeight + win.scrollY >= win.document.body.scrollHeight - 200;  
      if (nearBottom) loadBatch();  
    });  

    loadBatch();
  });
});await response.json();
        if (!response.ok || !Array.isArray(result)) {
          throw new Error('Invalid response from server');
        }

        // ✅ Append batch cards into rows of 2, grouped by 5 rows
        let html = '';
        for (let g = 0; g < result.length; g += 10) { // 10 cards = 5 rows of 2
          html += '<div class="row-group">';
          for (let i = g; i < g + 10 && i < result.length; i += 2) {
            html += '<div class="row">';
            for (let j = i; j < i + 2 && j < result.length; j++) {
              html += `<div class="card">${result[j]}</div>`;
            }
            html += '</div>';
          }
          html += '</div>'; // end of row-group
        }

        win.document.getElementById('cardsContainer')
          .insertAdjacentHTML('beforeend', html);

        offset += limit;
        loading = false;

      } catch (error) {
        console.error(error);
        win.document.getElementById('loading').innerText = 'Error loading cards ❌';
      }
    }

    // Lazy load on scroll
    win.addEventListener('scroll', () => {
      const nearBottom =
        win.innerHeight + win.scrollY >= win.document.body.offsetHeight - 200;

      if (nearBottom) {
        loadBatch();
      }
    });

    // First batch load
    loadBatch();
  });

});    try {
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
          <td><img src="assets/images/${student.imgstudent || ''}" alt="Student" style="height: 60px; width: 60px; object-fit: cover; border-radius: 6px;"></td>
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

  // Select all checkbox logic
  document.getElementById('selectAll').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  // Send selected students for template rendering with lazy loading
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

    const limit = 18;   // 18 cards per request
    let offset = 0;
    let total = selectedStudentIds.length;
    let loading = false;

    const win = window.open('', '_blank');
    win.document.open();
    win.document.write(`
      <html>
        <head>
          <style>
            .row { display: flex; justify-content: space-between; }
            #loading { text-align:center; padding:10px; font-family:sans-serif; }
          </style>
        </head>
        <body>
          <div id="cardsContainer"></div>
          <div id="loading">Loading...</div>
        </body>
      </html>
    `);
    win.document.close();

    async function loadBatch() {
      if (loading) return;
      if (offset >= total) {
        win.document.getElementById('loading').innerText = "All Cards Loaded";
        return;
      }

      loading = true;
      const batchIds = selectedStudentIds.slice(offset, offset + limit);
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
        if (!response.ok || !Array.isArray(result)) {
          throw new Error('Invalid response from server');
        }

        // Append batch cards into rows of 2 with margin after every 5 rows
        let html = '';
        let rowCount = 0; // Counter for number of rows added
        for (let i = 0; i < result.length; i += 2) {
          html += '<div class="row">';
          for (let j = i; j < i + 2 && j < result.length; j++) {
            html += `<div class="card">${result[j]}</div>`;
          }
          html += '</div>';

          rowCount++;
          // Add margin after every 5 rows
          if (rowCount % 5 === 0) {
            html += '<div style="margin-bottom: 30px;"></div>';
          }
        }

        win.document.getElementById('cardsContainer')
          .insertAdjacentHTML('beforeend', html);

        offset += limit;
        loading = false;

      } catch (error) {
        console.error(error);
        win.document.getElementById('loading').innerText = 'Error loading cards ❌';
      }
    }

    // Lazy load on scroll
    win.addEventListener('scroll', () => {
      const nearBottom =
        win.innerHeight + win.scrollY >= win.document.body.offsetHeight - 200;

      if (nearBottom) {
        loadBatch();
      }
    });

    // First batch load
    loadBatch();
  });

});    try {
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
          <td><img src="assets/images/${student.imgstudent || ''}" alt="Student" style="height: 60px; width: 60px; object-fit: cover; border-radius: 6px;"></td>
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

  // Select all checkbox logic
  document.getElementById('selectAll').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });

  // Send selected students for template rendering with lazy loading
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

    // ✅ Pagination setup
    const limit = 18;   // 18 cards per request
    let offset = 0;
    let total = selectedStudentIds.length;
    let loading = false;

    // Open new tab for output
    const win = window.open('', '_blank');
    win.document.open();
    win.document.write(`
      <html>
        <head>
          <style>
            .row { display: flex; justify-content: space-between; }
           #loading { text-align:center; padding:10px; font-family:sans-serif; }
          </style>
        </head>
        <body>
          <div id="cardsContainer"></div>
          <div id="loading">Loading...</div>
        </body>
      </html>
    `);
    win.document.close();

    async function loadBatch() {
      if (loading) return;
      if (offset >= total) {
        win.document.getElementById('loading').innerText = "All Cards Loaded";
        return;
      }

      loading = true;
      const batchIds = selectedStudentIds.slice(offset, offset + limit);
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
        if (!response.ok || !Array.isArray(result)) {
          throw new Error('Invalid response from server');
        }

        // ✅ Append batch cards into rows of 2
        let html = '';
        for (let i = 0; i < result.length; i += 2) {
          html += '<div class="row">';
          for (let j = i; j < i + 2 && j < result.length; j++) {
            html += `<div class="card">${result[j]}</div>`;
          }
          html += '</div>';
        }

        win.document.getElementById('cardsContainer')
          .insertAdjacentHTML('beforeend', html);

        offset += limit;
        loading = false;

      } catch (error) {
        console.error(error);
        win.document.getElementById('loading').innerText = 'Error loading cards ❌';
      }
    }

    // Lazy load on scroll
    win.addEventListener('scroll', () => {
      const nearBottom =
        win.innerHeight + win.scrollY >= win.document.body.offsetHeight - 200;

      if (nearBottom) {
        loadBatch();
      }
    });

    // First batch load
    loadBatch();
  });

});









