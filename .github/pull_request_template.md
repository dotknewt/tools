# Summary

<!-- What does this PR do? One or two sentences. -->

## Type of change

- [ ] New tool (`<tool-name>/index.html`)
- [ ] Change to an existing tool
- [ ] Hub page (`index.html`)
- [ ] Documentation (`CLAUDE.md`, `README.md`, `state.md`, `TODO.md`)
- [ ] Other

## Testing

<!-- How was this verified? e.g. opened locally via file:// or `python3 -m http.server`,
     browsers checked, sample inputs exercised, edge cases tried. -->

## New-tool checklist

<!-- Delete this section if the PR doesn't add a tool. -->

- [ ] Single self-contained `index.html` — inline CSS/JS, no build step, no external dependencies beyond Google Fonts
- [ ] Works offline from `file://` (or the exception is documented, like name-generator's `fetch()`)
- [ ] Matches the shared design system (`:root` palette, IBM Plex Sans / JetBrains Mono, `← hub` header)
- [ ] Card added to the root `index.html` grid and the category count updated
- [ ] Tool entry added to `CLAUDE.md` and marked completed in `state.md`
- [ ] Follows the naming convention (`generate-<name>/` for config generators, plain descriptive name otherwise)
