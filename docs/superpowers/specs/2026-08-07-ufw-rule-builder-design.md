# ufw Rule Builder — Design

Date: 2026-08-07
Status: approved in brainstorming; to be committed to `docs/superpowers/specs/2026-08-07-ufw-rule-builder-design.md`

## Problem

Writing ufw firewall rules requires remembering two syntaxes (simple `ufw allow 22/tcp` vs full `ufw allow in on eth0 from 10.0.0.0/8 to any port 443 proto tcp`) and their constraints (port ranges require a protocol, comments need quoting, direction keywords interact with interfaces). Reading existing rules — from commands or `ufw status` output — requires the same knowledge in reverse.

## Solution

A new self-contained browser tool `ufw-rule-builder/` in dotknewt/tools, following repo conventions: single `index.html`, inline CSS/JS, no dependencies, works from `file://`, shared dark-theme design system, card added to the hub grid. Plain descriptive directory name (interactive tool, not a `generate-` config generator).

Two tabs:

### Build tab

Form → command. Fields:

- **Action:** allow / deny / reject / limit (segmented buttons)
- **Delete toggle:** prepends `delete `
- **Direction:** in (default) / out. Emitted only when required: `out` always, `in` when an interface is set or full syntax used with direction significance
- **Interface:** optional text input → `on <iface>`
- **From:** any (default) / IP / CIDR, plus optional source port
- **To:** any (default) / IP / CIDR, plus optional destination port(s): single (`80`), comma list (`80,443`), or range (`6000:6007`)
- **Protocol:** any / tcp / udp. Auto-forced to a concrete protocol when a preset demands it or when a port list/range is used (ufw requirement)
- **Comment:** optional → `comment '<text>'` (single quotes escaped)
- **Service presets:** dropdown pre-filling port/proto — SSH, HTTP, HTTPS, DNS, SMTP, SMTPS, IMAPS, NTP, WireGuard, OpenVPN, Samba, RDP, PostgreSQL, MySQL, mDNS

Output panel:
- Generated command with copy button
- Emits **simple syntax** (`ufw allow 22/tcp`) when only dest port/proto set; otherwise full syntax
- Live plain-English summary of the rule (shared `describeRule()`)
- IPv6 note: whether rule applies to IPv4, IPv6, or both (address family inferred from from/to values)
- Inline, non-blocking validation: invalid CIDR/IP, port out of 0–65535, port range/list without protocol, limit-rule notes. Output disabled while invalid.

Rule list (optional, no interaction required for single-rule use):
- "Add to list" appends current rule
- List renders as copyable multi-line command block
- Per-row remove and reorder (up/down)

### Explain tab

Single textarea; per-line auto-detection:

- **Command lines** — with or without `sudo` and/or leading `ufw` — parsed by `parseUfwCommand()` into a rule object, rendered as a card: action, direction, from/to, ports/proto, interface, comment, plain-English sentence, IPv6 note.
- **`ufw status` output** — plain, `numbered`, or `verbose`. Parses the To / Action / From table, `(v6)` markers, `[ n]` prefixes, comment suffixes (`# text`). Same rule cards; v6-only entries flagged.
- Headers/blank lines skipped. Unparseable lines produce a non-blocking warning card; other lines still render.

## Architecture

Single file, three core functions shared between modes:

- `parseUfwCommand(line)` → rule object `{action, delete, direction, iface, from, fromPort, to, toPort, proto, comment}`
- `parseStatusLine(line)` → same rule object shape
- `describeRule(rule)` → plain-English string + IPv6 applicability note

Build form serializes to the same rule object, then `renderCommand(rule)` produces the command string. This keeps builder output, live summary, and explainer consistent.

## Error handling

All validation inline and non-blocking. No network, no localStorage. Nothing blocks the page.

## Testing

No test framework exists in the repo. Manual verification matrix:
- Build: simple port rule, named preset, full syntax with from/to/iface, port range, port list, delete prefix, limit action, comment quoting
- Explain: each build output round-trips; real `ufw status`, `status numbered`, and `status verbose` samples parse correctly
- Open via `file://` to confirm no server needed

## Out of scope (YAGNI)

- App profiles (`ufw allow "OpenSSH"`), `route` forwarding rules, insert-position numbers, logging rules, default-policy commands — excluded per scope decision (full syntax, not full-plus)
- Persistence/sharing of rule lists
