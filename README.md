# FIFA World Cup 2026 — Prediction Bracket

Ce projet est une application web que j'ai développée pour permettre de prédire la Coupe du Monde 2026. L'idée est simple : l'utilisateur peut entrer les résultats de tous les matchs et voir comment le tournoi évolue jusqu'à la finale selon ses propres prédictions.

Au début, je voulais surtout un projet où je pouvais travailler sur la logique des classements et la gestion d'état dans une application Angular, mais petit à petit j'ai construit un vrai système complet de simulation du tournoi.

La Coupe du Monde 2026 sera organisée au Canada, au Mexique et aux États-Unis. C'est la première édition avec 48 équipes, donc 12 groupes de 4 équipes. À chaque fois que l'utilisateur entre un score, le classement du groupe se met à jour automatiquement, avec les vraies règles de la FIFA, y compris les confrontations directes.

## Installation et lancement

Pour lancer le projet, il suffit de cloner le repository GitHub, d'installer les dépendances et de démarrer l'application :

```bash
git clone https://github.com/Voronov696/worldcup-2026-predictor.git
cd worldcup-2026-predictor
npm install
npm start
```

Ensuite on ouvre `http://localhost:4200`.

Les tests se lancent avec :

```bash
npm test
```

Toutes les règles du domaine doivent passer correctement.

Lien GitHub : https://github.com/Voronov696/worldcup-2026-predictor

## Choix techniques

Techniquement, j'ai utilisé Angular avec les standalone components. Au début du projet je ne voulais pas ajouter de complexité inutile avec NgModules, donc j'ai préféré une structure plus directe où chaque composant importe seulement ce dont il a besoin.

Pour la gestion de l'état, j'utilise les Angular signals. Au début je testais avec des solutions plus classiques, mais les signals étaient suffisants et beaucoup plus simples pour ce type d'application. L'état global est stocké dans un signal unique, et les vues se mettent à jour automatiquement.

J'ai aussi utilisé TypeScript en mode strict pour éviter les erreurs. C'est parfois un peu plus contraignant, mais au final ça m'a aidé à garder un code plus propre.

Pour les tests, j'ai utilisé Vitest sur la partie domain. C'est la partie la plus importante du projet parce qu'elle contient toute la logique des règles du tournoi. Comme elle n'utilise pas Angular, Vitest est plus rapide et plus simple que les outils classiques.

Les données des équipes sont chargées au démarrage avec `APP_INITIALIZER`, donc tout est prêt avant le premier affichage. Les données sont ensuite sauvegardées dans le `localStorage` pour que l'utilisateur ne perde rien quand il recharge la page.

## Structure du projet

La structure du projet est séparée en trois grandes parties.

`src/app/domain` contient toute la logique métier. C'est là où j'ai implémenté les règles des classements, les matchs, les tiebreakers et la sélection des meilleures troisièmes équipes. Cette partie est complètement indépendante d'Angular, donc elle peut être testée seule.

`src/app/services` contient les services comme le chargement des données des équipes et la sauvegarde des prédictions dans le `localStorage`.

`src/app/components` contient l'interface utilisateur. J'ai un composant principal pour la page des groupes, un composant pour afficher les tableaux de classement, et un composant pour les matchs. J'ai essayé de réutiliser le même composant de match pour le futur système de phase finale.

Voici l'arborescence principale du projet :

```
worldcup-2026-predictor/
├── public/
│   └── teams-2026.json
├── src/
│   ├── app/
│   │   ├── domain/
│   │   │   ├── types.ts
│   │   │   ├── fixtures.ts
│   │   │   ├── standings.ts
│   │   │   └── thirdPlace.ts
│   │   ├── services/
│   │   │   ├── team-data.service.ts
│   │   │   └── prediction-store.service.ts
│   │   ├── components/
│   │   │   ├── groups-page/
│   │   │   ├── group-table/
│   │   │   └── match-card/
│   │   └── app.component.ts
│   ├── main.ts
│   └── styles.scss
```

## Règles métier

Dans le fonctionnement du classement, j'ai suivi les règles de la FIFA. Les équipes sont classées par points, ensuite différence de buts, buts marqués, confrontations directes, et enfin classement FIFA si nécessaire. La partie des confrontations directes a été la plus compliquée parce qu'il faut gérer les cas où plusieurs équipes sont à égalité en même temps.

J'ai aussi implémenté la règle des meilleurs troisièmes. Comme les équipes viennent de groupes différents, on ne peut pas utiliser les confrontations directes, donc on les classe par points, différence de buts, buts marqués et classement FIFA.

## Tests

Il y a 28 tests au total. Ils vérifient surtout la logique du classement et des règles du tournoi. Tous les tests passent correctement.

## État du projet

Le projet n'a pas encore la phase finale (les matchs à élimination directe), mais la structure est déjà prévue pour ça dans le state et les types.

## Conclusion

Pour moi, la partie la plus intéressante du projet a été la logique des classements et surtout la gestion des cas d'égalité, parce que ça demande de vraiment bien comprendre les règles du tournoi et de les transformer en code.

Ce projet m'a permis d'apprendre Angular, TypeScript, la gestion d'état avec signals, et aussi comment organiser une application complète de manière propre.