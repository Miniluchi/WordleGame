// Stats functions

import fs from "fs";
import crypto from "crypto";
import { Game, Stats } from "../interfaces";
import path from "path";

const statsFile = path.join(__dirname, "../../data/stats.json");

export class StatsService {
  static openStatsFile(): Stats {
    if (
      !fs.existsSync(statsFile) ||
      fs.readFileSync(statsFile, "utf8").trim() === ""
    ) {
      this.createStatsFile();
    }
    return JSON.parse(fs.readFileSync(statsFile, "utf8"));
  }

  static createStatsFolder() {
    const dataDir = path.dirname(statsFile);
    // create folder if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  static createStatsFile() {
    this.createStatsFolder();
    // Vérifier si le fichier existe et n'est pas vide
    if (
      !fs.existsSync(statsFile) ||
      fs.readFileSync(statsFile, "utf8").trim() === ""
    ) {
      const initialStats: Stats = {
        history: [],
      };
      fs.writeFileSync(statsFile, JSON.stringify(initialStats, null, 2));
    }
  }

  static saveStats(stats: Stats) {
    // get sha256 of stats
    const OLD_sha256 = crypto
      .createHash("sha256")
      .update(JSON.stringify(stats))
      .digest("hex");

    fs.writeFileSync(statsFile, JSON.stringify(stats));

    const NEW_sha256 = crypto
      .createHash("sha256")
      .update(JSON.stringify(stats))
      .digest("hex");

    if (OLD_sha256 !== NEW_sha256) {
      return true;
    }
    return false;
  }

  static deleteStats() {
    if (fs.existsSync(statsFile)) {
      fs.unlinkSync(statsFile);
      return true;
    }
    return false;
  }

  static saveGame(game: Game) {
    const stats = this.openStatsFile();
    stats.history.push(game);
    this.saveStats(stats);
  }

  static showStats(options: any) {
    const stats = this.calculateStats();
    console.log("Statistiques du joueur :");
    console.log("Nombre total de parties jouées : " + stats.totalGames);
    console.log("Nombre total de parties gagnées : " + stats.totalWins);
    console.log("Nombre total de parties perdues : " + stats.totalLosses);
    console.log("Nombre total de points gagnés : " + stats.totalScore);
  }

  static calculateStats() {
    const stats = this.openStatsFile();
    return {
      totalGames: stats.history.length,
      totalWins: stats.history.filter((game: Game) => game.isWin).length,
      totalLosses: stats.history.filter((game: Game) => !game.isWin).length,
      totalScore: stats.history.reduce((acc, game) => acc + game.score, 0),
    };
  }
}
