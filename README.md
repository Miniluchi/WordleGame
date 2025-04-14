# Wordle CLI

Un jeu Wordle en ligne de commande développé en TypeScript. Devinez le mot caché en 6 essais ou moins !

## Fonctionnalités

- 🎮 Jeu de devinettes de mots conforme aux règles de Wordle
- 🔤 Feedback visuel coloré pour chaque lettre
- ⏱️ Mode chronométré avec limite de temps
- 📊 Statistiques de jeu (parties gagnées, perdues, score)
- 💾 Sauvegarde automatique de l'historique des parties

## Prérequis

- Node.js
- npm

## Installation

1. Clonez ce dépôt :

```
git clone https://github.com/Miniluchi/WordleGame.git
cd WordleGame
```

2. Installez les dépendances :

```
npm install
```

3. Compilez le projet :

```
npm run build
```

## Utilisation

### Démarrer une partie

```
npm run start
```

Ou avec des options :

```
npm run start play -- --length 5 --tries 6 --user votre_nom
```

Options disponibles :

- `--length <nombre>` : Longueur du mot à deviner (par défaut: 5)
- `--tries <nombre>` : Nombre d'essais autorisés (par défaut: 6)
- `--user <nom>` : Votre nom d'utilisateur (par défaut: "default")
- `--gamemode <mode>` : Mode de jeu (default, timed)

### Mode chronométré

```
npm start play --gamemode timed
```

Dans ce mode, vous avez 15 secondes pour entrer chaque proposition.

### Voir les statistiques

```
npm start stats
```

## Comment jouer

1. Au début de la partie, le jeu choisit un mot aléatoire
2. Vous avez 6 essais (par défaut) pour deviner le mot
3. Après chaque proposition, les lettres seront colorées :
   - 🟩 Vert : Lettre correcte et à la bonne position
   - 🟨 Jaune : Lettre correcte mais à la mauvaise position
   - ⬜ Gris : Lettre absente du mot

## Développement

### Structure du projet

```
WordleGame/
├── src/                  # Code source
│   ├── interfaces/       # Interfaces TypeScript
│   ├── services/         # Services (jeu, stats, dictionnaire)
│   └── start.ts          # Point d'entrée
├── data/                 # Données persistantes
│   ├── stats.json        # Statistiques des parties
│   └── words.json        # Dictionnaire de mots
└── tests/                # Tests unitaires
```

### Commandes disponibles

- `npm start` : Démarrer l'application
- `npm run build` : Compiler le projet TypeScript
- `npm test` : Exécuter les tests
- `npm run test:watch` : Exécuter les tests en mode watch
- `npm run test:coverage` : Exécuter les tests avec couverture

## Tests

Le projet utilise Jest pour les tests. Pour exécuter tous les tests :

```
npm test
```

Pour voir la couverture de code :

```
npm run test:coverage
```

## Auteur

Nathan OGER
