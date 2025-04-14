import { StatsService } from "../services/stats";
import fs from "fs";
import path from "path";
import { Game } from "../interfaces";

// Mock fs pour éviter d'interagir avec le système de fichiers réel
jest.mock("fs");

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

  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();

    // Mock fs.existsSync
    (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath === path.dirname(statsFile)) return false;
      if (filePath === statsFile) return false;
      return false;
    });

    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath === statsFile) return JSON.stringify({ history: [] });
      return "";
    });

    // Mock fs.writeFileSync (ne rien faire)
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    // Mock fs.mkdirSync (ne rien faire)
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});

    // Mock fs.unlinkSync (ne rien faire)
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

    // Mock fs.rmSync (ne rien faire)
    (fs.rmSync as jest.Mock).mockImplementation(() => {});
  });

  test("ouverture du fichier de stats inexistant -> création automatique", () => {
    // Simuler que le fichier n'existe pas
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const stats = StatsService.openStatsFile();

    // Vérifier que le fichier a été créé
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(stats).toEqual({ history: [] });
  });

  test("création du dossier de stats si besoin", () => {
    // Simuler que le dossier n'existe pas
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    StatsService.createStatsFolder();

    // Vérifier que le dossier a été créé
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(statsFile), {
      recursive: true,
    });
  });

  test("création du fichier de stats vide", () => {
    // Simuler que le fichier n'existe pas
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    StatsService.createStatsFile();

    // Vérifier que le fichier a été créé avec le contenu initial
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      statsFile,
      JSON.stringify({ history: [] }, null, 2)
    );
  });

  test("réécriture fichier existant mais vide", () => {
    // Simuler un fichier vide
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue("");

    StatsService.createStatsFile();

    // Vérifier que le fichier a été réécrit
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      statsFile,
      JSON.stringify({ history: [] }, null, 2)
    );
  });

  test("fichier avec espaces considéré comme vide", () => {
    // Simuler un fichier avec seulement des espaces
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue("\n\t\r");

    StatsService.createStatsFile();

    // Vérifier que le fichier a été réécrit
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      statsFile,
      JSON.stringify({ history: [] }, null, 2)
    );
  });

  test("sauvegarde d'une partie dans l'historique", () => {
    // Simuler un fichier existant avec un historique vide
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ history: [] })
    );

    StatsService.saveGame(gameExample);

    // Vérifier que le fichier a été mis à jour
    expect(fs.writeFileSync).toHaveBeenCalled();
    const expectedStats = { history: [gameExample] };
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining(JSON.stringify(expectedStats))
    );
  });

  test("suppression du fichier de stats", () => {
    // Simuler que le fichier existe
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    const result = StatsService.deleteStats();

    // Vérifier que le fichier a été supprimé
    expect(fs.unlinkSync).toHaveBeenCalledWith(statsFile);
    expect(result).toBe(true);
  });

  test("suppression d'un fichier inexistant -> false", () => {
    // Simuler que le fichier n'existe pas
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const result = StatsService.deleteStats();

    // Vérifier que la suppression n'a pas été tentée
    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  test("calcul correct des stats avec parties diverses", () => {
    // Simuler un fichier avec plusieurs parties
    const statsWithGames = {
      history: [gameExample, { ...gameExample, isWin: false, score: 0 }],
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify(statsWithGames)
    );

    const stats = StatsService.calculateStats();

    // Vérifier les calculs
    expect(stats).toEqual({
      totalGames: 2,
      totalWins: 1,
      totalLosses: 1,
      totalScore: 100,
    });
  });

  test("détection des modifications -> retourne true/false", () => {
    // Simuler un fichier avec stats initiales
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    let currentStats = { history: [] };
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      return JSON.stringify(currentStats);
    });

    // Test 1: Pas de modification
    const stats = StatsService.openStatsFile();
    const result1 = StatsService.saveStats(stats);
    expect(result1).toBe(false);

    // Test 2: Avec modification
    stats.history.push(gameExample);
    currentStats = { history: [] }; // Simuler l'ancienne version dans le fichier
    const result2 = StatsService.saveStats(stats);
    expect(result2).toBe(true);
  });

  test("affichage correcte des statistiques", () => {
    // Simuler un fichier avec plusieurs parties
    const statsWithGames = {
      history: [gameExample, { ...gameExample, isWin: false, score: 0 }],
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify(statsWithGames)
    );

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
