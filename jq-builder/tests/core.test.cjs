const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const test = require('node:test');

const page = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const source = page.match(/<script id="jq-core">([\s\S]*?)<\/script>/)[1];
const context = { console, TextEncoder, TextDecoder };
vm.runInNewContext(source, context, { filename: 'jq-core.js' });
const { JQCore } = context;

function jq(text, filter) {
  const result = spawnSync('jq', ['-n', '-c', filter], { input: text, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trimEnd().split('\n').filter(Boolean).map((line) => JSON.parse(line));
}

function jqError(text, filter) {
  const result = spawnSync('jq', ['-n', '-c', filter], { input: text, encoding: 'utf8' });
  assert.notEqual(result.status, 0, 'expected jq to reject the generated filter/input');
  return result.stderr;
}

function runCompiled(text, compiled) {
  return jq(text, JQCore.effectiveFilter(compiled.filter, false));
}

function assertInputError(fn, line) {
  assert.throws(fn, (error) => error && error.code === 'INVALID_INPUT' && (!line || error.line === line));
}

test('normalizes JSONC without changing number lexemes', () => {
  const result = JQCore.normalizeInput('{"url":"https://x//y",/*c*/"n":9007199254740993,}', 'jsonc');
  assert.equal(result.text, '{"url":"https://x//y",     "n":9007199254740993}');
  assert.equal(result.samples[0].n, 9007199254740992);
  assert.match(result.text, /9007199254740993/);
  assertInputError(() => JQCore.normalizeInput('1/*comment*/2', 'jsonc'));
  assertInputError(() => JQCore.normalizeInput('t/*comment*/rue', 'jsonc'));
  assertInputError(() => JQCore.normalizeInput('[,]', 'jsonc'));
  assertInputError(() => JQCore.normalizeInput('{,}', 'jsonc'));
  assertInputError(() => JQCore.normalizeInput('{"a":,}', 'jsonc'));
  assert.equal(JQCore.normalizeInput('{"a":1, /* comment */}', 'jsonc').samples[0].a, 1);
});

test('reports malformed JSONL line and accepts blank lines', () => {
  const result = JQCore.normalizeInput('1\n\n2\n', 'jsonl');
  assert.equal(result.text, '1\n2');
  assert.deepEqual(JSON.parse(JSON.stringify(result.samples)), [1, 2]);
  assertInputError(() => JQCore.normalizeInput('1\n2\n{\n', 'jsonl'), 3);
});

test('JSON mode rejects trailing garbage', () => {
  assertInputError(() => JQCore.normalizeInput('{"a":1} trailing', 'json'));
});

test('suggestPaths returns bounded literal paths with numeric indices', () => {
  const result = JQCore.suggestPaths([{ 'a.b': { ['__proto__']: 'safe' }, list: [null] }]);
  const paths = JSON.parse(JSON.stringify(result.paths));
  assert.deepEqual(paths, [['a.b'], ['a.b', '__proto__'], ['list'], ['list', 0]]);
  assert.equal(result.truncated, false);
});

test('structured paths are literal and indices stay numeric', () => {
  const builder = {
    source: { kind: 'root', path: [] },
    condition: { kind: 'leaf', path: ['a.b'], op: 'eq', value: 'yes' },
    steps: [],
    projection: [
      { path: ['"'], name: 'quote' },
      { path: ['__proto__'], name: 'proto' },
      { path: [0], name: 'zero' },
      { path: [''], name: 'empty' }
    ]
  };
  const compiled = JQCore.compileBuilder(builder);
  assert.ok(compiled.filter.includes('["a.b"]'));
  assert.ok(compiled.filter.includes('["\\\""]'));
  assert.ok(compiled.filter.includes('["__proto__"]'));
  assert.ok(compiled.filter.includes('[0]'));
  assert.deepEqual(runCompiled('{"a.b":"yes","\\\"":1,"__proto__":2,"0":"wrong","x":[9]}', compiled), [
    { quote: 1, proto: 2, zero: null, empty: null }
  ]);
});

test('present null differs from missing and numeric comparisons reject wrong types', () => {
  const presentNull = JQCore.compileBuilder({
    source: { kind: 'root', path: [] },
    condition: { kind: 'leaf', path: ['a'], op: 'null' }, steps: [], projection: null
  }).filter;
  assert.deepEqual(runCompiled('{"a":null}\n{}', { filter: presentNull }), [{ a: null }]);

  const missing = JQCore.compileBuilder({
    source: { kind: 'root', path: [] },
    condition: { kind: 'leaf', path: ['a'], op: 'missing' }, steps: [], projection: null
  }).filter;
  assert.deepEqual(runCompiled('{"a":null}\n{}', { filter: missing }), [{}]);

  const greater = JQCore.compileBuilder({
    source: { kind: 'root', path: [] },
    condition: { kind: 'leaf', path: ['a'], op: 'gt', value: 2 }, steps: [], projection: null
  }).filter;
  assert.deepEqual(runCompiled('{"a":"9"}\n{"a":null}\n{"a":3}', { filter: greater }), [{ a: 3 }]);
});

test('ordering accepts same-type strings and ne rejects incompatible types', () => {
  const less = JQCore.compileBuilder({
    source: { kind: 'root', path: [] },
    condition: { kind: 'leaf', path: ['a'], op: 'lt', value: 'm' }, steps: [], projection: null
  });
  assert.deepEqual(runCompiled('{"a":"a"}\n{"a":"z"}\n{"a":1}', less), [{ a: 'a' }]);
  const notEqual = JQCore.compileBuilder({
    source: { kind: 'root', path: [] },
    condition: { kind: 'leaf', path: ['a'], op: 'ne', value: 2 }, steps: [], projection: null
  });
  assert.deepEqual(runCompiled('{"a":"x"}\n{"a":1}\n{"a":2}', notEqual), [{ a: 1 }]);
});

test('empty any is false, empty all is true, and non-arrays do not match', () => {
  const make = (op) => JQCore.compileBuilder({
    source: { kind: 'root', path: [] },
    condition: { kind: 'leaf', path: ['items'], op, child: { kind: 'leaf', path: [], op: 'eq', value: 1 } },
    steps: [], projection: null
  }).filter;
  assert.deepEqual(runCompiled('{"items":[]}\n{"items":[1,2]}\n{"items":1}', { filter: make('any') }), [{ items: [1, 2] }]);
  assert.deepEqual(runCompiled('{"items":[]}\n{"items":[1,2]}\n{"items":1}', { filter: make('all') }), [{ items: [] }]);
});

test('nested AND OR NOT filters mixed records and retains regex checks', () => {
  const compiled = JQCore.compileBuilder({
    source: { kind: 'root', path: [] },
    condition: {
      kind: 'group', op: 'and', children: [
        { kind: 'group', op: 'or', children: [
          { kind: 'leaf', path: ['kind'], op: 'eq', value: 'a' },
          { kind: 'leaf', path: ['kind'], op: 'eq', value: 'b' }
        ] },
        { kind: 'group', op: 'not', children: [{ kind: 'leaf', path: ['name'], op: 'regex', value: '^no', flags: 'i' }] }
      ]
    }, steps: [], projection: null
  });
  assert.deepEqual(runCompiled('{"kind":"a","name":"yes"}\n{"kind":"b","name":"nope"}\n{"kind":"c","name":"yes"}', compiled), [{ kind: 'a', name: 'yes' }]);
  assert.deepEqual(JSON.parse(JSON.stringify(compiled.regexChecks)), [{ pattern: '^no', flags: 'i' }]);
});

test('capture update preserves zero, replaces one, and collects many', () => {
  const compile = (pattern, flags) => JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] },
    steps: [{ op: 'capture', path: ['text'], mode: 'update', pattern, flags }], projection: null
  }).filter;
  assert.deepEqual(runCompiled('{"id":1,"text":"zzz"}', { filter: compile('(?<x>a)', '') }), [{ id: 1, text: 'zzz' }]);
  assert.deepEqual(runCompiled('{"id":1,"text":"a"}', { filter: compile('(?<x>a)', '') }), [{ id: 1, text: { x: 'a' } }]);
  assert.deepEqual(runCompiled('{"id":1,"text":"aba"}', { filter: compile('(?<x>a)', 'g') }), [{ id: 1, text: [{ x: 'a' }, { x: 'a' }] }]);
});

test('emitted native values feed subsequent steps and projection is validated', () => {
  const emitted = JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] },
    steps: [
      { op: 'capture', path: ['text'], mode: 'emit', pattern: '(?<x>a)', flags: '' },
      { op: 'sub', path: ['x'], mode: 'update', pattern: 'a', flags: '', replacement: 'z' }
    ], projection: null
  });
  assert.deepEqual(runCompiled('{"text":"a"}', emitted), [{ x: 'z' }]);
  assert.throws(() => JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] }, steps: [],
    projection: [{ path: ['a'], name: 'x' }, { path: ['b'], name: 'x' }]
  }), /duplicate projection alias/);
  const projected = JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] }, steps: [],
    projection: [{ path: ['missing'], name: 'x' }]
  });
  assert.deepEqual(runCompiled('{}', projected), [{ x: null }]);
});

test('invalid transformation targets error while valid zero-match strings retain emit/update semantics', () => {
  for (const mode of ['emit', 'update']) {
    const invalid = JQCore.compileBuilder({
      source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] },
      steps: [{ op: 'capture', path: [], mode, pattern: '(?<x>a)', flags: '' }], projection: null
    });
    for (const input of ['null', '5', '{}']) {
      assert.match(jqError(input, JQCore.effectiveFilter(invalid.filter, false)), /transformation target must be a string/);
    }
  }
  const emitNoMatch = JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] },
    steps: [{ op: 'capture', path: [], mode: 'emit', pattern: '(?<x>a)', flags: '' }], projection: null
  });
  assert.deepEqual(runCompiled('"zzz"', emitNoMatch), []);
  const updateNoMatch = JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] },
    steps: [{ op: 'capture', path: [], mode: 'update', pattern: '(?<x>a)', flags: '' }], projection: null
  });
  assert.deepEqual(runCompiled('"zzz"', updateNoMatch), ['zzz']);
});

test('effective collection wraps the stream once and JSONL collection is one array', () => {
  assert.equal(JQCore.effectiveFilter('.', false), 'inputs | (.)');
  assert.equal(JQCore.effectiveFilter('.', true), '[inputs | (.)]');
  const normalized = JQCore.normalizeInput('1\n2', 'jsonl');
  assert.deepEqual(jq(normalized.text, JQCore.effectiveFilter('.', true)), [[1, 2]]);
});

test('replacement grammar only interpolates named captures and escapes literals', () => {
  const compiled = JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] },
    steps: [{ op: 'sub', path: [], mode: 'emit', pattern: '(?<x>a)', flags: '', replacement: '\\(.x)-\\\\(.x)' }], projection: null
  });
  assert.deepEqual(runCompiled('"a"', compiled), ['a-\\(.x)']);
  assert.throws(() => JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] },
    steps: [{ op: 'sub', path: [], mode: 'emit', pattern: '(?<x>a)', flags: '', replacement: '\\(.x + 1)' }], projection: null
  }), /replacement interpolation/);
  assert.throws(() => JQCore.compileBuilder({
    source: { kind: 'root', path: [] }, condition: { kind: 'group', op: 'and', children: [] },
    steps: [{ op: 'sub', path: [], mode: 'emit', pattern: '(?<x>a)', flags: '', replacement: '{{x}}' }], projection: null
  }), /jq-style/);
});
