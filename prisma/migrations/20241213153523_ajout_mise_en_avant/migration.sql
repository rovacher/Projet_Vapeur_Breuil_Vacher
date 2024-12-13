-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Jeu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "releaseDate" DATETIME NOT NULL,
    "genreId" INTEGER NOT NULL,
    "publisherId" INTEGER NOT NULL,
    "mise_en_avant" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Jeu_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Jeu_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Editeur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Jeu" ("description", "genreId", "id", "publisherId", "releaseDate", "title") SELECT "description", "genreId", "id", "publisherId", "releaseDate", "title" FROM "Jeu";
DROP TABLE "Jeu";
ALTER TABLE "new_Jeu" RENAME TO "Jeu";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
