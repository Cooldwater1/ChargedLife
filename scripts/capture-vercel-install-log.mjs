import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('public', { recursive: true });

function run(command, args) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
}

const ci = run('npm', ['ci']);
let fallback = null;

// If npm ci fails, also test npm install so the diagnostic deployment can
// continue far enough to capture the Next.js build error if dependencies are recoverable.
if (ci.status !== 0) {
  fallback = run('npm', ['install']);
}

const format = (name, result) => {
  if (!result) return `${name}: not run`;
  return [
    `=== ${name} ===`,
    `exitCode: ${result.status ?? 'null'}`,
    '',
    '--- STDOUT ---',
    result.stdout ?? '',
    '',
    '--- STDERR ---',
    result.stderr ?? '',
    '',
    result.error ? `--- SPAWN ERROR ---\n${String(result.error.stack ?? result.error)}` : '',
  ].join('\n');
};

writeFileSync(
  'public/install-log.txt',
  `${format('npm ci', ci)}\n\n${format('npm install fallback', fallback)}\n`,
  'utf8',
);

// Always return success so Vercel proceeds to our diagnostic build command.
process.exit(0);
