# Projet_Vapeur_Breuil_Vacher
Description du projet

Cette application permet :

    De gérer une bibliothèque de jeux vidéo (ajouter, modifier, supprimer, et consulter des jeux).
    De classer les jeux par genre ou par éditeur.
    De gérer des genres et des éditeurs de jeux vidéo.

L'application utilise Prisma ORM avec une base de données SQLite pour stocker les informations.
Technologies utilisées

    Node.js avec Express.js : Framework pour construire le serveur web.
    Prisma ORM : Gestion de la base de données.
    SQLite : Base de données utilisée pour le projet.
    Handlebars (hbs) : Moteur de templates pour les vues.
    Moment.js : Manipulation des dates.
    dotenv : Gestion des variables d'environnement.

Prérequis

Assurez-vous d'avoir les logiciels suivants installés sur votre machine :

    Node.js (v14 ou supérieure)
    npm (gestionnaire de paquets Node)
    SQLite (inclus dans les dépendances via Prisma)

Installation

    Cloner le dépôt :

git clone https://votre-repo.git
cd votre-repo

Installer les dépendances :

npm install

Configurer Prisma :

    Générer le client Prisma et la base de données SQLite :

    npx prisma migrate dev --name init

Configurer les variables d'environnement : Créez un fichier .env à la racine avec les informations suivantes :

    DATABASE_URL="file:./dev.db"

Structure du projet

projet_vapeur_breuil_vacher/
│
├── app.js                 # Fichier principal pour le serveur Express
├── package.json           # Configuration du projet et des dépendances
├── prisma/
│   ├── schema.prisma      # Configuration du modèle de base de données
│
├── public/                # Fichiers statiques (CSS, JS, images)
│   ├── css/               # Styles CSS
│   ├── js/                # Scripts JavaScript
│
├── views/                 # Templates Handlebars
│   ├── index.hbs          # Page d'accueil
│   ├── jeux.hbs           # Liste des jeux
│   ├── details_jeu.hbs    # Détails d'un jeu
│   ├── nouveau_jeu.hbs    # Formulaire d'ajout de jeu
│   ├── modification_jeu.hbs # Formulaire de modification de jeu
│   ├── editeurs.hbs       # Liste des éditeurs
│   ├── nouveau_editeur.hbs # Formulaire d'ajout d'éditeur
│   ├── modification_editeur.hbs # Formulaire de modification d'éditeur
│   ├── jeux_par_genre.hbs # Liste des jeux par genre
│   ├── jeux_par_editeur.hbs # Liste des jeux par éditeur
│   └── layouts/           # Partials Handlebars (entête, pied de page)
│
└── .env                   # Variables d'environnement

Fonctionnalités principales

    Gestion des jeux vidéo :
        Ajouter un jeu avec titre, description, date de sortie, genre et éditeur.
        Modifier les informations d'un jeu existant.
        Supprimer un jeu de la bibliothèque.
        Afficher tous les jeux triés par titre.

    Gestion des genres et éditeurs :
        Ajouter, modifier et supprimer des genres ou éditeurs.
        Afficher les jeux filtrés par genre ou éditeur.

    Templates Handlebars :
        Layouts partagés (entête, pied de page).
        Helpers Handlebars pour formater les dates ou comparer des valeurs.

    Manipulation des dates :
        Affichage des dates au format DD/MM/YYYY via Moment.js.

Lancement du serveur

npm start

Le serveur sera lancé à l'adresse suivante :
http://localhost:3000


Licence

Ce projet est sous licence CC BY-NC. Vous êtes libre de l'utiliser en priver.

Auteurs

Développé par : VACHER Rose / BREUIL Clément
Version : 1.0.0