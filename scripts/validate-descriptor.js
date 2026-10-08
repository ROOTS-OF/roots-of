#!/usr/bin/env node
'use strict';

/**
 * Non-mutating validator for a rootfs-instance descriptor (CONTRACT.md v1).
 *
 * Deliberately dependency-free: no network, no Docker/WSL/git calls, no
 * writes. Reads exactly one file and prints a PASS/FAIL receipt line to
 * stdout. Exit code 0 on PASS, 1 on FAIL or usage error.
 *
 * Usage: node scripts/validate-descriptor.js <path-to-descriptor.json>
 */

import fs from 'fs';

function fail(reason) {
  console.log(`FAIL ${reason}`);
  process.exit(1);
}

const path = process.argv[2];
if (!path) {
  fail('usage: validate-descriptor.js <path-to-descriptor.json>');
}

let raw;
try {
  raw = fs.readFileSync(path, 'utf8');
} catch (e) {
  fail(`could not read ${path}: ${e.message}`);
}

let d;
try {
  d = JSON.parse(raw);
} catch (e) {
  fail(`${path} is not valid JSON: ${e.message}`);
}

function req(obj, keys, ctx) {
  for (const k of keys) {
    if (!(k in obj)) fail(`${ctx} missing required field "${k}"`);
  }
}

req(d, ['contractVersion', 'artifact', 'source', 'lifecycle', 'supportedTarget', 'acceptanceReceipt'], 'descriptor');

if (d.contractVersion !== '1.0.0') {
  fail(`contractVersion is "${d.contractVersion}", expected "1.0.0"`);
}

req(d.artifact, ['type', 'platform', 'architecture', 'digest'], 'artifact');
const allowedArtifactTypes = ['wsl-export', 'oci-image', 'debootstrap', 'mkosi', 'distrobuilder', 'packer'];
if (!allowedArtifactTypes.includes(d.artifact.type)) {
  fail(`artifact.type "${d.artifact.type}" is not one of ${allowedArtifactTypes.join(', ')}`);
}

req(d.source, ['recipe', 'provenance'], 'source');
req(d.lifecycle, ['build', 'export', 'restore', 'validate'], 'lifecycle');
req(d.acceptanceReceipt, ['command', 'lastRunAt', 'lastResult'], 'acceptanceReceipt');

const allowedResults = ['PASS', 'FAIL', 'NOT_YET_RUN'];
if (!allowedResults.includes(d.acceptanceReceipt.lastResult)) {
  fail(`acceptanceReceipt.lastResult "${d.acceptanceReceipt.lastResult}" is not one of ${allowedResults.join(', ')}`);
}

if (d.isolation) {
  req(
    d.isolation,
    ['team', 'dockerDataRoot', 'bridge', 'addressPool', 'networks', 'volumes', 'composeProject', 'hostPorts', 'bindMounts'],
    'isolation'
  );
  const allowedTeams = ['red', 'blue', 'shared'];
  if (!allowedTeams.includes(d.isolation.team)) {
    fail(`isolation.team "${d.isolation.team}" is not one of ${allowedTeams.join(', ')}`);
  }
  const placeholder = 'unknown — needs verification';
  for (const [k, v] of Object.entries(d.isolation)) {
    if (k === 'team') continue;
    if (Array.isArray(v) && v.length === 0) {
      console.log(`WARN isolation.${k} is an empty array — confirm this is really empty, not unfilled`);
    }
  }
}

console.log(`PASS ${path} validates against rootfs-instance contract v1.0.0`);
process.exit(0);
