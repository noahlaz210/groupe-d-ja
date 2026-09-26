# Groupe Déjà — site web

Refonte complète du site (contenu et design), en HTML/CSS/JS statique — aucune dépendance,
aucun serveur nécessaire pour l'héberger.

## Structure

- `content/*.json` — tout le contenu du site (textes, crédits, presse, agenda, archive
  actus...), repris intégralement depuis l'ancien site.
- `assets/images/`, `assets/documents/` — médias originaux réutilisés tels quels.
- `assets/css/style.css`, `assets/js/main.js` — design système et interactions.
- `build/generate.js` — génère toutes les pages HTML statiques à partir de `content/*.json`.
  C'est ce script qui construit notamment les ~220 pages de l'archive « Actus » et les
  fiches spectacles, pour garder un rendu cohérent sans dupliquer le HTML à la main.

## Régénérer le site

```
node build/generate.js
```

Les fichiers `index.html` sont réécrits à la racine et dans chaque dossier de page.
Pour ajouter une actu, un spectacle, une date d'agenda, etc. : éditer le fichier JSON
correspondant dans `content/`, puis relancer la commande ci-dessus.

## Aperçu local

```
python3 -m http.server 8080
```

puis ouvrir `http://localhost:8080/`.
