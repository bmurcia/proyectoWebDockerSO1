# 🐳 Proyecto: Aplicación con Contenedores

## 🎯 Objetivo del Proyecto

El objetivo de este proyecto es que los integrantes del equipo exploren y apliquen conceptos clave de los **sistemas operativos**, tales como:

- Contenedores
- Virtualización
- Gestión de recursos (CPU, memoria, red)
- Imágenes de sistema

Esto se logrará mediante la construcción y despliegue de una **aplicación web simple** utilizando tecnologías como **Docker** y **Render.com**.

---

## ⚙️ Tecnologías Utilizadas

- **Docker**: Para contenerizar la aplicación.
- **Render.com**: Plataforma en la nube para el despliegue de la app.
- **Flask (Python)**: Backend de la aplicación web.
- **HTML + CSS + JavaScript**: Interfaz de usuario.
- **SQL Server / Azure SQL**: Base de datos utilizada.
- **Git + GitHub**: Control de versiones y repositorio del proyecto.

---
# IMAGENES
![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)

# DOCUMENTACION DEL PROYECTO
CRUD de Base de Datos con Flask + SQL Server + JavaScript
Esta es una aplicación web que permite gestionar bases de datos de SQL Server desde una interfaz visual desarrollada con Flask (Python), HTML, CSS y JavaScript. El objetivo es facilitar la creación de bases, tablas, relaciones, vistas y triggers sin necesidad de escribir todo el SQL manualmente.

Funcionalidades principales
Crear bases de datos
Crear tablas personalizadas
Establecer relaciones entre tablas
Crear vistas
Crear triggers
Ejecutar query

Tecnologías utilizadas
Backend: Flask (Python)
Frontend: HTML, CSS y JavaScript
Base de datos: SQL Server
Conexión con la BD: pyodbc (ODBC Driver 17 for SQL Server)
Cross-Origin Requests: Flask-CORS

Requisitos para ejecutar
Tener instalado Python 3.10 o superior.
Tener instalado SQL Server (preferiblemente Express).
Instalar el driver ODBC para SQL Server (versión 17 o superior).
Tener configurado el SQL Server para aceptar conexiones desde localhost.
Instalar los siguientes módulos de Python: pip install flask flask-cors pyodbc

¿Cómo se ejecuta?
Inicia el backend con:python app.py
Abre el archivo index.html desde el navegador (por ejemplo con Live Server o directamente desde 127.0.0.1:5501 si estás usando VSCode con extensión Live Server).

# Guía de uso
Crear una base de datos
Ve a "Crear Base de Datos".
Escribe el nombre de la base.
Presiona el botón "Create Database".

Crear tabla
Ve a "Crear Tabla".
Selecciona la base.
Agrega los campos que desees, selecciona tipo de dato, si es PK y si permite NULL.
Da clic en “Create Table”.

Crear relación
Selecciona dos tablas de una base ya creada.
Define la columna y el tipo de relación (clave foránea).
Guarda.

Crear trigger
Ve a "Crear Trigger".
Llena los campos:
Nombre del trigger
Evento: INSERT, UPDATE o DELETE
Tabla objetivo
Cuerpo SQL (solo el contenido entre BEGIN y END)
Ejemplo de cuerpo válido:

BEGIN
    UPDATE Supervisor
    SET Qty = Qty + 1
    WHERE Id_Empleado = (SELECT Id_Supervisor FROM inserted)
END

Crear vistas
Especifica el nombre de la vista.
Escribe un SELECT válido.
Guarda.

Errores comunes y solución
1. Error 500 al crear trigger:
Asegúrate de que el cuerpo comience con BEGIN y termine con END.
Usa nombres de tabla y trigger válidos sin caracteres especiales.

2. Error al conectar a la base de datos:
Verifica que tu SQL Server esté activo.
Usa SQL Server Configuration Manager para confirmar que tu instancia se llama como tu DB_SERVER en config.py.

3. No se listan bases de datos:
Asegúrate de tener conexión local y que el driver ODBC esté correctamente instalado.
Puedes probar la conexión manual con:

python -c "import pyodbc; print(pyodbc.drivers())"

