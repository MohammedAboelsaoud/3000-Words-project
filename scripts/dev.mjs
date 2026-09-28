// Development: the account server (port 8080) and the app with live reload (port 5173)
// together. Open http://localhost:5173. Ctrl+C stops both.
import { spawn } from 'node:child_process';

const run = (name, cmd, args, cwd) => {
  const p = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' });
  const tag = (line) => line && console.log(`[${name}] ${line}`);
  p.stdout.on('data', (d) => d.toString().split('\n').forEach(tag));
  p.stderr.on('data', (d) => d.toString().split('\n').forEach(tag));
  p.on('exit', (code) => { console.log(`[${name}] stopped (${code})`); process.exit(code ?? 0); });
  return p;
};

const procs = [
  run('server', process.execPath, ['--disable-warning=ExperimentalWarning', 'index.js'], 'server'),
  run('app', 'npm', ['run', 'dev'], 'app'),
];
process.on('SIGINT', () => { for (const p of procs) p.kill('SIGINT'); });
