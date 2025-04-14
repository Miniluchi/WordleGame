import { DictionaryService } from "../services/dictionary";
import fs from "fs";
import path from "path";

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

  // Nettoyer l'environnement avant chaque test
  beforeEach(() => {
    // Supprimer les fichiers/dossiers de test s'ils existent déjà
    if (fs.existsSync(dictPath)) {
      fs.unlinkSync(dictPath);
    }
    const dataDir = path.dirname(dictPath);
    if (fs.existsSync(dataDir)) {
      fs.rmSync(dataDir, { recursive: true });
    }
  });

  test("création automatique du dossier et fichier si absents", () => {
    // Vérifier l'état initial
    expect(fs.existsSync(path.dirname(dictPath))).toBe(false);
    expect(fs.existsSync(dictPath)).toBe(false);

    // Initialiser le dictionnaire
    DictionaryService.openDictionary();

    // Vérifier que tout a été créé correctement
    expect(fs.existsSync(path.dirname(dictPath))).toBe(true);
    expect(fs.existsSync(dictPath)).toBe(true);

    // Vérifier qu'on a un dictionnaire vide au début
    const dict = JSON.parse(fs.readFileSync(dictPath, "utf8"));
    expect(dict).toEqual([]);
  });

  test("chargement du dictionnaire existant", () => {
    // Préparer un dictionnaire de test
    fs.mkdirSync(path.dirname(dictPath), { recursive: true });
    fs.writeFileSync(dictPath, JSON.stringify(testWords));

    // Charger le dictionnaire
    DictionaryService.openDictionary();

    // Vérifier que les mots ont été chargés
    const dictContents = JSON.parse(fs.readFileSync(dictPath, "utf8"));
    expect(dictContents).toEqual(testWords);
  });

  test("récupération d'un mot aléatoire de longueur spécifique", () => {
    // Créer un dictionnaire avec nos mots de test
    fs.mkdirSync(path.dirname(dictPath), { recursive: true });
    fs.writeFileSync(dictPath, JSON.stringify(testWords));

    // Récupérer un mot de 5 lettres
    const word = DictionaryService.getRandomWord(5);

    // Vérifier que le mot a bien 5 lettres et existe dans notre liste
    expect(word.length).toBe(5);
    expect(testWords).toContain(word);
  });

  test("erreur si aucun mot de la longueur demandée", () => {
    // Créer un dictionnaire avec nos mots de test
    fs.mkdirSync(path.dirname(dictPath), { recursive: true });
    fs.writeFileSync(dictPath, JSON.stringify(testWords));

    // Essayer de récupérer un mot de 10 lettres (alors qu'on n'en a pas)
    expect(() => DictionaryService.getRandomWord(10)).toThrow(
      "Aucun mot de longueur 10 trouvé dans le dictionnaire"
    );
  });

  test("erreur si dictionnaire vide", () => {
    // Créer un dictionnaire vide
    fs.mkdirSync(path.dirname(dictPath), { recursive: true });
    fs.writeFileSync(dictPath, "[]");

    // Essayer de récupérer un mot alors que le dictionnaire est vide
    expect(() => DictionaryService.getRandomWord(5)).toThrow(
      "Aucun mot de longueur 5 trouvé dans le dictionnaire"
    );
  });
});
