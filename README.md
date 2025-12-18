# Julmat-lista (read-only, GitHub Pages)

Det här är en **statisk** webbapp som visar en lista på julmat uppdelat per familj.

- Ingen build behövs.
- Funkar på GitHub Pages.
- **Read-only**: inga bockar eller “reset”.

## Är du “fel” om GitHub Pages?

Du har rätt i att GitHub Pages inte kan spara något på servern (ingen databas).  
Men: en webbsida kan fortfarande spara lokalt i webbläsaren (t.ex. `localStorage`) — då sparas det **per dator/telefon** och delas inte automatiskt med andra.

Vill du ha bockar som delas mellan flera personer behöver du någon form av gemensam lagring:
t.ex. GitHub Issues/PR som “databas”, Google Sheets API, Firebase/Supabase, eller en minimal serverless-funktion.

## Ändra listan

Redigera `data.json`:

```json
{
  "families": ["Erik + familj", "Familj A"],
  "items": [
    {"family":"Erik + familj","category":"Varmt","name":"Köttbullar"}
  ]
}
```

## Publicera på GitHub Pages

1. Skapa repo och lägg filerna i root.
2. GitHub → Settings → Pages → Deploy from branch → `main` / root.

Skapad 2025-12-18.
