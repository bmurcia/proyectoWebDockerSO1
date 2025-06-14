from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc

app = Flask(__name__)
CORS(app)

# Conexión a SQL Server Express con el usuario sa
def get_db_connection(database = 'master'):
    return pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=localhost\\SQLEXPRESS;'
        f'DATABASE={database};'
        'UID=sa;'
        'PWD=1234'
    )

# Crear Base de datos
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
    
# Listar la base de datos
@app.route('/databases', methods=['GET'])

def list_databases():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')")


        dbs = [row.name for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({"databases": dbs}), 200
    except Exception as e:
        print("❌ error al listar datos", e)
        return jsonify({"message": "Error al obtener base de datos.", "error": str(e)}), 500


    
# Crear Tabla
@app.route('/create-table', methods=['POST'])
def create_table():
    data = request.json
    db_name = data.get('dbName')
    table_name = data.get('tableName')
    fields = data.get('fields', [])

    try:
        conn = get_db_connection(db_name)
        cursor = conn.cursor()
        field_definition = []
        primary_keys = []

        for field in fields:
            name = field['name']
            ftype = field['type']
            nullable = 'NULL' if field['allowNull'] else 'NOT NULL'
            field_definition.append(f"[{name}] {ftype} {nullable}")

            if field['primarykey']:
                primary_keys.append(name)
        pk_clause = f", PRIMARY KEY ({', '.join([f'[{pk}]' for pk in primary_keys]) })" if primary_keys else ''
        create_stmt = f"CREATE TABLE [{table_name}] ({', '.join(field_definition)}{pk_clause})"

        cursor.execute(create_stmt)
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": f"Tabla '{table_name}' creada correctamente en la base de datos '{db_name}'. "}), 200

    except Exception as e:
        print("❌ Error al crear la tabla", e)
        return jsonify({"message": "Error al crear la tabla.", "error": str(e)}), 500             


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)



