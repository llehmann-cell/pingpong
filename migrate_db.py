import psycopg2

def migrate():
    conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database="postgres",
        user="postgres",
        password="mon_mot_de_passe"
    )
    cur = conn.cursor()
    
    try:
        cur.execute("ALTER TABLE players RENAME COLUMN name TO pseudo;")
    except Exception as e:
        print("Rename name to pseudo failed:", e)
        conn.rollback()

    try:
        cur.execute("ALTER TABLE players RENAME COLUMN rating TO r;")
    except Exception as e:
        print("Rename rating to r failed:", e)
        conn.rollback()
        
    try:
        cur.execute("ALTER TABLE players RENAME COLUMN volatility TO vol;")
    except Exception as e:
        print("Rename volatility to vol failed:", e)
        conn.rollback()
        
    try:
        cur.execute("ALTER TABLE players ADD COLUMN email VARCHAR UNIQUE;")
    except Exception as e:
        print("Add email failed:", e)
        conn.rollback()
        
    try:
        cur.execute("ALTER TABLE players ADD COLUMN hashed_password VARCHAR;")
    except Exception as e:
        print("Add hashed_password failed:", e)
        conn.rollback()
        
    try:
        cur.execute("ALTER TABLE players ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;")
    except Exception as e:
        print("Add is_admin failed:", e)
        conn.rollback()
        
    conn.commit()
    cur.close()
    conn.close()
    print("Migration terminée.")

if __name__ == "__main__":
    migrate()
