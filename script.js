
const databases = [];
const tables = {};
const functions = {};
const triggers = {};
const views = [];
const relationships = [];

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  const active = document.getElementById(sectionId);
  if (active) active.classList.add('active');

  document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.sidebar-btn'))
    .find(b => b.dataset.section === sectionId);
  if (activeBtn) activeBtn.classList.add('active');

  active?.focus();
}

function addField() {
  const container = document.getElementById('fields-container');
  const fieldGroup = document.createElement('div');
  fieldGroup.className = 'field-group';

  const nameDiv = document.createElement('div');
  const labelName = document.createElement('label');
  labelName.textContent = 'Name:';
  const inputName = document.createElement('input');
  inputName.type = 'text';
  inputName.placeholder = 'Field Name';
  inputName.required = true;
  inputName.autocomplete = 'off';
  nameDiv.appendChild(labelName);
  nameDiv.appendChild(inputName);

  const typeDiv = document.createElement('div');
  const labelType = document.createElement('label');
  labelType.textContent = 'Type:';
  const selectType = document.createElement('select');
  selectType.required = true;
  ['VARCHAR', 'INT', 'DATE', 'BOOLEAN', 'FLOAT', 'TEXT'].forEach(type => {
    const option = document.createElement('option');
    option.value = type.toLowerCase();
    option.textContent = type;
    selectType.appendChild(option);
  });
  typeDiv.appendChild(labelType);
  typeDiv.appendChild(selectType);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove';
  removeBtn.className = 'remove-field';
  removeBtn.addEventListener('click', () => {
    container.removeChild(fieldGroup);
  });

  fieldGroup.appendChild(nameDiv);
  fieldGroup.appendChild(typeDiv);
  fieldGroup.appendChild(removeBtn);
  container.appendChild(fieldGroup);
}

function populateDatabases() {
  const dbSelects = [document.getElementById('db-select'), document.getElementById('rel-db-select')];
  dbSelects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Elije una base de datos --</option>';
    databases.forEach(db => {
      const option = document.createElement('option');
      option.value = db;
      option.textContent = db;
      sel.appendChild(option);
    });
  });
  updateRelationshipTables();
  updateTableList();
}

function updateTableList() {
  const dbSelect = document.getElementById('db-select');
  const tablesListContainer = document.getElementById('db-tables-list');
  const selectedDb = dbSelect.value;

  if (!selectedDb || !tables[selectedDb]) {
    tablesListContainer.textContent = 'No hay tablas disponibles para esta base de datos.';
    return;
  }

  const tablesInDb = tables[selectedDb];
  if (tablesInDb.length === 0) {
    tablesListContainer.textContent = 'No hay tablas creadas aún en esta base de datos.';
    return;
  }

  const ul = document.createElement('ul');
  ul.style.paddingLeft = '1.2rem';
  ul.style.margin = '0';

  tablesInDb.forEach(table => {
    const li = document.createElement('li');
    li.textContent = table.name;
    ul.appendChild(li);
  });

  tablesListContainer.innerHTML = '';
  tablesListContainer.appendChild(ul);
}

document.getElementById('db-select').addEventListener('change', () => {
  updateTableList();
});

function updateRelationshipTables() {
  const db = document.getElementById('rel-db-select').value;
  const pSelect = document.getElementById('parent-table-select');
  const cSelect = document.getElementById('child-table-select');
  pSelect.innerHTML = '<option value="">-- Elije tabla padre --</option>';
  cSelect.innerHTML = '<option value="">-- Elije tabla hija --</option>';
  if(!db || !tables[db]) return;
  tables[db].forEach(t => {
    const o1 = document.createElement('option');
    o1.value = t.name; o1.textContent = t.name;
    const o2 = o1.cloneNode(true);
    pSelect.appendChild(o1);
    cSelect.appendChild(o2);
  });
  updateParentFields();
  updateChildFields();
}

function updateParentFields() {
  const db = document.getElementById('rel-db-select').value;
  const table = document.getElementById('parent-table-select').value;
  const pField = document.getElementById('parent-field-select');
  pField.innerHTML = '<option value="">-- Elije campo padre --</option>';
  if(!db||!table||!tables[db]) return;
  const t = tables[db].find(x=>x.name===table);
  if(!t) return;
  t.fields.forEach(f=>{
    const opt = document.createElement('option');
    opt.value=f.name; opt.textContent=`${f.name} (${f.type})`;
    pField.appendChild(opt);
  });
}

function updateChildFields(){
  const db = document.getElementById('rel-db-select').value;
  const table = document.getElementById('child-table-select').value;
  const cField = document.getElementById('child-field-select');
  cField.innerHTML = '<option value="">-- Elije campo hijo --</option>';
  if(!db||!table||!tables[db]) return;
  const t = tables[db].find(x=>x.name===table);
  if(!t) return;
  t.fields.forEach(f=>{
    const opt = document.createElement('option');
    opt.value = f.name; opt.textContent = `${f.name} (${f.type})`;
    cField.appendChild(opt);
  });
}

document.getElementById('create-db-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('db-name').value.trim();
  if (!name) return alert('Por favor ingresa un nombre válido para la base de datos.');
  if(databases.includes(name)) return alert('La base de datos ya existe.');
  databases.push(name);
  tables[name] = [];
  populateDatabases();
  alert(`Base de datos "${name}" creada.`);
  e.target.reset();
});

document.getElementById('create-table-form').addEventListener('submit', e => {
  e.preventDefault();
  const db = document.getElementById('db-select').value;
  const name = document.getElementById('table-name').value.trim();
  if (!db) return alert('Selecciona una base de datos.');
  if (!name) return alert('Nombre de tabla inválido.');
  if(tables[db].some(t => t.name === name)) return alert('La tabla ya existe en esta base de datos.');

  const fieldGroups = document.querySelectorAll('#fields-container .field-group');
  if (fieldGroups.length === 0) return alert('Agrega al menos un campo.');
  const fields = [];
  for(const fg of fieldGroups){
    const fieldName = fg.querySelector('input[type="text"]').value.trim();
    if (!fieldName) return alert('Completa todos los nombres de campo.');
    const type = fg.querySelector('select').value;
    fields.push({name: fieldName, type});
  }
  tables[db].push({name, fields});
  alert(`Tabla "${name}" creada en "${db}".`);
  e.target.reset();
  document.getElementById('fields-container').innerHTML = '';
  populateDatabases();
});

// El resto de manejadores para funciones, triggers, vistas, relaciones permanece igual...

window.onload = () => {
  populateDatabases();
=======
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

    if (pkCheckbox && nullCheckbox) {
        pkCheckbox.addEventListener('change', () => {
            if (pkCheckbox.checked) {
                nullCheckbox.checked = false;
            }
        });
    }
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
        document.getElementById('db-name').value = '';
        loadDatabases();
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

    const fieldNames = [];
    const fields = [];
    
    for(let group of fieldGroups){
        const nameInput = group.querySelector('input[type="text"]')
        const typeSelect = group.querySelector('select')
        const pkCheckbox = group.querySelector('input[type="checkbox"]')[0];
        const nullCheckbox = group.querySelector('input[type="checkbox"]')[1];
        
        let fieldName = nameInput.value.trim();
        let type = typeSelect.value;

        if (!fieldName){
            alert("Todos los campos deben tener nombre")
            return;
        }

        if (fieldNames.includes(fieldName.toLowerCase())) {
        alert(`El nombre del campo "${fieldName}" está duplicado.`);
        return;
        }
        fieldNames.push(fieldName.toLowerCase());

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

        if (pkCheckbox && nullCheckbox && pkCheckbox.checked && nullCheckbox.checked) {
            alert(`El campo "${fieldName}" es clave primaria y no puede permitir nulos.`);
            return;
        }
        
        fields.push({
            name: fieldName,
            type,
            primarykey: pkCheckbox ? pkCheckbox.checked : false,
            allowNull: nullCheckbox ? nullCheckbox.checked : true
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
            document.getElementById('table-name').value = '';
            const fieldsContainer = document.getElementById('fields-container')
            fieldsContainer.innerHTML = '';
            addField();
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


  document.querySelectorAll('.sidebar-btn').forEach(button => {
    button.addEventListener('click', () => {
      const section = button.dataset.section;
      if (section) showSection(section);
    });
  });

  document.getElementById('rel-db-select').addEventListener('change', () => {
    updateRelationshipTables();
  });
  document.getElementById('parent-table-select').addEventListener('change', () => {
    updateParentFields();
  });
  document.getElementById('child-table-select').addEventListener('change', () => {
    updateChildFields();
  });

  document.getElementById('db-select').addEventListener('change', () => {
    updateTableList();
  });
};
