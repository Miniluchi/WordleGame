import { startGame, writeInColor, calculateScore } from "../services/game";
import { DictionaryService } from "../services/dictionary";
import { StatsService } from "../services/stats";
import * as readlineSync from "readline-sync";

// Mock des dépendances
jest.mock("../services/dictionary");
jest.mock("../services/stats");
jest.mock("readline-sync");

describe("Game Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("writeInColor", () => {
    it("should return green for correct letter in correct position", () => {
      const result = writeInColor("TEST", "TEST");
      expect(result).toBe(
        "\x1b[32mT\x1b[0m\x1b[32mE\x1b[0m\x1b[32mS\x1b[0m\x1b[32mT\x1b[0m"
      );
    });

    it("should return yellow for correct letter in wrong position", () => {
      const result = writeInColor("STET", "TEST");

      // Vérifie la présence de chaque lettre colorée sans se soucier des codes ANSI exacts
      expect(result).toMatch(/S.*T.*E.*T/);
      expect(result).toContain("\x1b[33m"); // Jaune
      expect(result).toContain("\x1b[32m"); // Vert
    });

    it("should return gray for incorrect letter", () => {
      const result = writeInColor("ABCD", "TEST");
      expect(result).toBe(
        "\x1b[37mA\x1b[0m\x1b[37mB\x1b[0m\x1b[37mC\x1b[0m\x1b[37mD\x1b[0m"
      );
    });
  });

  describe("calculateScore", () => {
    it("should calculate score correctly for first try", () => {
      const score = calculateScore(["TEST"], "TEST");
      expect(score).toBe(2000); // 100 * (6-1) * 4 (longueur du mot)
    });

    it("should calculate score correctly for multiple tries", () => {
      const score = calculateScore(["ABCD", "EFGH", "TEST"], "TEST");
      expect(score).toBe(1200); // 100 * (6-3) * 4 (longueur du mot)
    });

    it("should handle longer words correctly", () => {
      const score = calculateScore(["ABCD", "EFGH", "TEST"], "LONGER");
      expect(score).toBe(1800); // 100 * (6-3) * 6 (longueur du mot)
    });
  });

  describe("startGame", () => {
    const mockOptions = {
      user: "testUser",
      length: "5",
      tries: "6",
      gamemode: "default",
    };

    beforeEach(() => {
      // Mock DictionaryService
      (DictionaryService.getRandomWord as jest.Mock).mockReturnValue("TEST");

      // Mock readlineSync
      (readlineSync.question as jest.Mock).mockReturnValue("TEST");
    });

    it("should start a default game and win", () => {
      startGame(mockOptions);

      expect(DictionaryService.getRandomWord).toHaveBeenCalledWith(5);
      expect(readlineSync.question).toHaveBeenCalledWith("Entrez un mot : ");
      expect(StatsService.saveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "testUser",
          word: "TEST",
          gamemode: "default",
          isWin: true,
          tries: 1,
          score: 2500, // 2000 (score calculé) + 500 (bonus)
        })
      );
    });

    it("should handle timed game mode", () => {
      const timedOptions = { ...mockOptions, gamemode: "timed" };
      startGame(timedOptions);

      expect(DictionaryService.getRandomWord).toHaveBeenCalledWith(5);
      expect(readlineSync.question).toHaveBeenCalledWith("Entrez un mot : ");
      expect(StatsService.saveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "testUser",
          word: "TEST",
          gamemode: "timed",
          isWin: true,
          tries: 1,
          score: 2500, // 2000 (score calculé) + 500 (bonus)
        })
      );
    });

    it("should handle time limit exceeded in timed mode", () => {
      const timedOptions = { ...mockOptions, gamemode: "timed" };

      // Créer des dates fixes pour simuler le dépassement de temps
      const startDate = new Date(0);
      const endDate = new Date(16000); // 16 secondes plus tard

      // Simuler un dépassement de temps en remplaçant Date par des dates fixes
      global.Date = jest.fn(() => startDate) as any;
      (global.Date as any).now = jest.fn(() => 0);

      // Pour le premier appel, retourner startDate, pour le deuxième appel, retourner endDate
      let dateCallCount = 0;
      (global.Date as any).mockImplementation(() => {
        dateCallCount++;
        return dateCallCount === 1 ? startDate : endDate;
      });

      // Mock console.log pour vérifier les messages
      const consoleSpy = jest.spyOn(console, "log");

      // Mock readlineSync pour retourner un mot incorrect
      (readlineSync.question as jest.Mock).mockReturnValue("WRONG");

      // Exécuter startGame
      startGame(timedOptions);

      // Vérifier que le message de temps écoulé a été affiché
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Temps écoulé/)
      );

      // Restaurer les mocks
      jest.restoreAllMocks();
      global.Date = Date;
    });

    it("should handle invalid game mode", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const invalidOptions = { ...mockOptions, gamemode: "invalid" };

      startGame(invalidOptions);

      expect(consoleSpy).toHaveBeenCalledWith("Mode de jeu non disponible");
      expect(StatsService.saveGame).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle losing the game", () => {
      // Mock pour retourner des mots incorrects jusqu'à épuisement des essais
      (readlineSync.question as jest.Mock)
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG");

      startGame(mockOptions);

      expect(StatsService.saveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "testUser",
          word: "TEST",
          gamemode: "default",
          isWin: false,
          tries: 6,
          score: 0,
        })
      );
    });

    it("should use default values when options are missing", () => {
      const minimalOptions = { length: "5", tries: "6" };
      startGame(minimalOptions);
      expect(StatsService.saveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          gamemode: "default",
        })
      );
    });
  });
});
