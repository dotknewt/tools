# Vendored jq runtime

This directory contains the browser-required files from `jq-wasm` version
`3.0.0-jq-1.8.2`, which embeds jq `1.8.2` compiled to WebAssembly with
Emscripten. The worker imports `browser.mjs`; that module imports the adjacent
chunk and fetches `build/jq.wasm` from the same origin. No CDN or package
loader is needed at runtime.

## Acquisition and provenance

The package was acquired and inspected with these commands:

```text
npm pack jq-wasm@3.0.0-jq-1.8.2 --ignore-scripts
tar -xzf jq-wasm-3.0.0-jq-1.8.2.tgz
cp package/dist/browser.mjs jq-builder/vendor/browser.mjs
cp package/dist/chunk-OUKQZV2W.mjs jq-builder/vendor/chunk-OUKQZV2W.mjs
cp package/dist/build/jq.wasm jq-builder/vendor/build/jq.wasm
cp package/LICENSE jq-builder/vendor/jq-wasm.LICENSE
curl -fsSL https://raw.githubusercontent.com/jqlang/jq/jq-1.8.2/COPYING -o jq-builder/vendor/jq.COPYING
```

Package source and metadata:

- https://registry.npmjs.org/jq-wasm/-/jq-wasm-3.0.0-jq-1.8.2.tgz
- https://github.com/owenthereal/jq-wasm
- https://github.com/jqlang/jq/tree/jq-1.8.2
- package version: `3.0.0-jq-1.8.2`
- jq version reported by the package API: `jq-1.8.2`
- package license: MIT (`jq-wasm.LICENSE`)
- jq and bundled dependency notices: `jq.COPYING`
- npm tarball SHA-1: `16ee085545f83741930690e83e22978ba7720469`
- npm tarball SHA-256: `ef502068f5cb0ca5fd557550cc94a1aedf39143da89aea4182bcdf4640de9bd0`

## Vendored artifact hashes

The following hashes and byte sizes were measured after extraction:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `browser.mjs` | 499 | `7512b5315c38da9f68f6b069c25a5b0c4463d012e7617417b2c9638dc561489e` |
| `chunk-OUKQZV2W.mjs` | 128843 | `d63835e42a143dea377d6da2ac32a6749974aa735e3bda9a4577d6226d39a9b2` |
| `build/jq.wasm` | 928824 | `27d493c06601e9cbc7112ef4198ee71a0dc3e9c9a4a1754e73888841da6c450a` |
| `jq-wasm.LICENSE` | 1051 | `10669a50b3a2b70d2c8874bbfb76d447879ccde14baa5d224ec93871aca833c9` |
| `jq.COPYING` | 7887 | `ad2b4a266b2268939c1446979759706077421cf906a203aa188c6f396e8cfd74` |

## Actual API and adapter boundary

`loadJq()` is asynchronous. It is called once in the dedicated worker and
returns a synchronous handle. The worker uses `jq.raw(inputText, filter,
['-n', '-c'])`; the `-n` flag gives the requested null-input mode while jq's
`inputs` builtin consumes the supplied input text. The package's raw method
returns `{stdout, stderr, exitCode}` and trims leading and trailing whitespace
from both streams. The adapter therefore exposes compact output without a
trailing newline and counts complete output lines as values.

Regex checks are compiled by real jq before the requested filter runs. Invalid
patterns or flags return `status: "error"` with `error.stage: "regex"`, even
when the input stream is empty. jq filter failures return `error.stage:
"filter"`. Input limit failures return `error.stage: "input"`.

The browser smoke test in `../tests/runtime.html` verified `test`, `match`,
named `capture`, one-shot `sub`, all-match `gsub`, escaped Unicode,
replacement interpolation, flags, invalid regex reporting, multiple `inputs`,
empty input, and output-value truncation against this exact WASM artifact.

The package API is synchronous after initialization and fully buffers each
`raw` call. There is no incremental output callback or cancellation hook. The
worker applies output caps only after jq returns, so the caps bound the
reported result but do not provide a strict execution heap bound. Controller
timeout and cancellation terminate the worker; a later run creates a fresh
worker. These safeguards do not establish a strict execution heap bound.
