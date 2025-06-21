from flask import Flask, request, jsonify
from flask_cors import CORS 
from flask import make_response
import pyodbc
import config

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# Conexión a SQL Server Express con el usuario sa
def get_db_connection(database='master'):
    return pyodbc.connect(
        f'DRIVER={{{config.DB_DRIVER}}};'
        f'SERVER={config.DB_SERVER};'
        f'DATABASE={database};'
        f'UID={config.DB_USER};'
        f'PWD={config.DB_PASSWORD};'
        f'Encrypt=yes;'
        f'TrustServerCertificate=no;'
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

# Obtener Tablas
@app.route('/tables/<db_name>', methods=['GET'])
def get_tables(db_name):
    try:
        conn = get_db_connection(db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM Sys.tables")
        tables = [row.name for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({"tables": tables}), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener la tabla", "error": str(e)}), 500    

# Obtener columnas
@app.route('/columns/<db_name>/<table_name>', methods=['GET'])
def get_columns(db_name, table_name):
    try:
        conn = get_db_connection(db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?", (table_name,))
        columns = [{"name": row.COLUMN_NAME, "type": row.DATA_TYPE} for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify(columns), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener columnas", "error": str(e)}), 500




@app.route('/create-relationship', methods=['POST', 'OPTIONS'])
def create_relationship():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response, 200

    data = request.get_json()
    print("📥 POST recibido:", data)

    db_name = data.get('dbname')
    parent_table = data.get('parentTable')
    parent_field = data.get('parentField')
    child_table = data.get('childTable')
    child_field = data.get('childField')

    try:
        conn = get_db_connection(db_name)
        cursor = conn.cursor()

        fk_name = f"FK_{child_table}_{parent_table}"
        query = f"""
        ALTER TABLE [{child_table}]
        ADD CONSTRAINT [{fk_name}]
        FOREIGN KEY ([{child_field}]) REFERENCES [{parent_table}] ([{parent_field}])
        """
        print(" Ejecutando SQL:\n", query)
        cursor.execute(query)
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": f"Relación creada exitosamente entre {parent_table} y {child_table}."}), 200

    except Exception as e:
        print("❌ Error al crear la relación:", e)
        return jsonify({"message": "Error al crear la relación", "error": str(e)}), 500


# Querys
@app.route('/query', methods=['POST'])
def run_query():
    data = request.json
    database = data.get('database')
    query = data.get('query')

    try:
        conn = get_db_connection(database)
        cursor = conn.cursor()
        cursor.execute(query)

        if cursor.description:  
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
        else:
            conn.commit()
            rows = [{"message": "Consulta ejecutada correctamente"}]

        cursor.close()
        conn.close()
        return jsonify({"results": rows}), 200

    except Exception as e:
        print("❌ Error al ejecutar consulta:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/')
def home():
    return '''
    <h2>✅ API Activa</h2>
    <p>Tu backend Flask está desplegado correctamente en Render.</p>
    <p>Rutas disponibles:</p>
    <ul>
        <li>POST /create-database</li>
        <li>GET /databases</li>
        <li>POST /create-table</li>
        <li>GET /tables/&lt;db_name&gt;</li>
        <li>GET /columns/&lt;db_name&gt;/&lt;table_name&gt;</li>
        <li>POST /create-relationship</li>
        <li>POST /query</li>
    </ul>
    '''

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=config.FLASK_PORT)



