import * as readlineSync from "readline-sync";
import { CurrentGame, Game } from "../interfaces";
import { StatsService } from "./stats";
import { DictionaryService } from "./dictionary";

const TIMED_GAME_TIME_LIMIT = 15; // 15 seconds

function startGame(options: any) {
  const game: CurrentGame = {
    user: options.user || "default",
    word: DictionaryService.getRandomWord(parseInt(options.length)),
    gamemode: options.gamemode || "default",
    tries: parseInt(options.tries),
    length: parseInt(options.length),
    wordTries: [],
    score: 0,
    isWon: false,
  };
  console.log(game);

  // only default and timed are available for now
  if (game.gamemode !== "default" && game.gamemode !== "timed") {
    console.log("Mode de jeu non disponible");
    return;
  }

  console.log(
    "Bienvenue dans le jeu Wordle ! Le mot à trouver est de " +
      game.length +
      " lettres.\nVous avez " +
      game.tries +
      " essais pour le trouver.\n"
  );

  while (game.tries > 0 && !game.isWon) {
    console.log("Il vous reste " + game.tries + " essais.");
    let startTime = null;

    if (game.gamemode === "timed") {
      startTime = new Date();
      console.log(
        `Vous avez ${TIMED_GAME_TIME_LIMIT} secondes pour répondre !`
      );
    }

    const userInput = readlineSync.question("Entrez un mot : ");

    if (game.gamemode === "timed") {
      const endTime = new Date();
      const timeTaken = (endTime.getTime() - startTime!.getTime()) / 1000; // Conversion en secondes
      if (timeTaken > TIMED_GAME_TIME_LIMIT) {
        console.log(`Temps écoulé ! (${timeTaken.toFixed(1)} secondes)`);
        game.tries--;
        game.wordTries.push(userInput);
        continue;
      }
    }

    // Si le temps n'est pas écoulé, on continue avec la vérification du mot
    game.tries--;
    game.wordTries.push(userInput);

    if (userInput === game.word) {
      game.isWon = true;
    } else {
      console.log(writeInColor(userInput, game.word));
    }
  }

  if (game.isWon) {
    console.log(
      "Partie terminée, vous avez gagné ! Le mot était : " +
        game.word +
        "\nVous avez utilisé " +
        game.wordTries.length +
        " essais."
    );
    game.score = calculateScore(game.wordTries, game.word) + 500;
    console.log("Votre score est de " + game.score);
  } else {
    console.log(
      "Partie terminée, vous avez perdu ! Le mot était : " +
        game.word +
        "\nVous avez utilisé " +
        game.wordTries.length +
        " essais."
    );
  }

  const gameToSave: Game = {
    user: options.user,
    word: game.word,
    gamemode: game.gamemode,
    isWin: game.isWon,
    tries: game.wordTries.length,
    score: game.score,
    date: new Date().toISOString(),
  };
  StatsService.saveGame(gameToSave);
}

function writeInColor(userInput: string, word: string) {
  // foreach letter of the userInput
  // Green: The letter is correct and in the right position.
  // Yellow: The letter is in the word but in the wrong position.
  // Gray: The letter is not in the word.

  let output = "";
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === word[i]) {
      output += `\x1b[32m${userInput[i]}\x1b[0m`;
    } else if (word.includes(userInput[i])) {
      output += `\x1b[33m${userInput[i]}\x1b[0m`;
    } else {
      output += `\x1b[37m${userInput[i]}\x1b[0m`;
    }
  }
  return output;
}

function calculateScore(wordTries: string[], word: string) {
  let score = 0;
  // 100 x 6 - number of tries x word length
  return 100 * (6 - wordTries.length) * word.length;
}

export { startGame, writeInColor, calculateScore };
