import psycopg2

def test_connexion():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="postgres",
            user="postgres",
            password="mon_mot_de_passe" 
        )
        cur = conn.cursor()
        
        cur.execute("SELECT pseudo, r FROM players;")
        rows = cur.fetchall()
        
        print("CONNEXION RÉUSSIE !")
        print("Voici les joueurs trouvés dans la base :")
        for row in rows:
            print(f"- {row[0]} : {row[1]} points")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print("ERREUR DE CONNEXION :")
        print(e)

if __name__ == "__main__":
    test_connexion()