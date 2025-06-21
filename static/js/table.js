import {API_BASE_URL} from './env.js';
import { currentDatabase } from './main.js';

export function addField() {
    const container = document.getElementById('fields-container');
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';

    fieldGroup.innerHTML = `
        <input type="text" placeholder="Field Name" required />
        <select>
            <option value="INT">INT</option>
            <option value="NVARCHAR">NVARCHAR</option>
            <option value="DATE">DATE</option>
            <option value="DECIMAL">DECIMAL</option>
        </select>
        <input type="number" class="nvarchar-size" placeholder="Size" style="display:none" min="1" />
        <input type="text" class="decimal-precision" placeholder="p,s" style="display:none" />
        <label><input type="checkbox" class="pk-checkbox" />PK</label>
        <label><input type="checkbox" checked class="null-checkbox" />NULL</label>
        <button type="button" class="remove-field-btn">❌</button>
    `;

    container.appendChild(fieldGroup);

    const select = fieldGroup.querySelector('select');
    select.addEventListener('change', () => handleTypeChange(select));

    const removeBtn = fieldGroup.querySelector('.remove-field-btn');
    removeBtn.addEventListener('click', () => removeField(removeBtn));

    const pkCheckbox = fieldGroup.querySelector('.pk-checkbox');
    const nullCheckbox = fieldGroup.querySelector('.null-checkbox');

    if (pkCheckbox && nullCheckbox) {
        pkCheckbox.addEventListener('change', () => {
            if (pkCheckbox.checked) {
                nullCheckbox.checked = false;
                nullCheckbox.disabled = true;
            } else {
                nullCheckbox.disabled = false;
            }
        });
    }
}

export function handleTypeChange(select) {
    const group = select.parentElement;
    const nvarcharInput = group.querySelector('.nvarchar-size');
    const decimalInput = group.querySelector('.decimal-precision');

    nvarcharInput.style.display = 'none';
    decimalInput.style.display = 'none';

    if (select.value === 'NVARCHAR') {
        nvarcharInput.style.display = 'inline-block';
    } else if (select.value === 'DECIMAL') {
        decimalInput.style.display = 'inline-block';
    }
}

function removeField(button) {
    button.parentElement.remove();
}

export function createTable(event) {
    event.preventDefault();

    const dbName = currentDatabase; 
    const tableName = document.getElementById('table-name').value;
    const fieldGroups = document.querySelectorAll('#fields-container .field-group');

    const fieldNames = [];
    const fields = [];

    for (let group of fieldGroups) {
        const nameInput = group.querySelector('input[type="text"]');
        const typeSelect = group.querySelector('select');
        const pkCheckbox = group.querySelector('.pk-checkbox');
        const nullCheckbox = group.querySelector('.null-checkbox');

        let fieldName = nameInput.value.trim();
        let type = typeSelect.value;

        if (!fieldName) {
            alert("Todos los campos deben tener nombre");
            return;
        }

        if (fieldNames.includes(fieldName.toLowerCase())) {
            alert(`El nombre del campo "${fieldName}" está duplicado.`);
            return;
        }
        fieldNames.push(fieldName.toLowerCase());

        if (type === 'NVARCHAR') {
            const size = group.querySelector('.nvarchar-size').value;
            if (!size || isNaN(size) || parseInt(size) <= 0) {
                alert(`El campo "${fieldName}" tiene un tamaño inválido.`);
                return;
            }
            type = `NVARCHAR(${size})`;
        } else if (type === 'DECIMAL') {
            const precision = group.querySelector('.decimal-precision').value;
            const regex = /^\d+,\d+$/;
            if (!regex.test(precision)) {
                alert(`El campo "${fieldName}" debe tener precisión válida como "10,2" en DECIMAL.`);
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

    console.log("Campos enviados:", fields);

    fetch(`${API_BASE_URL}/create-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbName, tableName, fields })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        document.getElementById('table-name').value = '';
        const fieldsContainer = document.getElementById('fields-container');
        fieldsContainer.innerHTML = '';
        addField();
    })
    .catch(err => {
        console.error(err);
        alert('Error al crear la tabla.');
    });
}