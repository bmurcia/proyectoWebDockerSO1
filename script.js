// Agrega un campo al formulario de tabla
function addField() {
    const container = document.getElementById('fields-container');
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';

    fieldGroup.innerHTML = `
    <input type="text" placeholder="Field Name" required />
    <select>
        <option value="INT">INT</option>
        <option value="VARCHAR(100)">VARCHAR</option>
        <option value="DATE">DATE</option>
        <option value="FLOAT">FLOAT</option>
        <option value="BOOLEAN">BOOLEAN</option>
        <option value="TEXT">TEXT</option>
    </select>
    <label><input type="checkbox" />PK</label>
    <label><input type="checkbox" checked />NULL</label>
    <button type="button" onclick="removeField(this)">❌</button>
    `;
    container.appendChild(fieldGroup);
}

// Eliminar un campo
function removeField(button) {
    button.parentElement.remove();
}

// Crear base de datos
function createDatabase(event) {
    event.preventDefault();
    const dbName = document.getElementById('db-name').value;

    fetch('http://localhost:5000/create-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbName })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        updateSidebar();
    })
    .catch(err => {
        console.error(err);
        alert('Error al crear la base de datos.');
    });
}

// Crear tabla
function createTable(event) {
    event.preventDefault();
    const dbName = document.getElementById('db-name').value;
    const tableName = document.getElementById('table-name').value;
    const fields = [];

    document.querySelectorAll('.field-group').forEach(field => {
        const fieldName = field.querySelector('input[type="text"]').value;
        const fieldType = field.querySelector('select').value;
        const isPrimaryKey = field.querySelector('input[type="checkbox"]').checked;
        const isNull = field.querySelectorAll('input[type="checkbox"]')[1].checked;

        fields.push({ fieldName, fieldType, isPrimaryKey, isNull });
    });

    fetch('http://localhost:5000/create-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbName, tableName, fields })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        updateSidebar();
    })
    .catch(err => {
        console.error(err);
        alert('Error al crear la tabla.');
    });
}

// Eventos al cargar la página y al enviar formularios
window.addEventListener('DOMContentLoaded', updateSidebar);
document.getElementById('create-db-form').addEventListener('submit', createDatabase);
document.getElementById('create-table-form').addEventListener('submit', createTable);


