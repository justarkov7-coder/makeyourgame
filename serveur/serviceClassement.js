import { spawn } from 'node:child_process';
import { dossierRacine, portApi } from './configServeur.js';

// demarrerServiceClassement lance le service Go local.
export function demarrerServiceClassement() {
  const processus = spawn('go', ['run', './api'], {
    cwd: dossierRacine,
    env: { ...process.env, API_PORT: String(portApi), GO111MODULE: 'off' },
    stdio: 'inherit',
  });

  const arreter = function arreterServiceClassement() {
    if (!processus.killed) processus.kill('SIGTERM');
  };

  process.on('exit', arreter);
  process.on('SIGINT', function gererInterruptionTerminal() {
    arreter();
    process.exit(0);
  });
  process.on('SIGTERM', function gererArretTerminal() {
    arreter();
    process.exit(0);
  });
}
