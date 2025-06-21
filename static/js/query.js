  import {API_BASE_URL} from './env.js';
  import { currentDatabase } from './main.js';

  export function runQuery() {
    const dbSelect = document.getElementById("db-select");
    const queryInput = document.getElementById("query-text");
    const resultDisplay = document.getElementById("query-results");

    const dbName = currentDatabase;
    const query = queryInput.value;

    if (!dbName) {
      alert("⚠️ Por favor selecciona una base de datos antes de ejecutar la consulta.");
      return;
    }

    fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: { "Content-Type": 'application/json' },
      body: JSON.stringify({ database: dbName, query: query }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Error desconocido en el servidor");
        }
        if (data.results && Array.isArray(data.results)) {
          resultDisplay.textContent = JSON.stringify(data.results, null, 2);
        } else {
          
          alert("✅ Query ejecutado correctamente");
          dbSelect.value = "";
          queryInput.value = "";
          resultDisplay.textContent = "";
        }
      })
      .catch(err => {
        console.error("❌ Error real:", err);
        alert("❌ Error ejecutando la consulta:\n" + err.message);
      });
  }
