# WFRP 4e character sheet — Airtable Interface Extension

Block `blkl87wpQUxh5Ixf9`, base `appZOKVaWkqRS7FsL`. Data-layer design and decisions: `~/Claude apps/Warhammer/HANDOVER.md`.

## Code layout
| File | Role |
|---|---|
| `frontend/index.js` | `initializeBlock`, one `table` custom property per table (defaulted by exact name), record loading, character switcher, tabs, dialogs |
| `frontend/data.js` | `TABLES`, `FIELDS` map (French field names), `resolveFields`, `makeWriter` (permission-checked writes by field key), `useCharacterModel` |
| `frontend/context.js` | `SheetContext`: `{m, w, run, open, records, fields}` |
| `frontend/sheet.js` | Page 1 (identity, characteristics, skills, talents, ambitions), Page 2 (armour, weapons, possessions, wounds, conditions, corruption, spells, money), Journals |
| `frontend/actions.js` | Play bar (damage, Chance, Détermination, XP) and every dialog (advance, gain XP, money, item, condition, crit, spell) |
| `frontend/ui.js` | Presentational pieces, setup banner |

## Conventions
- All derived values come from Airtable formulas/rollups; the UI never recomputes them.
- Writes go through `w.create/update/remove(tableKey, …, {fieldKey: value})` inside `run(...)`, which shows errors in a banner.
- Buying an advance creates the Journal XP row first as a draft so Airtable computes `Coût suggéré`; confirm then bumps Aug / Nbre pris, cancel deletes the draft (and any new skill/talent row it created).
- Colours come from CSS variables in `style.css` (light parchment / dark), so dark mode is automatic.
- UI text is in French.

## Environment gotchas
- Stop any running `block run` before `block release` (the release wipes `.tmp/`, and the dev server then fails with "Could not resolve …/.tmp/index.js").
- On 1 Oct 2026 a release reported success but the element still said "no releases yet"; a second `block release` from the user's terminal fixed it.
- The PAT must cover this base's workspace, otherwise release fails with `airtableApiBlockNotFound`.

## Working preferences
- Don't auto-restart `block run` after a release.
- Explain git/CLI steps in plain language.
