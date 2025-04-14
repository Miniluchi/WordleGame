import { startGame, writeInColor, calculateScore } from "../services/game";
import { DictionaryService } from "../services/dictionary";
import { StatsService } from "../services/stats";
import * as readlineSync from "readline-sync";

// Mock des dépendances externes
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
    // Test de la coloration des lettres
    test("lettres bien placées -> vert", () => {
      const coloredOutput = writeInColor("TEST", "TEST");
      expect(coloredOutput).toBe(
        "\x1b[32mT\x1b[0m\x1b[32mE\x1b[0m\x1b[32mS\x1b[0m\x1b[32mT\x1b[0m"
      );
    });

    test("lettres mal placées -> jaune", () => {
      const resultat = writeInColor("STET", "TEST");

      // On vérifie juste que les codes de couleur sont présents
      expect(resultat).toMatch(/S.*T.*E.*T/);
      expect(resultat).toContain("\x1b[33m"); // Code jaune
      expect(resultat).toContain("\x1b[32m"); // Code vert
    });

    test("lettres absentes -> gris", () => {
      const resultat = writeInColor("ABCD", "TEST");
      expect(resultat).toBe(
        "\x1b[37mA\x1b[0m\x1b[37mB\x1b[0m\x1b[37mC\x1b[0m\x1b[37mD\x1b[0m"
      );
    });
  });

  describe("calculateScore", () => {
    test("score max au premier essai", () => {
      expect(calculateScore(["TEST"], "TEST")).toBe(2000);
    });

    test("score réduit après plusieurs essais", () => {
      const scoreApres3Essais = calculateScore(
        ["ABCD", "EFGH", "TEST"],
        "TEST"
      );
      expect(scoreApres3Essais).toBe(1200); // 100 * (6-3) * 4
    });

    test("score adapté à la longueur du mot", () => {
      const score = calculateScore(["ABCD", "EFGH", "TEST"], "LONGER");
      expect(score).toBe(1800); // Pour un mot de 6 lettres
    });
  });

  describe("startGame", () => {
    const options = {
      user: "testUser",
      length: "5",
      tries: "6",
      gamemode: "default",
    };

    beforeEach(() => {
      // Configuration des mocks pour le mot à deviner
      (DictionaryService.getRandomWord as jest.Mock).mockReturnValue("TEST");
      (readlineSync.question as jest.Mock).mockReturnValue("TEST");
    });

    test("partie gagnée du premier coup", () => {
      startGame(options);

      expect(DictionaryService.getRandomWord).toHaveBeenCalledWith(5);
      expect(readlineSync.question).toHaveBeenCalledWith("Entrez un mot : ");

      // Vérification de l'enregistrement de la partie
      expect(StatsService.saveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "testUser",
          word: "TEST",
          gamemode: "default",
          isWin: true,
          tries: 1,
          score: 2500, // 2000 + 500 (bonus)
        })
      );
    });

    test("jeu en mode chronométré", () => {
      startGame({ ...options, gamemode: "timed" });

      expect(StatsService.saveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          gamemode: "timed",
          isWin: true,
        })
      );
    });

    test("valeurs par défaut utilisées quand manquantes", () => {
      const optionsMinimales = { length: "5", tries: "6" };
      startGame(optionsMinimales);

      expect(StatsService.saveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          gamemode: "default",
        })
      );
    });

    test("mode de jeu invalide bloqué", () => {
      const consoleSpy = jest.spyOn(console, "log");
      startGame({ ...options, gamemode: "inexistant" });

      expect(consoleSpy).toHaveBeenCalledWith("Mode de jeu non disponible");
      expect(StatsService.saveGame).not.toHaveBeenCalled();
    });

    test("partie perdue après 6 essais", () => {
      // Simulation d'essais incorrects
      (readlineSync.question as jest.Mock)
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG")
        .mockReturnValueOnce("WRONG");

      startGame(options);

      expect(StatsService.saveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          isWin: false,
          tries: 6,
          score: 0,
        })
      );
    });

    // Ce test vérifie le time-out en mode chronométré
    test("time-out en mode chronométré", () => {
      const optionsTimer = { ...options, gamemode: "timed" };

      // Dates fixes pour simuler le dépassement de temps
      const startDate = new Date(0);
      const endDate = new Date(16000); // 16s plus tard

      global.Date = jest.fn(() => startDate) as any;
      (global.Date as any).now = jest.fn(() => 0);

      let dateCallCount = 0;
      (global.Date as any).mockImplementation(() => {
        dateCallCount++;
        return dateCallCount === 1 ? startDate : endDate;
      });

      (readlineSync.question as jest.Mock).mockReturnValue("WRONG");

      startGame(optionsTimer);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/Temps écoulé/)
      );

      global.Date = Date;
    });
  });
});
