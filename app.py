from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc

app = Flask(__name__)
CORS(app)

# Conexión a SQL Server Express con el usuario sa
def get_db_connection():
    return pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=localhost\\SQLEXPRESS;'
        'DATABASE=master;'
        'UID=sa;'
        'PWD=1234'
    )

@app.route('/create-database', methods=['POST'])
def create_database():
    db_name = request.json.get('dbName')

    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute(f"CREATE DATABASE [{db_name}]")
        cursor.close()
        conn.close()

        return jsonify({"message": f"Base de datos {db_name} creada exitosamente."}), 200
    except Exception as e:
        print("❌ Error al crear la base de datos:", e)
        return jsonify({"message": "Error al crear la base de datos.", "error": str(e)}), 500

@app.route('/create-table', methods=['POST'])
def create_table():
    db_name = request.json.get('dbName')
    table_name = request.json.get('tableName')
    fields = request.json.get('fields')

    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute(f"USE [{db_name}]")

        table_fields = ', '.join([
            f"[{field['fieldName']}] {field['fieldType']}" +
            (" PRIMARY KEY" if field['isPrimaryKey'] else "") +
            (" NULL" if field['isNull'] else " NOT NULL")
            for field in fields
        ])

        cursor.execute(f"CREATE TABLE [{table_name}] ({table_fields})")
        cursor.close()
        conn.close()

        return jsonify({"message": f"Tabla {table_name} creada exitosamente en {db_name}."}), 200
    except Exception as e:
        print("❌ Error al crear la tabla:", e)
        return jsonify({"message": "Error al crear la tabla.", "error": str(e)}), 500

@app.route('/list-databases', methods=['GET'])
def list_databases():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')")
        dbs = [row[0] for row in cursor.fetchall()]

        cursor.close()
        conn.close()

        return jsonify({"databases": dbs}), 200
    except Exception as e:
        print("❌ Error al listar bases de datos:", e)
        return jsonify({"message": "Error al listar bases de datos", "error": str(e)}), 500

@app.route('/list-tables/<db_name>', methods=['GET'])
def list_tables(db_name):
    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute(f"USE [{db_name}]; SELECT name FROM sys.tables")
        tables = [row[0] for row in cursor.fetchall()]

        cursor.close()
        conn.close()

        return jsonify({"tables": tables}), 200
    except Exception as e:
        print("❌ Error al listar tablas:", e)
        return jsonify({"message": "Error al listar tablas", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)



