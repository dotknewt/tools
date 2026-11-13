# jq Builder

A guided filter builder with genuine jq execution in your browser. Paste or
load sample data, select records, compose conditions and regex transformations,
and copy the filter for use in a terminal.

## Run locally

From the repository root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/jq-builder/`. GitHub Pages also serves the tool.
Opening the page directly with `file://` is not supported. No application
build or package installation is required. Execution assets are bundled;
Google Fonts are optional and have local fallbacks.

## Input and filters

- **JSON:** one complete JSON value.
- **JSONC:** JSON with comments and trailing commas. Conversion preserves
  strings and numeric text; comments are replaced with whitespace.
- **JSONL:** one strict JSON value per nonblank line. Each value is an input
  to jq. Parse errors identify the source line.

Choose the root value or items from an array path. Paths use JSON arrays:
`["members", 0, "name"]`. String keys and numeric indices are distinct;
quoted, dotted, empty, and prototype-like keys are data, not code.
Suggestions are bounded and based on the current sample, not a schema.

Compose nested AND, OR, and NOT groups, typed comparisons, missing/null/type
checks, and array any/all predicates. Ordinary conditions treat absent fields
or incompatible types as non-matches. A present null is distinct from a missing
key. NOT negates the predicate normally. For empty arrays, any is false and all
is true; non-array targets match neither.

Regex operations use jq's Oniguruma syntax, not JavaScript regex syntax.
Selection runs before ordered transformations, followed by output projection.
Each transformation consumes the preceding step's result. Invalid transformation
target types are errors rather than silently skipped records.

- `match` returns match objects; `capture` returns named capture objects.
- Extraction emits jq's native zero, one, or multiple results.
- A match/capture field update preserves the field on zero matches, replaces
  it for one match, and stores an array for multiple matches. It does not
  duplicate the surrounding record.
- `sub` and `gsub` replace the selected string once or globally. Builder
  replacement text is literal except safe named-capture interpolation such as
  `\(.name)` or `\(.["name"])`. Arbitrary replacement expressions belong in
  custom jq mode.

Builder and custom jq modes retain separate state. Copying a generated filter
into custom mode asks before replacing existing custom text. There is no
arbitrary jq-to-builder reverse parser. Replacing sample data keeps conditions
and warns about paths not found in suggestions.

## Execution and results

Run is explicit. Cancel and timeout terminate the dedicated worker. Editing
input or settings makes previous results stale; old replies cannot become
current results. Errors, incomplete output, and truncation are visibly marked.

Defaults:

- Input: 5 MiB of UTF-8 text.
- Execution: 5 seconds, including worker startup.
- Preview: 1 MiB or 1,000 output values, whichever comes first.

The runtime buffers output before applying preview caps. These are not strict
heap limits: a costly query can consume substantial browser memory before it
finishes or is stopped. Do not treat the tool as a resource sandbox.

Streaming output is newline-delimited JSON (`.jsonl`), even when the input was
one JSON document. Collecting output produces one array (`.json`) across all
input values, not a separate array per JSONL line. The array is one jq output
value and remains subject to the byte cap. Only current, complete results may
be copied or downloaded as complete output.

Copied filters include the selected stream/collection wrapper. Copied POSIX
commands use `jq -n -c` and a quoted `input.json` placeholder, with exact filter
quoting. Replace the placeholder with your file. Standard jq does not read
JSONC: download normalized strict JSON before using that command.

## Recipes and privacy

Processing stays in the browser; input is not uploaded or automatically saved.
No localStorage, IndexedDB, analytics, or external processing service is used.
Optional font requests do not contain your input. Reloading loses unsaved work.

Version 1 recipes contain builder settings, custom jq, active mode, format,
and output collection preference. Input inclusion is unchecked by default.
Recipes can still contain sensitive filter literals; inspect before sharing.

Explicit input inclusion exports the visible raw draft, including malformed
drafts within the input limit. Oversized drafts cannot be included. Input-free
imports preserve the current raw input but apply the recipe's format. Invalid
recipes do not partly replace state. Valid imports update the whole interface
and invalidate previous results. Recipe size and nesting limits prevent
unbounded structured imports; the encoded file limit is 32 MiB to allow JSON
escaping of input text.

## Runtime and licenses

The pinned runtime is `jq-wasm` `3.0.0-jq-1.8.2`, embedding jq 1.8.2.
See [vendor/README.md](vendor/README.md) for source URLs, acquisition commands,
asset checksums/sizes, API details, and license notices. Upstream assets and
legal notices are preserved verbatim.

## Verification

Native compiler/serialization checks require Node and jq 1.8.2:

```sh
node --test jq-builder/tests/core.test.cjs
```

With the HTTP server running, open both pages in a browser:

- `http://127.0.0.1:8080/jq-builder/tests/runtime.html`
- `http://127.0.0.1:8080/jq-builder/tests/browser.html`

Wait for the final `PASS` or `FAIL` marker. The document sets
`data-test-complete="true"` when all asynchronous checks finish. A browser
process exiting successfully or an early DOM snapshot is not a passing test.
Avoid virtual-time acceleration for the worker integration suite; it can race
real worker startup and cause misleading timeouts.

The runtime harness checks the actual bundled WASM and generated-query parity.
The browser harness checks real controls, controller transitions, bounded
execution, intercepted export payloads, and recipe atomicity. Deterministic
fake-worker cases additionally test late replies, cancellation, recovery, and
the exact timeout. Export tests intercept downloads rather than writing data.

Full interaction evidence currently covers Chromium. Firefox has received
page-load and screenshot smoke checks; full Firefox interaction coverage is
not claimed. Local verification and commits do not establish deployment.
