"""
seed_countries.py
Peuple la table 'countries' avec tous les pays du monde.
Usage : python seed_countries.py
"""

from database import SessionLocal, Country, Base, engine

COUNTRIES = [
    ("Afghanistan", "AF"), ("Afrique du Sud", "ZA"), ("Albanie", "AL"),
    ("Algérie", "DZ"), ("Allemagne", "DE"), ("Andorre", "AD"),
    ("Angola", "AO"), ("Antigua-et-Barbuda", "AG"), ("Arabie Saoudite", "SA"),
    ("Argentine", "AR"), ("Arménie", "AM"), ("Australie", "AU"),
    ("Autriche", "AT"), ("Azerbaïdjan", "AZ"), ("Bahamas", "BS"),
    ("Bahreïn", "BH"), ("Bangladesh", "BD"), ("Barbade", "BB"),
    ("Bélarus", "BY"), ("Belgique", "BE"), ("Belize", "BZ"),
    ("Bénin", "BJ"), ("Bhoutan", "BT"), ("Bolivie", "BO"),
    ("Bosnie-Herzégovine", "BA"), ("Botswana", "BW"), ("Brésil", "BR"),
    ("Brunéi", "BN"), ("Bulgarie", "BG"), ("Burkina Faso", "BF"),
    ("Burundi", "BI"), ("Cabo Verde", "CV"), ("Cambodge", "KH"),
    ("Cameroun", "CM"), ("Canada", "CA"), ("Centrafrique", "CF"),
    ("Chili", "CL"), ("Chine", "CN"), ("Chypre", "CY"),
    ("Colombie", "CO"), ("Comores", "KM"), ("Congo", "CG"),
    ("Congo (RDC)", "CD"), ("Corée du Nord", "KP"), ("Corée du Sud", "KR"),
    ("Costa Rica", "CR"), ("Côte d'Ivoire", "CI"), ("Croatie", "HR"),
    ("Cuba", "CU"), ("Danemark", "DK"), ("Djibouti", "DJ"),
    ("Dominique", "DM"), ("Égypte", "EG"), ("Émirats arabes unis", "AE"),
    ("Équateur", "EC"), ("Érythrée", "ER"), ("Espagne", "ES"),
    ("Eswatini", "SZ"), ("Estonie", "EE"), ("États-Unis", "US"),
    ("Éthiopie", "ET"), ("Fidji", "FJ"), ("Finlande", "FI"),
    ("France", "FR"), ("Gabon", "GA"), ("Gambie", "GM"),
    ("Géorgie", "GE"), ("Ghana", "GH"), ("Grèce", "GR"),
    ("Grenade", "GD"), ("Guatemala", "GT"), ("Guinée", "GN"),
    ("Guinée-Bissau", "GW"), ("Guinée équatoriale", "GQ"), ("Guyana", "GY"),
    ("Haïti", "HT"), ("Honduras", "HN"), ("Hongrie", "HU"),
    ("Inde", "IN"), ("Indonésie", "ID"), ("Irak", "IQ"),
    ("Iran", "IR"), ("Irlande", "IE"), ("Islande", "IS"),
    ("Israël", "IL"), ("Italie", "IT"), ("Jamaïque", "JM"),
    ("Japon", "JP"), ("Jordanie", "JO"), ("Kazakhstan", "KZ"),
    ("Kenya", "KE"), ("Kirghizistan", "KG"), ("Kiribati", "KI"),
    ("Kosovo", "XK"), ("Koweït", "KW"), ("Laos", "LA"),
    ("Lesotho", "LS"), ("Lettonie", "LV"), ("Liban", "LB"),
    ("Libéria", "LR"), ("Libye", "LY"), ("Liechtenstein", "LI"),
    ("Lituanie", "LT"), ("Luxembourg", "LU"), ("Macédoine du Nord", "MK"),
    ("Madagascar", "MG"), ("Malaisie", "MY"), ("Malawi", "MW"),
    ("Maldives", "MV"), ("Mali", "ML"), ("Malte", "MT"),
    ("Maroc", "MA"), ("Marshall", "MH"), ("Maurice", "MU"),
    ("Mauritanie", "MR"), ("Mexique", "MX"), ("Micronésie", "FM"),
    ("Moldova", "MD"), ("Monaco", "MC"), ("Mongolie", "MN"),
    ("Monténégro", "ME"), ("Mozambique", "MZ"), ("Myanmar", "MM"),
    ("Namibie", "NA"), ("Nauru", "NR"), ("Népal", "NP"),
    ("Nicaragua", "NI"), ("Niger", "NE"), ("Nigéria", "NG"),
    ("Norvège", "NO"), ("Nouvelle-Zélande", "NZ"), ("Oman", "OM"),
    ("Ouganda", "UG"), ("Ouzbékistan", "UZ"), ("Pakistan", "PK"),
    ("Palaos", "PW"), ("Palestine", "PS"), ("Panama", "PA"),
    ("Papouasie-Nouvelle-Guinée", "PG"), ("Paraguay", "PY"), ("Pays-Bas", "NL"),
    ("Pérou", "PE"), ("Philippines", "PH"), ("Pologne", "PL"),
    ("Portugal", "PT"), ("Qatar", "QA"), ("Roumanie", "RO"),
    ("Royaume-Uni", "GB"), ("Russie", "RU"), ("Rwanda", "RW"),
    ("Saint-Christophe-et-Niévès", "KN"), ("Saint-Marin", "SM"), ("Saint-Vincent-et-les-Grenadines", "VC"),
    ("Sainte-Lucie", "LC"), ("Salomon", "SB"), ("Salvador", "SV"),
    ("Samoa", "WS"), ("São Tomé-et-Príncipe", "ST"), ("Sénégal", "SN"),
    ("Serbie", "RS"), ("Seychelles", "SC"), ("Sierra Leone", "SL"),
    ("Singapour", "SG"), ("Slovaquie", "SK"), ("Slovénie", "SI"),
    ("Somalie", "SO"), ("Soudan", "SD"), ("Soudan du Sud", "SS"),
    ("Sri Lanka", "LK"), ("Suède", "SE"), ("Suisse", "CH"),
    ("Suriname", "SR"), ("Syrie", "SY"), ("Tadjikistan", "TJ"),
    ("Tanzanie", "TZ"), ("Tchad", "TD"), ("Tchéquie", "CZ"),
    ("Thaïlande", "TH"), ("Timor oriental", "TL"), ("Togo", "TG"),
    ("Tonga", "TO"), ("Trinité-et-Tobago", "TT"), ("Tunisie", "TN"),
    ("Turkménistan", "TM"), ("Turquie", "TR"), ("Tuvalu", "TV"),
    ("Ukraine", "UA"), ("Uruguay", "UY"), ("Vanuatu", "VU"),
    ("Vatican", "VA"), ("Venezuela", "VE"), ("Vietnam", "VN"),
    ("Yémen", "YE"), ("Zambie", "ZM"), ("Zimbabwe", "ZW"),
]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    added = 0
    skipped = 0
    for name, code in COUNTRIES:
        exists = db.query(Country).filter(
            (Country.name == name) | (Country.code == code)
        ).first()
        if not exists:
            db.add(Country(name=name, code=code))
            added += 1
        else:
            skipped += 1
    db.commit()
    db.close()
    print(f"✅ Seed terminé : {added} pays ajoutés, {skipped} déjà présents.")

if __name__ == "__main__":
    seed()
