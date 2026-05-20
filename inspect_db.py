import psycopg2

def inspect():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="postgres",
            user="postgres",
            password="mon_mot_de_passe"
        )
        cur = conn.cursor()
        
        # List tables
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
        tables = [row[0] for row in cur.fetchall()]
        print("Existing tables in 'public' schema:")
        for table in tables:
            print(f"\nTable: {table}")
            # Get columns for each table
            cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{table}';")
            for col in cur.fetchall():
                print(f"  - {col[0]}: {col[1]}")
                
        cur.close()
        conn.close()
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    inspect()
