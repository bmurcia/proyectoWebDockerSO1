import { API_BASE_URL } from './env.js';
import { currentDatabase } from './main.js'; 

// Funcion para cargar las tablas de la base de datos selecionada
export function loadTables(dbname) {
    fetch(`${API_BASE_URL}/tables/${dbname}`)
        .then(res => res.json())
        .then(data => {
            const selects = ['parent-table-select', 'child-table-select'];
            selects.forEach(id => {
                const select = document.getElementById(id);
                select.innerHTML = '<option value="">--Elije una tabla-- </option>';
                data.tables.forEach(table => {
                    const option = document.createElement('option');
                    option.value = table.trim();
                    option.textContent = table;
                    select.appendChild(option);

                });
            });

            document.getElementById('parent-field-select').innerHTML = '<option value="">--Elije campo padre--</option>';
            document.getElementById('child-field-select').innerHTML = '<option value="">--Elije campo hijo--</option>';
        })
        .catch(err => {
            console.log('Error al cargar las tablas', err)
            alert("No se pudieron cargar las tablas")
        });
}

// Funcion para cargar los campos de una tabla especifica
export function loadFields(dbname, tableName, targetSelectId) {
    fetch(`${API_BASE_URL}/columns/${dbname}/${tableName}`)
        .then(res => res.json())
        .then(data => {
            console.log("✅ Campos recibidos:", data);
            const select = document.getElementById(targetSelectId);
            select.innerHTML = `<option value="">--Elije campo--</option>`;

            data.forEach(column => {
                const option = document.createElement('option');
                option.value = column.name;
                option.textContent = `${column.name} (${column.type})`;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error(`Error al cargar campos de ${tableName}:`, err);
            alert("No se pudieron cargar los campos");
        });
}

//Evento para cargar los campos cuando se elija una tabla
export function setupRelationShipEvents() {
    const parentTableSelect = document.getElementById('parent-table-select');
    const childTableSelect = document.getElementById('child-table-select');

    if (parentTableSelect) {
        parentTableSelect.addEventListener('change', () => {
            const tableName = parentTableSelect.value;
            if (currentDatabase && tableName) {
                loadFields(currentDatabase, tableName, 'parent-field-select'); 
            }
        });
    }

    if (childTableSelect) {
        childTableSelect.addEventListener('change', () => {
            const tableName = childTableSelect.value;
            if (currentDatabase && tableName) {
                loadFields(currentDatabase, tableName, 'child-field-select'); 
            }
        });
    }
}    

// Funcion para crear la relacion entre tablas
 export function createRelationship () {
    const dbname = currentDatabase;

    const parentTable = document.getElementById('parent-table-select').value.trim();
    const parentField = document.getElementById('parent-field-select').value.trim();
    const childTable = document.getElementById('child-table-select').value.trim();
    const childField = document.getElementById('child-field-select').value.trim();

    if (!dbname || !parentTable || !parentField || !childTable || !childField ){
        alert("⚠️ Por favor, completa todos los campos antes de crear la relación.");
        return;
    }
    console.log("📤 Enviando a Flask:", {
        dbname,
        parentTable,
        parentField,
        childTable,
        childField
    });

    fetch(`${API_BASE_URL}/create-relationship`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body : JSON.stringify({
            dbname,
            parentTable,
            parentField,
            childTable,
            childField
        })
    })
    .then (res => res.json())
    .then(data => {
        if (data.message) {
            alert("✅ " + data.message);
        } else {
            alert("❌ Error inesperado al crear la relación.");
            console.error(data);
        }
    })
    .catch(err => {
        console.error("❌ Error al hacer la solicitud:", err);
        alert("❌ No se pudo crear la relación.");
    });
 }