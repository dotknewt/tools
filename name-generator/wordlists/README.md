# CODENAME // GENERATOR

Static incident name and threat actor codename generator for GitHub Pages.

## Repo Structure

```
/
├── index.html
└── wordlists/
    ├── adjectives.json   ← descriptors for threat actor names
    ├── entities.json     ← mythological/fictional beings (shared pool)
    └── events.json       ← operational events for incident names
```

## Naming Formats

| Mode          | 2-word                        | 3-word                                  |
|---------------|-------------------------------|-----------------------------------------|
| Incident      | `[ENTITY] [EVENT]`            | `OPERATION [ENTITY] [EVENT]`            |
| Threat Actor  | `[ADJECTIVE] [ENTITY]`        | `[ADJECTIVE] [ADJECTIVE] [ENTITY]`      |

Examples:
- Incident (2): `BASILISK ECLIPSE`
- Incident (3): `OPERATION FENRIR SURGE`
- Threat Actor (2): `HOLLOW SPHINX`
- Threat Actor (3): `AMBER SILENT KITSUNE`

## Exclusion List

Enter words or phrases in the settings panel — one per line.
Matching is case-insensitive and partial (substring).

```
PHOENIX
SILENT WRAITH
KRAKEN
```

Any generated name containing an excluded term will be discarded and regenerated (up to 200 attempts).

## Extending Word Lists

Edit the JSON files directly. Each file is a flat JSON array of strings:

```json
["Word1", "Word2", "Word3"]
```

- `adjectives.json` — atmospheric/material descriptors
- `entities.json` — mythological creatures, folklore beings, fictional archetypes
- `events.json` — operational event vocabulary

## GitHub Pages Setup

1. Push repo to GitHub
2. Settings → Pages → Source: `main` branch, `/ (root)`
3. Done — the page fetches wordlists via relative paths from the same origin

## Keyboard Shortcut

Press **Enter** (outside the exclusion textarea) to generate a new name.
