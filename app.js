const express = require('express');
const path = require('path');
const hbs = require('hbs');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

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
          where: { name: genre },
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
  app.get('/', async (req, res) => {
    const games = await prisma.jeu.findMany({
      include: {
        genre: true,
        publisher: true, // Relation avec Editeur
      },
    });
    res.render('index', { games });
  });

  app.get('/games', async (req, res) => {
    const games = await prisma.jeu.findMany({
      include: { genre: true, editeur: true },
    });
    res.render('games', { games });
  });

  app.get('/games/new', async (req, res) => {
    const genres = await prisma.genre.findMany();
    const publishers = await prisma.editeur.findMany();
    res.render('new-game', { genres, publishers });
  });

  app.post('/games', async (req, res) => {
    const { title, description, releaseDate, genreId, publisherId } = req.body;
    await prisma.jeu.create({
      data: {
        title,
        description,
        releaseDate: new Date(releaseDate),
        genreId: parseInt(genreId),
        publisherId: parseInt(publisherId),
      },
    });
    res.redirect('/games');
  });

  app.get('/games/:id', async (req, res) => {
    const { id } = req.params;
    const game = await prisma.jeu.findUnique({
      where: { id: parseInt(id) },
      include: { genre: true, editeur: true },
    });
    if (game) {
      res.render('game-detail', { game });
    } else {
      res.status(404).send('Jeu non trouvé');
    }
  });

  // Lancer le serveur
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
})();
