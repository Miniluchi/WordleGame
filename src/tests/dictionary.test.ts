import { DictionaryService } from "../services/dictionary";
import fs from "fs";
import path from "path";

// Mock du système de fichiers
jest.mock("fs");

describe("DictionaryService", () => {
  const testWords = ["test", "word", "game", "play"];
  const testDictionaryPath = path.join(__dirname, "../../data/words.json");

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();

    // Simuler l'existence du dossier data et du fichier
    (fs.existsSync as jest.Mock).mockImplementation((path) => {
      if (path === "data") return true;
      if (path === testDictionaryPath) return true;
      return false;
    });

    // Simuler le contenu du fichier words.json
    (fs.readFileSync as jest.Mock).mockImplementation((path) => {
      if (path === testDictionaryPath) {
        return JSON.stringify(testWords);
      }
      return "";
    });

    // Empêcher l'écriture du fichier pendant les tests
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  it("should get a random word", () => {
    const word = DictionaryService.getRandomWord(5);
    expect(word.length).toBe(5);
    expect(testWords).toContain(word);
  });

  it("should throw an error if no word of the requested length exists", () => {
    expect(() => DictionaryService.getRandomWord(10)).toThrow();
  });
});
