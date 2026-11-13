import { loadJq } from './vendor/browser.mjs';

const DEFAULT_LIMITS = {
  inputBytes: 5242880,
  outputBytes: 1048576,
  outputValues: 1000
};
const MAX_ERROR_BYTES = 4096;
const textEncoder = new TextEncoder();
const jqReady = loadJq();
let queue = Promise.resolve();

function reply(request, result) {
  self.postMessage({
    type: 'result',
    id: request.id,
    revision: request.revision,
    ...result
  });
}

function errorResult(stage, message, outputText = '', valueCount = 0) {
  const bytes = textEncoder.encode(String(message).trim());
  let boundedMessage = '';
  for (let end = Math.min(MAX_ERROR_BYTES, bytes.length); end >= 0; end -= 1) {
    try {
      boundedMessage = new TextDecoder('utf-8', { fatal: true }).decode(bytes.slice(0, end));
      break;
    } catch (error) {
      // A UTF-8 character may straddle the diagnostic byte boundary.
    }
  }
  return { status: 'error', outputText, valueCount, error: { stage, message: boundedMessage } };
}

function validLimit(value) {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

function resolveLimits(requestLimits) {
  if (requestLimits !== undefined && (requestLimits === null || typeof requestLimits !== 'object' || Array.isArray(requestLimits))) {
    return { error: 'limits must be an object' };
  }
  const limits = { ...DEFAULT_LIMITS, ...(requestLimits || {}) };
  for (const name of ['inputBytes', 'outputBytes', 'outputValues']) {
    if (!validLimit(limits[name])) return { error: `${name} must be a finite nonnegative integer` };
  }
  return { limits };
}

function limitValues(outputText, outputBytes, outputValues) {
  const lines = outputText === '' ? [] : outputText.split('\n');
  const kept = [];
  let bytes = 0;
  let truncated = false;
  for (const line of lines) {
    const lineBytes = textEncoder.encode(line).byteLength;
    const separatorBytes = kept.length === 0 ? 0 : 1;
    if (kept.length >= outputValues || bytes + separatorBytes + lineBytes > outputBytes) {
      truncated = true;
      break;
    }
    kept.push(line);
    bytes += separatorBytes + lineBytes;
  }
  if (kept.length !== lines.length) truncated = true;
  return {
    outputText: kept.join('\n'),
    valueCount: kept.length,
    status: truncated ? 'truncated' : 'ok'
  };
}

function regexQuery(pattern, flags) {
  return `"" | test(${JSON.stringify(pattern)}; ${JSON.stringify(flags)})`;
}

async function handle(request) {
  if (!request || request.type !== 'run') return;
  const resolved = resolveLimits(request.limits);
  if (resolved.error) {
    reply(request, errorResult('limits', resolved.error));
    return;
  }
  const limits = resolved.limits;
  if (typeof request.input !== 'string') {
    reply(request, errorResult('input', 'input must be normalized JSON stream text'));
    return;
  }
  if (textEncoder.encode(request.input).byteLength > limits.inputBytes) {
    reply(request, errorResult('input', `input exceeds ${limits.inputBytes} bytes`));
    return;
  }
  if (typeof request.filter !== 'string') {
    reply(request, errorResult('filter', 'filter must be a string'));
    return;
  }
  if (!Array.isArray(request.regexChecks)) {
    reply(request, errorResult('regex', 'regexChecks must be an array'));
    return;
  }

  const jq = await jqReady;
  for (const check of request.regexChecks) {
    if (!check || typeof check.pattern !== 'string' || typeof check.flags !== 'string') {
      reply(request, errorResult('regex', 'regex checks require string pattern and flags'));
      return;
    }
    const checked = jq.raw('', regexQuery(check.pattern, check.flags), ['-n', '-c']);
    if (checked.exitCode !== 0) {
      const message = (checked.stderr || checked.stdout || 'invalid regular expression').trim();
      reply(request, errorResult('regex', message));
      return;
    }
  }

  const result = jq.raw(request.input, request.filter, ['-n', '-c']);
  if (result.exitCode !== 0) {
    const message = (result.stderr || result.stdout || 'jq execution failed').trim();
    const preview = limitValues(result.stdout || '', limits.outputBytes, limits.outputValues);
    reply(request, errorResult('filter', message, preview.outputText, preview.valueCount));
    return;
  }
  reply(request, limitValues(result.stdout, limits.outputBytes, limits.outputValues));
}

function process(request) {
  queue = queue.then(async () => {
    try {
      await handle(request);
    } catch (error) {
      reply(request, errorResult('runtime', error instanceof Error ? error.message : String(error)));
    }
  });
}

self.onmessage = (event) => process(event.data);
