# Julmat-checklist (GitHub Pages)

En superenkel statisk webbapp för jullunch: **lista per familj**, och två bockar per rätt: **handlad** och **lagad**.

✅ Ingen build behövs.  
✅ Funkar på **GitHub Pages**.  
✅ Bockar sparas i webbläsaren (localStorage).  
✅ Export/Import av status (om ni vill synka manuellt).

---

## Struktur

- `index.html` – UI
- `styles.css` – styling
- `app.js` – logik (status, filter, export/import)
- `data.json` – **din lista** (familjer + mat)

---

## Ändra listan

Öppna `data.json` och redigera:

```json
{
  "families": ["Erik + familj", "Familj A"],
  "items": [
    {"family":"Erik + familj","category":"Varmt","name":"Köttbullar"}
  ]
}
```

Tips: `name` + `family` + `category` används som ID. Om du byter namn på en rad kan tidigare bockar för den raden “försvinna” (vilket ofta är helt ok).

---

## Publicera på GitHub Pages

1. Skapa ett repo och lägg in filerna (root).
2. På GitHub: **Settings → Pages**
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` / `/ (root)`
4. Spara. Efter en stund får du en Pages-URL.

---

## Nollställning / backup

- **Nollställ bockar**: knapp i UI
- **Exportera status**: laddar ner `julmat-status.json`
- **Importera status**: välj filen igen på annan dator

---

## Licens

MIT (gör vad du vill).

Skapad 2025-12-18.
