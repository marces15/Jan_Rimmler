# Pixel-Date-Ueberraschung

Eine lokale, romantische Pixel-Art-Webseite aus HTML, CSS und Vanilla JavaScript.

## Texte anpassen

Oeffne `script.js` und passe oben im `CONFIG`-Block die Werte an:

- `name`: Name deines Freundes
- `question`: deine persoenliche Frage
- `finalMessage`: deine Abschlussnachricht
- `options`: die Date-Auswahlmoeglichkeiten
- `photoPath`: Pfad zu einem optionalen Foto

Beispiel:

```js
const CONFIG = {
  name: "Alex",
  question: "Moechtest du mit mir am Samstag ein besonderes Date machen?",
  finalMessage: "Ich freue mich auf dich.",
  options: ["Kino", "Picknick", "Restaurant", "Spieleabend", "Ueberrasch mich"],
  photoPath: "assets/photo.jpg"
};
```

## Eigenes Foto einfuegen

Lege dein Foto in den Ordner `assets` und nenne es zum Beispiel `photo.jpg`.
Wenn du einen anderen Dateinamen verwendest, aendere `photoPath` in `script.js`,
zum Beispiel:

```js
photoPath: "assets/unser-foto.png"
```

Wenn kein Foto vorhanden ist, blendet die Webseite den Fotobereich automatisch aus.

## Lokal testen

Du kannst die Seite direkt durch Doppelklick auf `index.html` im Browser oeffnen.

Optional kannst du im Projektordner auch einen kleinen lokalen Server starten:

```bash
python3 -m http.server 8080
```

Danach oeffnest du:

```text
http://localhost:8080
```

## Kostenlos veroeffentlichen

### GitHub Pages

1. Erstelle ein neues GitHub-Repository.
2. Lade `index.html`, `styles.css`, `script.js`, `README.md` und den Ordner `assets` hoch.
3. Oeffne in GitHub `Settings` -> `Pages`.
4. Waehle als Quelle den Branch `main` und den Root-Ordner aus.
5. Nach kurzer Zeit zeigt GitHub dir die oeffentliche URL an.

### Cloudflare Pages

1. Erstelle ein kostenloses Cloudflare-Konto.
2. Oeffne `Workers & Pages` -> `Create` -> `Pages`.
3. Verbinde dein GitHub-Repository.
4. Verwende keine Build-Einstellung, weil die Seite statisch ist.
5. Als Ausgabeordner reicht der Root-Ordner des Projekts.
