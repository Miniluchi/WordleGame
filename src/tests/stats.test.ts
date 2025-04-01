import { StatsService } from "../services/stats";
import fs from "fs";
import path from "path";
import { Game } from "../interfaces";
describe("StatsService", () => {
  const statsFile = path.join(__dirname, "../../data/stats.json");

  const gameMock: Game = {
    word: "TEST",
    tries: 3,
    isWin: true,
    score: 100,
    date: new Date().toISOString(),
    user: "test",
    gamemode: "classic",
  };

  // Delete the stats file and folder before each test
  beforeEach(() => {
    // Nettoyer le fichier de stats avant chaque test
    if (fs.existsSync(statsFile)) {
      fs.unlinkSync(statsFile);
    }
    if (fs.existsSync(path.dirname(statsFile))) {
      fs.rmSync(path.dirname(statsFile), { recursive: true });
    }
  });

  it("should open the stats file", () => {
    const stats = StatsService.openStatsFile();
    expect(stats).toEqual({ history: [] });
  });

  it("should create the stats folder if it doesn't exist", () => {
    expect(fs.existsSync(path.dirname(statsFile))).toBe(false);
    StatsService.createStatsFolder();
    expect(fs.existsSync(path.dirname(statsFile))).toBe(true);
    expect(fs.existsSync(statsFile)).toBe(false);
  });

  it("should create the stats file if it doesn't exist", () => {
    expect(fs.existsSync(statsFile)).toBe(false);
    StatsService.createStatsFile();
    expect(fs.existsSync(statsFile)).toBe(true);
    const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
    expect(stats).toEqual({ history: [] });
  });

  it("should create the stats file if it exists but is empty", () => {
    // Créer le dossier et le fichier vide
    StatsService.createStatsFolder();
    fs.writeFileSync(statsFile, ""); // Fichier avec uniquement des espaces

    // Vérifier que le fichier existe mais est vide
    expect(fs.existsSync(statsFile)).toBe(true);
    expect(fs.readFileSync(statsFile, "utf8").trim()).toBe("");

    // Appeler createStatsFile
    StatsService.createStatsFile();

    // Vérifier que le fichier contient les stats initiales
    const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
    expect(stats).toEqual({ history: [] });
  });

  it("should add a game to the history", () => {
    StatsService.saveGame(gameMock);
    const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
    expect(stats.history).toHaveLength(1);
    expect(stats.history[0]).toEqual(gameMock);
  });

  it("should delete the stats file", () => {
    StatsService.createStatsFile();
    expect(fs.existsSync(statsFile)).toBe(true);
    const result = StatsService.deleteStats();
    expect(result).toBe(true);
    expect(fs.existsSync(statsFile)).toBe(false);
  });

  it("should return false when trying to delete non-existent stats file", () => {
    // S'assurer que le fichier n'existe pas
    if (fs.existsSync(statsFile)) {
      fs.unlinkSync(statsFile);
    }
    const result = StatsService.deleteStats();
    expect(result).toBe(false);
  });

  it("should calculate the stats", () => {
    StatsService.saveGame(gameMock);
    const stats = StatsService.calculateStats();
    expect(stats).toEqual({
      totalGames: 1,
      totalWins: 1,
      totalLosses: 0,
      totalScore: 100,
    });
  });

  it("Should return a error if the sha256 of the stats file is not the same", () => {
    // if old sha256 != new sha256, return an error
    const stats = StatsService.openStatsFile();
    const stats2 = StatsService.openStatsFile();
    expect(stats).toEqual({ history: [] });
    expect(stats2).toEqual({ history: [] });
  });

  it("should return true when stats are modified and false when unchanged", () => {
    // Test avec des stats inchangées
    const stats = StatsService.openStatsFile();
    const result1 = StatsService.saveStats(stats);
    expect(result1).toBe(false);

    // Test avec des stats modifiées
    stats.history.push(gameMock);
    const result2 = StatsService.saveStats(stats);
    expect(result2).toBe(true);
  });

  it("should display stats correctly", () => {
    // Ajouter quelques parties pour avoir des stats à afficher
    StatsService.saveGame(gameMock);
    StatsService.saveGame({ ...gameMock, isWin: false, score: 0 });

    // Capturer la sortie console
    const consoleSpy = jest.spyOn(console, "log");

    // Appeler showStats
    StatsService.showStats({});

    // Vérifier que les bonnes informations ont été affichées
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

    // Restaurer le comportement original de console.log
    consoleSpy.mockRestore();
  });
});
