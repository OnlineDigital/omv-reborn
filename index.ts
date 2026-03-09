#!/usr/bin/env bun
// Entry point - starts the server and serves built client
import { spawn } from 'child_process';

async function main() {
  // Build client
  console.log('Building client...');
  await new Promise<void>((resolve, reject) => {
    const proc = spawn('bun', ['run', 'vite', 'build'], { 
      stdio: 'inherit', 
      shell: true,
      cwd: process.cwd()
    });
    proc.on('close', (code) => code === 0 ? resolve() : reject(code));
  });

  // Start server
  console.log('Starting server...');
  await import('./src/server/index.ts');
}

main().catch(console.error);
