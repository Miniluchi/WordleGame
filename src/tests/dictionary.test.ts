import { DictionaryService } from "../services/dictionary";
import fs from "fs";
import path from "path";

// Mock fs pour éviter d'interagir avec le système de fichiers réel
jest.mock("fs");

describe("Dictionnaire", () => {
  // Chemin du fichier de dictionnaire utilisé pour les tests
  const dictPath = path.join(__dirname, "../../data/words.json");

  // Liste de mots pour les tests
  const testWords = [
    "test",
    "word",
    "game",
    "play",
    "hello",
    "world", // mots de 5 lettres
    "pizza",
    "music",
    "dance",
    "happy",
  ];

  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();

    // Mock console.log pour éviter les sorties pendant les tests
    jest.spyOn(console, "log").mockImplementation(() => {});

    // Mock fs.existsSync pour simuler l'existence des fichiers
    (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath === path.dirname(dictPath)) return false;
      if (filePath === dictPath) return false;
      return false;
    });

    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath === dictPath) return JSON.stringify(testWords);
      return "";
    });

    // Mock fs.writeFileSync (ne rien faire)
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    // Mock fs.mkdirSync (ne rien faire)
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
  });

  test("création automatique du dossier et fichier si absents", () => {
    // Simuler que le fichier n'existe pas
    (fs.existsSync as jest.Mock)
      .mockReturnValueOnce(false) // le dossier n'existe pas
      .mockReturnValueOnce(false); // le fichier n'existe pas

    // Initialiser le dictionnaire
    DictionaryService.openDictionary();

    // Vérifier que le dossier et le fichier ont été créés
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(dictPath), {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(dictPath, JSON.stringify([]));
  });

  test("chargement du dictionnaire existant", () => {
    // Simuler que le fichier existe
    (fs.existsSync as jest.Mock)
      .mockReturnValueOnce(true) // le dossier existe
      .mockReturnValueOnce(true); // le fichier existe

    (fs.readFileSync as jest.Mock).mockReturnValueOnce(
      JSON.stringify(testWords)
    );

    // Charger le dictionnaire
    DictionaryService.openDictionary();

    // Vérifier que le contenu a été chargé
    expect(fs.readFileSync).toHaveBeenCalledWith(dictPath, "utf8");
  });

  test("récupération d'un mot aléatoire de longueur spécifique", () => {
    // Simuler un dictionnaire existant
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(testWords));

    // Récupérer un mot de 5 lettres
    const word = DictionaryService.getRandomWord(5);

    // Vérifier que le mot a bien 5 lettres
    expect(word.length).toBe(5);

    // Vérifier que le mot fait partie des mots de 5 lettres du dictionnaire
    const fiveLetterWords = testWords.filter((w) => w.length === 5);
    expect(fiveLetterWords).toContain(word);
  });

  test("erreur si aucun mot de la longueur demandée", () => {
    // Simuler un dictionnaire existant
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(testWords));

    // Essayer de récupérer un mot de 10 lettres (alors qu'on n'en a pas)
    expect(() => DictionaryService.getRandomWord(10)).toThrow(
      "Aucun mot de longueur 10 trouvé dans le dictionnaire"
    );
  });

  test("erreur si dictionnaire vide", () => {
    // Simuler un dictionnaire vide
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue("[]");

    // Essayer de récupérer un mot alors que le dictionnaire est vide
    expect(() => DictionaryService.getRandomWord(5)).toThrow(
      "Aucun mot de longueur 5 trouvé dans le dictionnaire"
    );
  });
});
