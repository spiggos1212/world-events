# World Events

Διαδραστικός παγκόσμιος χάρτης με timeline 1500–σήμερα που παίζει (Play/Pause, ταχύτητα, loop).
Καθώς τρέχει το timeline εμφανίζονται ~300 σημαντικά ιστορικά γεγονότα (πόλεμοι, επαναστάσεις, εξερευνήσεις, επιστήμη, καταστροφές) με εικονίδια, βέλη κίνησης και επεξηγηματικές ετικέτες.

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
- `public/events.js` – τα δεδομένα των γεγονότων (`window.WORLD_EVENTS`). Κάθε γραμμή: id, έναρξη, λήξη, τύπος, lat, lng, τίτλος, περιγραφή, προαιρετική αφετηρία βέλους

## Deploy (Cloudflare Workers, static assets)

```
npm run deploy
```
