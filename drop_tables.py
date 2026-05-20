import psycopg2

def drop():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="postgres",
            user="postgres",
            password="mon_mot_de_passe"
        )
        cur = conn.cursor()
        
        # We drop all tables in public schema
        cur.execute("""
            DROP TABLE IF EXISTS matches, players, clubs, club_members, friendships, countries, users, table_spots, opponent_notes CASCADE;
        """)
        conn.commit()
        print("Dropped all existing tables successfully.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print("Error during drop:", e)

if __name__ == "__main__":
    drop()
