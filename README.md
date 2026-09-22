# EduTrack Formation V4

Version simple : base SQLite + administration + gestion des utilisateurs.

## Démarrage
```bash
npm install
npm start
```
Puis ouvrir http://localhost:3000

## Compte administrateur par défaut
Identifiant : `admin`
Mot de passe : `ChangeMoi123!`

Pour une utilisation réelle en ligne, changer ces valeurs avec les variables `EDUTRACK_ADMIN_USER` et `EDUTRACK_ADMIN_PASSWORD`.

Les comptes créés depuis l'administration peuvent avoir le rôle `Agent` ou `Responsable`. La gestion fine des accès à chaque formation viendra dans une étape séparée, afin de garder cette version simple.
