'use strict';

/**
 * Builds the distributable artifacts for the Tab Out Joplin plugin.
 *
 * Produces, in publish/:
 *   <manifest.id>.jpl   - the plugin archive (a TAR of dist/)
 *   <manifest.id>.json  - a copy of the manifest
 *
 * Both files are required for the plugin to be picked up by the
 * official Joplin plugin repository script after `npm publish`.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const PUBLISH_DIR = path.join(ROOT, 'publish');
const MANIFEST_PATH = path.join(ROOT, 'manifest.json');

const REQUIRED_MANIFEST_FIELDS = [
  'manifest_version',
  'id',
  'name',
  'version',
  'app_min_version',
];

function fail(message) {
  console.error(`[dist] ERROR: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`[dist] ${message}`);
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    fail(`manifest.json not found at ${MANIFEST_PATH}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (err) {
    fail(`manifest.json is not valid JSON: ${err.message}`);
  }

  const missing = REQUIRED_MANIFEST_FIELDS.filter((f) => !manifest[f]);
  if (missing.length) {
    fail(`manifest.json is missing required field(s): ${missing.join(', ')}`);
  }

  if (!/^[A-Za-z0-9._-]+$/.test(manifest.id)) {
    fail(`manifest id "${manifest.id}" contains characters unsafe for a filename`);
  }

  return manifest;
}

function checkVersionSync(manifest) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  if (pkg.version !== manifest.version) {
    fail(
      `version mismatch: package.json is ${pkg.version}, ` +
      `manifest.json is ${manifest.version}. These must match.`
    );
  }
  log(`version ${manifest.version} (package.json and manifest.json in sync)`);
}

function collectDistFiles() {
  if (!fs.existsSync(DIST_DIR)) {
    fail(`dist/ not found — run "npm run build" first`);
  }

  const files = fs.readdirSync(DIST_DIR);
  if (!files.length) {
    fail('dist/ is empty — the webpack build produced no output');
  }

  for (const required of ['index.js', 'manifest.json']) {
    if (!files.includes(required)) {
      fail(`dist/ is missing ${required} — check webpack.config.js`);
    }
  }

  return files;
}

function main() {
  const manifest = readManifest();
  checkVersionSync(manifest);

  const files = collectDistFiles();
  log(`packaging ${files.length} file(s) from dist/`);

  fs.mkdirSync(PUBLISH_DIR, { recursive: true });

  const jplPath = path.join(PUBLISH_DIR, `${manifest.id}.jpl`);
  const jsonPath = path.join(PUBLISH_DIR, `${manifest.id}.json`);

  try {
    // execFileSync with an argument array avoids shell interpolation of paths.
    execFileSync('tar', ['-cf', jplPath, '-C', DIST_DIR, ...files], {
      stdio: 'inherit',
    });
  } catch (err) {
    fail(`tar failed: ${err.message}`);
  }

  fs.copyFileSync(MANIFEST_PATH, jsonPath);

  log(`created ${path.relative(ROOT, jplPath)}`);
  log(`created ${path.relative(ROOT, jsonPath)}`);
  log('archive contents:');
  execFileSync('tar', ['-tf', jplPath], { stdio: 'inherit' });
  log('Install locally via Tools -> Options -> Plugins -> Install from file.');
}

main();
