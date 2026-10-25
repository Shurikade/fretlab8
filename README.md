# FretLab 8

Application personnelle gratuite en français pour mémoriser les notes d’une guitare électrique 8 cordes. Aucun compte, serveur applicatif, publicité ou suivi à distance. HTML, CSS et JavaScript sans dépendance à l’exécution.

- Site : https://shurikade.github.io/fretlab8/
- Dépôt : https://github.com/Shurikade/fretlab8

## Installation sur Android

1. Ouvrir le site dans Google Chrome, en ligne.
2. Menu ⋮ → Installer l’application (ou Ajouter à l’écran d’accueil → Installer).
3. Ouvrir l’application une première fois avant de passer hors connexion.

Le manifeste utilise le mode autonome. L’installation sur le POCO F7 Ultra et son comportement système restent à confirmer sur ce téléphone.

## Les cinq modes

- **Apprendre** : deux cordes à la fois ; quatre paliers, repères visibles puis interrogation.
- **Explorer** : afficher ou masquer les notes ; toucher une position pour consulter sa note, son octave et son équivalent bémol.
- **Quelle note ?** : identifier la position « ? » sans réponse révélée avant validation.
- **Trouver** : toucher une position de la note sur la corde demandée. Plusieurs cases peuvent convenir.
- **Pense-bête** : positions de référence, gamme chromatique et règles utiles.

Les quiz classiques et Explorer permettent les cases 0 à 24, dont une option « Tout le manche ». L’apprentissage guidé introduit d’abord les cases 0 à 12.

## Accordage et exactitude

De la corde 8 grave à la corde 1 aiguë : Fa♯1–Si1–Mi2–La2–Ré3–Sol3–Si3–Mi4 (notation scientifique, Do4 = MIDI 60). Une case ajoute un demi-ton, la case 12 une octave et la case 24 deux octaves. L’exception Sol–Si utilise quatre cases ; les autres cordes adjacentes de l’accordage standard utilisent cinq cases. Un accordage personnel peut modifier cette règle.

Les notes et octaves des huit cordes se règlent séparément. Les positions mémorisées sont conservées par accordage de classes de notes ; changer uniquement l’octave conserve les acquis de reconnaissance du nom des notes.

## Progression et sauvegardes

Les réglages et progrès restent dans le navigateur, clé historique **fretlab8_v1**. Les données V3 compatibles restent lisibles. Une réponse correcte est comptée séparément de sa déclaration « sans compter » ou « en comptant » ; ces deux compteurs commencent à zéro pour une ancienne sauvegarde et ne prétendent pas reconstituer le passé. Sans déclaration, la réponse reste simplement correcte.

La pondération favorise les notes peu reconnues, les difficultés et les révisions dues. En apprentissage, environ 20 % des questions peuvent reprendre des positions déjà pratiquées hors du palier courant, y compris sur une autre paire. Un repère se renforce après deux déclarations sans compter séparées d’au moins une heure. Les échéances de révision passent à 1, 3, 7 puis 14 jours. Une erreur ou une réponse calculée remet le renforcement à zéro et augmente la priorité. La déclaration reste personnelle, sans chronomètre imposé.

Ouvrir **Sauvegarder/restaurer mes progrès**, puis exporter un JSON régulièrement. Restaurer remplace la progression après confirmation ; une copie de secours de l’état précédent est aussi gardée localement sous **fretlab8_before_import**. Les fichiers invalides sont refusés. Les données d’une ancienne page ouverte en content:// ou file:// ne sont pas accessibles automatiquement depuis GitHub Pages : exporter depuis l’ancienne version, puis importer sur le site. Une ancienne page dépourvue d’export exige une récupération spécifique.

Effacer les données Chrome, changer de navigateur ou de domaine peut supprimer ou isoler la progression. Un changement de chemin peut également laisser l’ancienne application installée : conserver l’URL de référence.

## Structure

- index.html : interface et styles de la V3 conservés.
- app.js : logique pédagogique, accordage, stockage et sauvegardes.
- manifest.webmanifest, sw.js, icon-*.png : installation et cache hors connexion.
- archive/FretLab8-original.html : HTML fourni, inchangé.
- tests/acceptance.cjs : tests de navigateur ; dépendance de développement uniquement.
- docs/VALIDATION.md : vérifications réalisées et limites.
- .github/workflows/pages.yml : tests puis déploiement automatique.

## Développement et mises à jour

La branche main est la version publiée. Pour une amélioration : créer une branche, modifier le minimum nécessaire, exécuter les tests, puis intégrer sur main. Ne jamais remplacer une progression utilisateur par des données de test.

Pour les tests : installer Node.js, lancer npm ci, puis npx playwright install chromium et npm test. Pour utiliser Chrome déjà installé, définir CHROME_PATH avec son chemin. Pour consulter l’application localement, utiliser un serveur HTTP ; un double-clic sur le HTML ne permet pas de tester la PWA.

À chaque modification d’un fichier précaché, **changer CACHE_NAME dans sw.js**, puis vérifier le scénario de mise à jour. L’ancien cache reste actif jusqu’à l’acceptation de la mise à jour dans l’application. Le nouveau cache est installé intégralement avant activation. La mise à jour ne touche pas à localStorage. Au premier lancement, attendre la fin du chargement avant de couper le réseau.

GitHub Pages utilise le sous-chemin /fretlab8/ : conserver les liens relatifs. Le workflow ne publie que les fichiers de l’application, sans les tests ni les documents de préparation. Le dépôt conserve la V3 dans son historique avant les améliorations.
