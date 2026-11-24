# Browser tools

- Before creating or locating a design, spec, implementation plan, or handoff, read `~/Projects/instructions/document-placement.instructions.md`.

The [hub](index.html) is the catalog. Start there to find a tool rather than
maintaining a second list of tools or JavaScript internals here. Paths and
commands below are relative to the repository root.

## Add or change a tool

- Prefer a self-contained `<name>/index.html` with inline CSS and JavaScript
  and no build step. Use `generate-<name>` for configuration/file generators;
  use a descriptive name for other tools.
- Add a card to the correct hub category and update its count. Use the hub's
  `:root` palette, typography and return link as the starting point. Reserve
  Diamond Model vertex colors for tools that render that model.
- Keep local input local. Document any asset or network requirement rather
  than promising offline operation. For `jq-builder/`, read its
  [runtime and verification guide](jq-builder/README.md) before editing the
  worker, vendored assets, or tests.

## Verify

Open the changed tool and follow its hub link. Exercise a normal input and a
failure or boundary case. Most tools support `file://`; `name-generator/`
fetches wordlists and `jq-builder/` loads worker/WASM assets over HTTP. To
preview these, serve the checkout on loopback:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

For jq-builder, run its documented Node and browser checks; wait for the
browser harness's final result. A page load alone is not a pass. Record what
was exercised in the [PR checklist](.github/pull_request_template.md).
Local verification does not deploy to GitHub Pages; a push to `main` is a
separate release action.

For issue work read [issue tracking](docs/agents/issue-tracker.md); for triage,
use the [five canonical labels](docs/agents/triage-labels.md). Before changing
domain terms or architecture, read [domain documentation](docs/agents/domain.md).
