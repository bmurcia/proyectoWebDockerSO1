import { API_BASE_URL } from './env.js';


export function createDatabase(event) {
  event.preventDefault();
  const dbName = document.getElementById('db-name').value.trim();

  if (!dbName) {
    alert('Por favor, ingresa un nombre válido.');
    return;
  }

  fetch(`${API_BASE_URL}/create-database`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dbName })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      document.getElementById('db-name').value = '';
      loadDatabases();
    })
    .catch(err => {
      console.error(err);
      alert('Error al crear la base de datos.');
    });
}

export function loadDatabases() {
  fetch(`${API_BASE_URL}/databases`)
    .then(res => res.json())
    .then(data => {
      const dbSelects = document.querySelectorAll('#global-db-select, #rel-db-select');
      dbSelects.forEach(select => {
        select.innerHTML = '<option value="">--Elije una base de datos--</option>';
        data.databases.forEach(db => {
          const option = document.createElement('option');
          option.value = db;
          option.textContent = db;
          select.appendChild(option);
        });
      });
    })
    .catch(err => {
      console.error('Error al cargar base de datos:', err);
    });
}
