function addField() {
    const container = document.getElementById('fields-container');
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';

    fieldGroup.innerHTML = `
    <input type = "text" placeholder = "Field Name" required />
    <select>
        <option value = "INT">INT</option>
        <option value = "VARCHAR">VARCHAR</option>
        <option value = "DATE">DATE</option>
        <option value = "FLOAT">FLOAT</option>
        <option value = "BOOLEAN">BOOLEAN</option>
        <option value = "TEXT">TEXT</option>
    </select>
    <label><input type = "checkbox" />PK</label>
    <label><input type = "checkbox" checked />NULL</label>
    <button type = "button" onclick ="removeField(this)" >❌</button>
    `;
    container.appendChild(fieldGroup);
}

function removeField(button) {
  button.parentElement.remove();
}




