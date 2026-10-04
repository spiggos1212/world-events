# World Events

Διαδραστικός παγκόσμιος χάρτης με timeline που παίζει (Play/Pause, ταχύτητα, loop).
Στόχος: να εμφανίζονται πάνω στον χάρτη παγκόσμια events (πόλεμοι κ.λπ.) καθώς εξελίσσεται το timeline.

## Τοπική εκτέλεση

Στατική σελίδα, δεν χρειάζεται build:

```
npx serve .
```

ή άνοιξε απλώς το `index.html`.

## Δομή

- `index.html` – layout (χάρτης + μπάρα timeline)
- `styles.css` – στυλ
- `app.js` – χάρτης (d3 + world-atlas), timeline, Play/ταχύτητα, events layer
- `events.js` – τα δεδομένα των events (`window.WORLD_EVENTS`), προς συμπλήρωση

## Deploy (Cloudflare Pages)

```
npm run deploy
```
