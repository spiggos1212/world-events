# World Events

Διαδραστικός παγκόσμιος χάρτης με timeline που παίζει (Play/Pause, ταχύτητα, loop).
Στόχος: να εμφανίζονται πάνω στον χάρτη παγκόσμια events (πόλεμοι κ.λπ.) καθώς εξελίσσεται το timeline.

## Τοπική εκτέλεση

Στατική σελίδα, δεν χρειάζεται build:

```
npm run start
```

ή άνοιξε απλώς το `public/index.html`.

## Δομή

- `public/index.html` – layout (χάρτης + μπάρα timeline)
- `public/styles.css` – στυλ
- `public/app.js` – χάρτης (d3 + world-atlas), timeline, Play/ταχύτητα, events layer
- `public/events.js` – τα δεδομένα των events (`window.WORLD_EVENTS`), προς συμπλήρωση

## Deploy (Cloudflare Workers, static assets)

```
npm run deploy
```
