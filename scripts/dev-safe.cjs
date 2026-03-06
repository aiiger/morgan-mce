const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const repo = process.cwd();
const lockPath = path.join(repo, '.next', 'dev', 'lock');

if (fs.existsSync(lockPath)) {
  console.log('ℹ️ A Next.js dev instance is already running for this repo (lock file exists).');
  console.log('ℹ️ If you want to restart cleanly, run: npm run dev:fresh');
  process.exit(0);
}

const child = spawn('node', ['node_modules/next/dist/bin/next', 'dev'], {
  stdio: 'inherit',
  shell: false
});

child.on('exit', (code) => process.exit(code ?? 0));
