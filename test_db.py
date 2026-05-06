import psycopg2

def test_connexion():
    try:
        # Remplace bien 'mon_mot_de_passe' par celui que tu as choisi !
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="postgres",
            user="postgres",
            password="mon_mot_de_passe" 
        )
        cur = conn.cursor()
        
        # On demande à la base de nous donner le nom des joueurs qu'on a créé
        cur.execute("SELECT name, rating FROM players;")
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