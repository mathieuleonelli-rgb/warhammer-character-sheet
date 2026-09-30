# warhammer-character-sheet

Character sheet for Warhammer Fantasy Roleplay 4e (French edition), as an Airtable Interface Extension.

It replaces the two-page PDF sheet for the whole party and the GM: pick a character, read the sheet, and handle play-time actions (damage and healing, Chance and Détermination, XP gains and advances, conditions, critical wounds, inventory, money). Every derived value is computed by Airtable formulas and rollups; the extension reads them and writes only inputs and journal rows.

- **Base:** `appZOKVaWkqRS7FsL` (tables: Personnages, Compétences du personnage, Talents du personnage, Inventaire, États actifs, Blessures critiques, Journal XP, Journal financier, plus the catalogs Compétences, Talents, Équipement, États, Sorts et Prières, Groupes)
- **Extension (block) ID:** in `.block/remote.json`

## Code layout

| File | What it does |
|---|---|
| `frontend/index.js` | Entry point, one table picker per table, record loading, character switcher, tabs, dialogs |
| `frontend/data.js` | Field-name map (`FIELDS`), permission-checked writer, the character model |
| `frontend/context.js` | Shared context passed to every sheet component |
| `frontend/sheet.js` | Page 1 (identity, characteristics, skills, talents, ambitions), page 2 (armour, weapons, possessions, wounds, conditions, corruption, spells, money), journals |
| `frontend/actions.js` | Play bar and the action dialogs (advance, gain XP, money, item, condition, critical wound, spell) |
| `frontend/combat.js` | Combat mode for phones: the ⚔ button, its transition and the combat screen |
| `frontend/ui.js` | Shared components, portrait and the setup banner |

## First-time setup on a new machine

```bash
git clone https://github.com/mathieuleonelli-rgb/warhammer-character-sheet.git warhammer
cd warhammer
npm install
block set-api-key   # Airtable personal access token with block:manage scope
```

## Day-to-day workflow

1. `git pull` – get the latest version.
2. `block run` – start the dev server, then click **</> Develop** on the element in Interface Designer.
3. Edit code, check it live, run `npm run lint`.
4. Save a snapshot: `git add -A && git commit -m "What changed"` then `git push`.
5. `echo "What changed" | block release` – publish to Airtable (this stops `block run`).

## Interface Designer setup

The extension only sees fields that are made visible in the element's data settings, and
"open record" actions need record details enabled per table. Fields the extension writes
(damage, Chance, Détermination, Aug, Nbre pris, journal rows, inventory…) must be editable.
A yellow banner in the extension lists anything that's missing.
