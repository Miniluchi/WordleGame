import * as fs from "fs";
import path from "path";

export class DictionaryService {
  //dictionnaire de 10 mots de 5 lettres, random en FR
  private static dictionary: string[] = [];
  private static dictionaryPath = path.join(__dirname, "../../data/words.json");

  static openDictionary() {
    const dataDir = path.dirname(this.dictionaryPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.dictionaryPath)) {
      fs.writeFileSync(this.dictionaryPath, JSON.stringify([]));
    }
    const dictionary = fs.readFileSync(this.dictionaryPath, "utf8");
    this.dictionary = JSON.parse(dictionary);
  }

  static getRandomWord(length: number): string {
    this.openDictionary();
    console.log(this.dictionary);
    const filteredWords = this.dictionary.filter(
      (word) => word.length === length
    );
    if (filteredWords.length === 0) {
      throw new Error(
        `Aucun mot de longueur ${length} trouvé dans le dictionnaire`
      );
    }
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
  }
}
