# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of self-contained browser tools hosted on GitHub Pages (https://dotknewt.github.io/tools/) that can also be opened locally. The root `index.html` is a hub that links to each tool by directory.

## No build system

There is no npm, no bundler, no transpiler, no test suite. Every tool is a single `index.html` file with inline CSS and JS. There is nothing to install or compile.

## Running locally

Most tools work by opening the HTML file directly in a browser (`file://`). The exception is **name-generator**, which uses `fetch()` to load the JSON wordlists — browsers block `fetch()` on `file://` URLs, so it needs an HTTP server:

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploying

Push to `main`. GitHub Pages auto-deploys from the repo root — no Actions workflow or manual step needed.

## Adding a new tool

1. Create a directory: `<tool-name>/index.html`
2. Add a card to the root `index.html` grid section (copy an existing `<a class="card" ...>` block)
3. Match the shared design system (see below)

## Design system

All tools share a consistent dark-theme palette defined as CSS custom properties. Copy the `:root` block from `index.html` as a starting point for a new tool.

| Variable | Purpose |
|---|---|
| `--bg` / `--surface` / `--surface-2` / `--surface-3` | Layered dark backgrounds |
| `--text` / `--text-muted` / `--text-dim` | Three text weights |
| `--border` / `--border-strong` | Subtle borders |
| `--amber` `#f6ad55` | Amber — warnings / highlights |

CTI-specific vertex colors (`--adversary`, `--capability`, `--infrastructure`, `--victim`) are defined in `diamond-model/` and the hub; only include them in tools that render Diamond Model content.

Fonts loaded from Google Fonts: **IBM Plex Sans** (body) and **JetBrains Mono** (labels, tags, code). The hub and diamond-model use these; the name-generator uses Orbitron + Share Tech Mono for its terminal aesthetic.

## Existing tools

### `diamond-model/`
CTI Diamond Model renderer (~2600 lines). Accepts a JSON object or array of event objects, renders an interactive SVG diamond with Kill Chain phase navigation. Supports a graphical edit form that syncs bidirectionally with the raw JSON editor. Key JS globals: `currentEvents`, `currentIndex`, `selectedVertex`, `editMode`. Export targets: SVG (via DOM clone) and JSON copy.

### `mind-map/`
Full SVG canvas mind-mapping tool. State lives in a single object `S` (`nodes`, `edges`, `sel`, `tool`, `pan`, `zoom`). Nodes are rendered as SVG `<rect>`/`<ellipse>`/`<polygon>` elements with a text overlay; edges support straight, curved, and mind-map "branch" Bezier styles. Undo/redo via JSON snapshots in a `history` array. Export: SVG and JSON.

### `name-generator/`
Codename generator for CTI incident names and threat actor names. Fetches three flat JSON wordlist arrays at startup (`adjectives.json`, `entities.json`, `events.json` from `./wordlists/`). Generation logic is in `buildName()` with exclusion filtering via `isExcluded()`. To extend vocabulary, edit the wordlist JSON files directly — they are flat string arrays.

### `generate-ubuntu-autoinstall/`
Ubuntu autoinstall.yaml generator. Form-to-YAML tool covering identity, locale, storage layout presets (direct/LVM/ZFS with optional disk targeting), SSH, packages, updates, and late commands. JSON schema reference at `generate-ubuntu-autoinstall/schema/ubuntu-autoinstall.json`. Password field expects a pre-hashed value (`openssl passwd -6`).

### `generate-debian-preseed/`
Debian preseed.cfg generator. Produces `d-i key type value` format covering locale, network, mirror, accounts, clock, partitioning (LVM/regular/encrypted), package selection, and bootloader. Opens directly from `file://` — no server needed.

### `generate-windows-unattend/`
Windows Autounattend.xml generator. Covers language/locale, disk partitioning (GPT/UEFI or MBR/BIOS), image install, user accounts, OOBE suppression, autologon, and first-logon commands. Produces well-formed XML with `urn:schemas-microsoft-com:unattend` namespace.

## Tool naming convention

Config/file generator tools use the prefix `generate-<name>/` (e.g. `generate-ubuntu-autoinstall/`). Visualizers and interactive tools use a plain descriptive name (e.g. `diamond-model/`, `mind-map/`).
