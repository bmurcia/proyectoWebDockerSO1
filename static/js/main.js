import { createDatabase, loadDatabases } from './database.js';
import { createTable, addField } from './table.js';
import { setupNavigation } from './navigation.js';
import { loadTables, setupRelationShipEvents, createRelationship } from './relationship.js';
import { runQuery } from './query.js';

export let currentDatabase = '';
export function setCurrentDatabase(dbName) {
  currentDatabase = dbName;
}

window.addEventListener('DOMContentLoaded', () => {
  loadDatabases();
  setupNavigation();
  addField();
  setupRelationShipEvents();

  // Eventos generales
  //document.getElementById('create-db-form').addEventListener('submit', createDatabase);
  document.getElementById('create-table-form').addEventListener('submit', createTable);
  document.getElementById('add-field-btn').addEventListener('click', addField);
  document.getElementById('create-relationship-form').addEventListener('submit', (e) => {
    e.preventDefault();
    createRelationship();
  });
  document.getElementById('run-query-btn').addEventListener('click', runQuery);

  const globalDbSelect = document.getElementById('global-db-select');
  const dbSelectedLabel = document.getElementById('db-selected-name');

  if (globalDbSelect) {
    globalDbSelect.addEventListener('change', (e) => {
      const selectedDb = e.target.value;

      setCurrentDatabase(selectedDb); 

      if (dbSelectedLabel) {
        dbSelectedLabel.textContent = selectedDb || "Ninguna"; 
      }

      if (selectedDb) {
        console.log("🔁 Base global seleccionada:", selectedDb);
        loadTables(selectedDb);
        
        if (typeof loadTriggerTables === 'function') {
          loadTriggerTables(selectedDb);
        }
      }
    });
  }
});


