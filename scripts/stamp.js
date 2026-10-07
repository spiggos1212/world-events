// Σφραγίδα έκδοσης στα τοπικά αρχεία του index.html (styles.css, *.js) ώστε οι browsers
// να μη σερβίρουν παλιές cached εκδόσεις μετά από deploy. Τρέχει αυτόματα από `npm run deploy`.
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "public", "index.html");
const v = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12); // π.χ. 202610071530
let html = fs.readFileSync(file, "utf8");
let n = 0;
html = html.replace(/((?:src|href)=")((?!https?:|\/\/)[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"/g, (_, pre, p) => { n++; return pre + p + "?v=" + v + '"'; });
fs.writeFileSync(file, html);
console.log("stamped " + n + " assets with v=" + v);
