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

  beforeEach(() => {
    // Nettoyer le fichier de stats avant chaque test
    if (fs.existsSync(statsFile)) {
      fs.unlinkSync(statsFile);
    }
    if (fs.existsSync(path.dirname(statsFile))) {
      fs.rmdirSync(path.dirname(statsFile), { recursive: true });
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
});
