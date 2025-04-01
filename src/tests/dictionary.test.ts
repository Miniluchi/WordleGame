import { DictionaryService } from "../services/dictionary";
import fs from "fs";
import path from "path";

describe("DictionaryService", () => {
  const dictionaryPath = path.join(__dirname, "../../data/words.json");
  const testWords = [
    "test",
    "word",
    "game",
    "play",
    "hello",
    "world",
    "pizza",
    "music",
    "dance",
    "happy",
  ];

  beforeEach(() => {
    // Nettoyer le fichier de dictionnaire avant chaque test
    if (fs.existsSync(dictionaryPath)) {
      fs.unlinkSync(dictionaryPath);
    }
    if (fs.existsSync(path.dirname(dictionaryPath))) {
      fs.rmSync(path.dirname(dictionaryPath), { recursive: true });
    }
  });

  it("should create dictionary folder and file if they don't exist", () => {
    // Vérifier que le dossier et le fichier n'existent pas
    expect(fs.existsSync(path.dirname(dictionaryPath))).toBe(false);
    expect(fs.existsSync(dictionaryPath)).toBe(false);

    // Appeler openDictionary
    DictionaryService.openDictionary();

    // Vérifier que le dossier et le fichier ont été créés
    expect(fs.existsSync(path.dirname(dictionaryPath))).toBe(true);
    expect(fs.existsSync(dictionaryPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(dictionaryPath, "utf8"))).toEqual([]);
  });

  it("should load existing dictionary file", () => {
    // Créer le dossier et le fichier avec des mots de test
    fs.mkdirSync(path.dirname(dictionaryPath), { recursive: true });
    fs.writeFileSync(dictionaryPath, JSON.stringify(testWords));

    // Appeler openDictionary
    DictionaryService.openDictionary();

    // Vérifier que les mots ont été chargés
    const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, "utf8"));
    expect(dictionary).toEqual(testWords);
  });

  it("should get a random word of specified length", () => {
    // Créer le dossier et le fichier avec des mots de test
    fs.mkdirSync(path.dirname(dictionaryPath), { recursive: true });
    fs.writeFileSync(dictionaryPath, JSON.stringify(testWords));

    // Appeler getRandomWord
    const word = DictionaryService.getRandomWord(5);

    // Vérifier que le mot est valide
    expect(word.length).toBe(5);
    expect(testWords).toContain(word);
  });

  it("should throw an error if no word of the requested length exists", () => {
    // Créer le dossier et le fichier avec des mots de test
    fs.mkdirSync(path.dirname(dictionaryPath), { recursive: true });
    fs.writeFileSync(dictionaryPath, JSON.stringify(testWords));

    // Vérifier que l'erreur est levée
    expect(() => DictionaryService.getRandomWord(10)).toThrow(
      "Aucun mot de longueur 10 trouvé dans le dictionnaire"
    );
  });

  it("should handle empty dictionary file", () => {
    // Créer le dossier et le fichier vide
    fs.mkdirSync(path.dirname(dictionaryPath), { recursive: true });
    fs.writeFileSync(dictionaryPath, "[]");

    // Vérifier que l'erreur est levée
    expect(() => DictionaryService.getRandomWord(5)).toThrow(
      "Aucun mot de longueur 5 trouvé dans le dictionnaire"
    );
  });
});
