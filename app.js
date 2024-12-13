const express = require('express');
const path = require('path');
const hbs = require('hbs');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

const moment = require('moment'); 


// Charger les variables d'environnement
dotenv.config();

// Initialiser Prisma Client
const prisma = new PrismaClient();

// Initialiser Express
const app = express();

// Définir le moteur de vues Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/layouts'));
hbs.registerHelper('dateFormat', function (date) {
  return moment(date).format('DD/MM/YYYY'); // Vous pouvez personnaliser le format comme souhaité
});



// Middleware pour servir les fichiers statiques (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour analyser les données des formulaires POST
app.use(express.urlencoded({ extended: true }));

// Fonction pour créer les genres de jeux si nécessaire
async function createGenres() {
  const genresList = ['Action', 'Aventure', 'RPG', 'Simulation', 'Sport', 'MMORPG'];
  try {
    await prisma.$transaction(
      genresList.map((genre) =>
        prisma.genre.upsert({
          where: { name: genre },  // Assurez-vous que le champ 'name' est unique dans le modèle 'Genre'
          update: {}, // Ne modifie rien si le genre existe
          create: { name: genre }, // Crée le genre s'il n'existe pas
        })
      )
    );
    console.log('Genres créés ou mis à jour avec succès.');
  } catch (error) {
    console.error('Erreur lors de la création des genres :', error.message);
  }
}

// Démarrage sécurisé - Créer les genres AVANT de lancer le serveur
(async () => {
  await createGenres();

  // Routes
  // Route principale (Accueil)
  app.get('/', async (req, res) => {
    try {
      const featuredGames = await prisma.jeu.findMany({
        where: { mise_en_avant: true }, // Filtre uniquement les jeux mis en avant
        include: {
          genre: true,
          publisher: true, // Relation avec Editeur
        },
      });
      res.render('index', { games: featuredGames });
    } catch (error) {
      console.error('Erreur lors de la récupération des jeux mis en avant :', error.message);
      res.status(500).send('Erreur interne du serveur');
    }
  });

 // Route pour afficher tous les jeux
app.get('/games', async (req, res) => {
  try {
    const games = await prisma.jeu.findMany({
      orderBy: { title: 'asc' }, // Tri des jeux par ordre alphabétique
      include: { genre: true, publisher: true },
    });
    res.render('jeux', { games });
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux :', error.message);
    res.status(500).send('Erreur interne du serveur');
  }
});

  // Route pour ajouter un nouveau jeu
  app.get('/games/new', async (req, res) => {
    try {
      // Récupérer les genres et éditeurs pour les afficher dans des listes déroulantes
      const genres = await prisma.genre.findMany();
      const publishers = await prisma.editeur.findMany();
      res.render('nouveau_jeu', { genres, publishers });
    } catch (error) {
      console.error('Erreur lors de la récupération des genres et éditeurs :', error.message);
      res.status(500).send('Erreur interne du serveur');
    }
  });

 // Route pour afficher la liste des editeurs
 app.get('/publishers', async (req, res) => {
  //A faire par clement 
  //Ce que j'ai fait c'est un tampon pour que je puisse travailler 
  try {
    res.render('editeurs'); // Vue pour afficher le formulaire
  } catch (error) {
    console.error('Erreur lors de l\'affichage de la liste d\'éditeurs :', error.message);
    res.status(500).send('Erreur interne du serveur');
  }
});

  //Route pour ajouter un editeur
  app.get('/publishers/new', async (req, res) => {
    try {
      res.render('nouveau_editeur'); // Vue pour afficher le formulaire
    } catch (error) {
      console.error('Erreur lors de l\'affichage du formulaire d\'éditeur :', error.message);
      res.status(500).send('Erreur interne du serveur');
    }
  });
  
// Ajouter un éditeur (POST)
app.post('/publishers/new', async (req, res) => {
  try {
    const { name } = req.body; // Récupérer le nom envoyé depuis le formulaire

    // Vérifier si l'éditeur existe déjà
    const editeurExistant = await prisma.editeur.findUnique({
      where: { name },
    });

    if (editeurExistant) {
      // Rediriger avec un message d'erreur ou afficher une vue spécifique
      return res.status(400).send("L'éditeur existe déjà.");
    }

    // Si l'éditeur n'existe pas, le créer
    await prisma.editeur.create({
      data: { name },
    });

    // Rediriger vers la liste des éditeurs
    res.redirect('/publishers/new');
  } catch (error) {
    console.error("Erreur lors de la création de l'éditeur :", error.message);
    res.status(500).send("Erreur interne du serveur");
  }
});


  // Ajouter un nouveau jeu (POST)
app.post('/games/new', async (req, res) => {
  try {
    const { title, description, releaseDate, genreId, publisherId,mise_en_avant} = req.body;
    await prisma.jeu.create({
      data: {
        title,
        description,
        releaseDate: new Date(releaseDate), // Convertir en objet Date
        genreId: parseInt(genreId), // Convertir en entier
        publisherId: parseInt(publisherId), // Convertir en entier
        mise_en_avant: mise_en_avant === 'on'      
      },
    });
    res.redirect('/games/new'); // Rediriger vers la liste des jeux après la création
  } catch (error) {
    console.error('Erreur lors de la création du jeu :', error.message);
    res.status(500).send('Erreur interne du serveur');
  }
});


 // Route pour afficher les détails d'un jeu
app.get('/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const game = await prisma.jeu.findUnique({
      where: { id: parseInt(id) },
      include: {
        genre: true, // Inclure le genre du jeu
        publisher: true, // Inclure l'éditeur du jeu
      },
    });

    // Vérifier si le jeu existe
    if (game) {
      res.render('details_jeu', { game }); // Passer les données du jeu à la vue
    } else {
      res.status(404).send('Jeu non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu :', error.message);
    res.status(500).send('Erreur interne du serveur');
  }
});

// Route pour afficher le formulaire de modification prérempli
app.get('/games/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const game = await prisma.jeu.findUnique({
      where: { id: parseInt(id) },
      include: { genre: true, publisher: true },
    });

    if (!game) {
      return res.status(404).send('Jeu non trouvé');
    }

    // Récupérer les genres et éditeurs pour les listes déroulantes
    const genres = await prisma.genre.findMany();
    const publishers = await prisma.editeur.findMany();

    // Rendre la vue de modification avec les données du jeu
    res.render('modification_jeu', { game, genres, publishers });
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu à modifier :', error.message);
    res.status(500).send('Erreur interne du serveur');
  }
});


// Route pour sauvegarder les modifications du jeu
app.post('/games/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, releaseDate, genreId, publisherId, mise_en_avant } = req.body;

    // Mise à jour du jeu dans la base de données
    await prisma.jeu.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        releaseDate: new Date(releaseDate), // Convertir en objet Date
        genreId: parseInt(genreId), // Convertir en entier
        publisherId: parseInt(publisherId), // Convertir en entier
        mise_en_avant: mise_en_avant === 'on'      
      },
    });


    // Rediriger vers la page des jeux après la modification
    res.redirect('/games/:id/edit');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du jeu :', error.message);
    res.status(500).send('Erreur interne du serveur');
  }
});
// Route pour supprimer un jeu
app.post('/games/:id/delete', async (req, res) => {
  const gameId = parseInt(req.params.id);
  
  try {
    // Supprimer le jeu avec l'ID correspondant
    await prisma.jeu.delete({
      where: { id: gameId }
    });

    // Rediriger vers la page des jeux après la suppression
    res.redirect('/games');
  } catch (error) {
    console.error('Erreur lors de la suppression du jeu :', error.message);
    res.status(500).send('Erreur interne du serveur');
  }
});

  // Lancer le serveur
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
})();
