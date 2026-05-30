const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

const envVars = {};
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx).trim();
  const val = trimmed.substring(eqIdx + 1).trim();
  envVars[key] = val;
}

const envs = ['production'];

for (const [key, value] of Object.entries(envVars)) {
  for (const env of envs) {
    console.log(`Adding ${key} to ${env}...`);
    try {
      // Use npx.cmd directly on Windows to avoid powershell resolution issues, and use stdio: 'ignore' to prevent hanging
      const command = `npx.cmd vercel env add ${key} ${env} --value "${value}" --yes --force`;
      execSync(command, { stdio: 'ignore' });
      console.log(`Successfully added ${key} to ${env}.`);
    } catch (error) {
      console.log(`Retrying with default command for ${key}...`);
      try {
        const command = `npx vercel env add ${key} ${env} --value "${value}" --yes --force`;
        execSync(command, { stdio: 'ignore' });
        console.log(`Successfully added ${key} to ${env} (fallback).`);
      } catch (fallbackError) {
        console.error(`Failed to add ${key} to ${env}:`, fallbackError.message);
      }
    }
  }
}

console.log('All environment variables processed.');
