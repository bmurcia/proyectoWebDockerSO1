// Agrega un campo al formulario de tabla
function addField() {
    const container = document.getElementById('fields-container');
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';

    fieldGroup.innerHTML = `
    <input type="text" placeholder="Field Name" required />
    <select onchange= "handleTypeChange(this)">
        <option value="INT">INT</option>
        <option value="NVARCHAR">NVARCHAR</option>
        <option value="DATE">DATE</option>
        <option value="DECIMAL">DECIMAL</option>
    </select>
    <input type="number" class="nvarchar-size" placeholder="Size" style="display:none" min="1" />
    <input type="text" class="decimal-precision" placeholder="p,s" style="display:none" />
    <label><input type="checkbox"  class="pk-checkbox"/>PK</label>
    <label><input type="checkbox" checked class="null-checkbox" />NULL</label>
    <button type="button" onclick="removeField(this)">❌</button>
    `;
    container.appendChild(fieldGroup);

    const pkCheckbox = fieldGroup.querySelector('.pk-checkbox');
    const nullCheckbox = fieldGroup.querySelector('.null-checkbox');

    pkCheckbox.addEventListener('change', ()=> {
        if (pkCheckbox.checked){
            nullCheckbox.checked = false;
        }
    })
}

function handleTypeChange(select){
    const group = select.parentElement
    const nvarcharInput = group.querySelector('.nvarchar-size');
    const decimalInput = group.querySelector('.decimal-precision');

    nvarcharInput.style.display = 'none';
    decimalInput.style.display = 'none';

    if (select.value === 'NVARCHAR'){
        nvarcharInput.style.display = 'inline-block';
    }else if (select.value === 'DECIMAL') {
        decimalInput.style.display = 'inline-block';
    }
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
    })
    .catch(err => {
        console.error(err);
        alert('Error al crear la base de datos.');
    });
}



//Crear tabla
function createTable(event) {
    event.preventDefault();

    const dbName = document.getElementById('db-select').value;
    const tableName = document.getElementById('table-name').value
    const fieldGroups = document.querySelectorAll('#fields-container .field-group');

    const fields = [];
    
    for(let group of fieldGroups){
        const nameInput = group.querySelector('input[type="text"]')
        const typeSelect = group.querySelector('select')
        const pkCheckbox = group.querySelectorAll('input[type="checkbox"]')[0];
        const nullCheckbox = group.querySelectorAll('input[type="checkbox"]')[1];
        
        let fieldName = nameInput.value.trim();
        let type = typeSelect.value;

        if (!fieldName){
            alert("Todos los campos deben tener nombre")
            return;
        }

        if (fieldName.includes(fieldName.toLoweCasa())){
            alert(`El nombre del campo "${fieldName}" esta duplicado.`);
            return
        }

        // Validacones de los tipos de datos

        if (type === 'NVARCHAR'){
            const size = group.querySelector('.nvarchar-size').value
            if (!size || isNaN(size) || parseInt(size) <= 0){
                alert(`El campo "${fieldName}" tiene un tamano Invalido.`);
               return;
            }
            type = `NVARCHAR(${size})`;

        }else if(type === 'DECIMAL'){
            const precision = group.querySelector('.decimal-precision').value;
            const regex = /^\d+,\d+$/;
            if (!regex.test(precision)){
                alert(`El campo ${fieldName} debe tener precisión válida como "10,2" en DECIMAL.`);
                return;
            }
            type = `DECIMAL(${precision})`;
        }

        if (pkCheckbox.checked && nullCheckbox.checked){
            alert(`El campo "${fieldName} es clave primaria y no puede permitir nulos.`);
            return;
        }
        
        fields.push({
            name:fieldName,
            type,
            primarykey: pkCheckbox.checked,
            allowNull: nullCheckbox.checked
        });
    }

    //enviar al backend
    fetch('http://localhost:5000/create-table', {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({dbName, tableName, fields})
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message)
        })
        .catch(err =>{
            console.error(err);
            alert('Error al crear la tabla.');
        });
}

// cargar lista de base de datos
function loadDatabases(){
    fetch('http://localhost:5000/databases')
        .then(res=> res.json())
        .then(data =>{
            const select = document.getElementById('db-select');
            select.innerHTML = '<option value="">--Elije una base de datos--</option>';
            data.databases.forEach(db => {
                const option = document.createElement('option');
                option.value = db;
                option.textContent = db;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Error al cargar base de datos:', err);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDatabases();
} )


// Eventos al cargar la página y al enviar formularios
document.getElementById('create-db-form').addEventListener('submit', createDatabase);
document.getElementById('create-table-form').addEventListener('submit',createTable);



