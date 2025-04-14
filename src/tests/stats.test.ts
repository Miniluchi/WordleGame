import { StatsService } from "../services/stats";
import fs from "fs";
import path from "path";
import { Game } from "../interfaces";

describe("Service des statistiques", () => {
  const statsFile = path.join(__dirname, "../../data/stats.json");

  // Une partie factice pour les tests
  const gameExample: Game = {
    word: "TEST",
    tries: 3,
    isWin: true,
    score: 100,
    date: new Date().toISOString(),
    user: "test",
    gamemode: "classic",
  };

  // Nettoyer l'environnement de test avant chaque test
  beforeEach(() => {
    // On supprime les fichiers s'ils existent
    if (fs.existsSync(statsFile)) {
      fs.unlinkSync(statsFile);
    }
    if (fs.existsSync(path.dirname(statsFile))) {
      fs.rmSync(path.dirname(statsFile), { recursive: true });
    }
  });

  test("ouverture du fichier de stats inexistant -> création automatique", () => {
    const stats = StatsService.openStatsFile();
    expect(stats).toEqual({ history: [] });
  });

  test("création du dossier de stats si besoin", () => {
    // Vérifier que le dossier n'existe pas avant
    expect(fs.existsSync(path.dirname(statsFile))).toBe(false);

    // Créer le dossier
    StatsService.createStatsFolder();

    // Vérifier la création
    expect(fs.existsSync(path.dirname(statsFile))).toBe(true);
    expect(fs.existsSync(statsFile)).toBe(false); // mais pas le fichier
  });

  test("création du fichier de stats vide", () => {
    // Le fichier n'existe pas
    expect(fs.existsSync(statsFile)).toBe(false);

    // Créer le fichier
    StatsService.createStatsFile();

    // Vérifier contenu initial correct
    expect(fs.existsSync(statsFile)).toBe(true);
    const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
    expect(stats).toEqual({ history: [] });
  });

  test("réécriture fichier existant mais vide", () => {
    // Créer un fichier vide
    StatsService.createStatsFolder();
    fs.writeFileSync(statsFile, "");

    // Il existe mais est vide
    expect(fs.existsSync(statsFile)).toBe(true);
    expect(fs.readFileSync(statsFile, "utf8").trim()).toBe("");

    // Le service le remplit avec les stats initiales
    StatsService.createStatsFile();
    const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
    expect(stats).toEqual({ history: [] });
  });

  test("fichier avec espaces considéré comme vide", () => {
    // Créer un fichier avec seulement des espaces/retours
    StatsService.createStatsFolder();
    fs.writeFileSync(statsFile, "\n\t\r");

    // Vérifier qu'il est considéré comme vide après trim
    expect(fs.readFileSync(statsFile, "utf8").trim()).toBe("");

    // Le service le remplit correctement
    StatsService.createStatsFile();
    const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
    expect(stats).toEqual({ history: [] });
  });

  test("sauvegarde d'une partie dans l'historique", () => {
    StatsService.saveGame(gameExample);

    // Vérifier que la partie est dans l'historique
    const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
    expect(stats.history).toHaveLength(1);
    expect(stats.history[0]).toEqual(gameExample);
  });

  test("suppression du fichier de stats", () => {
    // Créer puis supprimer
    StatsService.createStatsFile();
    expect(fs.existsSync(statsFile)).toBe(true);

    const result = StatsService.deleteStats();

    // Vérifier suppression
    expect(result).toBe(true);
    expect(fs.existsSync(statsFile)).toBe(false);
  });

  test("suppression d'un fichier inexistant -> false", () => {
    // Tenter de supprimer un fichier qui n'existe pas
    const result = StatsService.deleteStats();
    expect(result).toBe(false);
  });

  test("calcul correct des stats avec parties diverses", () => {
    // Ajouter une partie gagnée
    StatsService.saveGame(gameExample);

    // Ajouter une partie perdue
    StatsService.saveGame({
      ...gameExample,
      isWin: false,
      score: 0,
    });

    // Vérifier les calculs
    const stats = StatsService.calculateStats();
    expect(stats).toEqual({
      totalGames: 2,
      totalWins: 1,
      totalLosses: 1,
      totalScore: 100, // 100 + 0
    });
  });

  test("détection des modifications -> retourne true/false", () => {
    // Cas 1: pas de modification
    const stats = StatsService.openStatsFile();
    const result1 = StatsService.saveStats(stats);
    expect(result1).toBe(false);

    // Cas 2: avec modification
    stats.history.push(gameExample);
    const result2 = StatsService.saveStats(stats);
    expect(result2).toBe(true);
  });

  test("affichage correcte des statistiques", () => {
    // Ajouter des parties pour avoir des stats
    StatsService.saveGame(gameExample);
    StatsService.saveGame({ ...gameExample, isWin: false, score: 0 });

    // Surveiller les appels à console.log
    const consoleSpy = jest.spyOn(console, "log");

    // Appeler l'affichage
    StatsService.showStats({});

    // Vérifier l'affichage
    expect(consoleSpy).toHaveBeenCalledTimes(5);
    expect(consoleSpy).toHaveBeenNthCalledWith(1, "Statistiques du joueur :");
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      "Nombre total de parties jouées : 2"
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      3,
      "Nombre total de parties gagnées : 1"
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      4,
      "Nombre total de parties perdues : 1"
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      5,
      "Nombre total de points gagnés : 100"
    );

    consoleSpy.mockRestore();
  });
});
