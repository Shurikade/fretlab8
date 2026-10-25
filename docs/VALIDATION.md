# Validation — 25 octobre 2026

## Réalisé automatiquement

Tests dans Chrome sans interface, avec un profil neuf et un serveur HTTP local sous /fretlab8/ :

- 200 positions : nom de note et octave vérifiés contre les numéros MIDI de référence.
- Apprendre : les quatre paliers sur les quatre paires, étude, interrogation, révélation.
- Absence de réponse lisible sur le manche avant validation des quiz.
- Quelle note : bonnes réponses, déclaration de confiance, compteurs et absence de double enregistrement.
- Espacement des reconnaissances et remise en difficulté.
- Trouver : bonne réponse, erreur et révélation.
- Explorer : 200 cases, masquage, octave et équivalent bémol.
- Pense-bête : gamme de 12 notes et ancrages des deux cordes.
- Accordage et octave personnalisés ; retour à l’accordage standard sans perte de mémoire.
- Export JSON téléchargé, import avec rechargement, ancien format sans octaves et rejet d’un fichier invalide.
- Affichage sans débordement de page à 360, 393, 768 et 1440 pixels, dans les cinq modes ; manche défilable séparément.
- Absence d’erreur JavaScript pendant le parcours.
- Installation du service worker, remplissage du cache et réouverture hors connexion.

## Limites

Aucun test physique réalisé sur le POCO F7 Ultra : confirmer le libellé d’installation Chrome, l’icône adaptative, le lancement autonome, le tactile et la réouverture en mode avion. Les écrans de test sont simulés, pas des appareils physiques. La migration depuis un ancien domaine ou content:// nécessite un fichier JSON exporté. Aucun progrès réel de l’utilisateur n’a été importé ni publié.

## Régressions corrigées lors de la validation

Chemin des icônes ; effacement des acquis au changement ou à la réinitialisation d’accordage ; rechargement concurrent à la première prise de contrôle par le service worker.

La simulation de mise à jour passe également : détection de la version suivante, activation demandée par le joueur, suppression de l’ancien cache, conservation des données locales et redémarrage hors connexion.

Bilan local : 14 groupes de tests réussis. Contrôle d’installabilité de Chrome sans erreur dans un profil de test normal ; dimensions et accès des trois icônes PNG vérifiés.
