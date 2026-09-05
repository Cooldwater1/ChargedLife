import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('public', { recursive: true });

const result = spawnSync('npm', ['run', 'build'], {
  encoding: 'utf8',
  env: process.env,
  maxBuffer: 20 * 1024 * 1024,
});

const log = [
  '=== ChargedLife Vercel diagnostic build ===',
  `exitCode: ${result.status ?? 'null'}`,
  '',
  '=== STDOUT ===',
  result.stdout ?? '',
  '',
  '=== STDERR ===',
  result.stderr ?? '',
  '',
  result.error ? `=== SPAWN ERROR ===\n${String(result.error.stack ?? result.error)}` : '',
].join('\n');

writeFileSync('public/build-log.txt', log, 'utf8');
writeFileSync(
  'public/index.html',
  '<!doctype html><html><body><h1>ChargedLife build diagnostic</h1><p><a href="/build-log.txt">Open build log</a></p></body></html>',
  'utf8',
);

// Always succeed so Vercel publishes the captured compiler output.
process.exit(0);
