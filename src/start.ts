// Explain me Command, and how to use it

import { Command } from "commander";
import { startGame } from "./services/game";
import { StatsService } from "./services/stats";
const program = new Command();

// Configuration de base du programme
program
  .name("worlde")
  .description("Un jeu de Wordle en ligne de commande")
  .version("1.0.0");

// Commande principale
program
  .command("play")
  .description("Démarrer une nouvelle partie")
  .option("-l, --length <number>", "Longueur minimum du mot", "5")
  .option("-t, --tries <number>", "Nombre d'essais maximum", "6")
  .option("-u, --user <string>", "Nom du joueur", "default")
  .option("-g, --gamemode <string>", "Mode de jeu", "default")
  .action((options) => {
    console.clear();
    console.log("\n");
    startGame(options);
  });

// Commande pour voir les statistiques
program
  .command("stats")
  .description("Afficher les statistiques du joueur")
  .option("-a, --all", "Afficher toutes les statistiques")
  .action((options) => {
    console.clear();
    console.log("\n");
    StatsService.showStats(options);
  });

// Gérer les mots
program
  .command("word")
  .description("Gestion des mots")
  .command("add")
  .description("Ajouter un nouveau mot")
  .argument("<word>", "Le mot à ajouter")
  .action((word) => {
    console.log(`Ajout du mot : ${word}`);
  });

// Parse les arguments de la ligne de commande
program.parse(process.argv);
