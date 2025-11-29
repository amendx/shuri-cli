#!/usr/bin/env node

/**
 * Shuri CLI - Build/Package Integrity Test
 *
 * Verifies that all files required for publishing are present and valid.
 * Ensures the package is ready for npm publish.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

function fail(msg) {
  console.error('❌', msg);
  process.exit(1);
}

function checkFileExists(filePath, mustBeExecutable = false) {
  process.stdout.write(`  - Checking file: ${filePath} ... `);
  if (!fs.existsSync(filePath)) {
    console.log('FAIL');
    fail(`Missing required file: ${filePath}`);
  }
  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    console.log('FAIL');
    fail(`File is empty: ${filePath}`);
  }
  if (mustBeExecutable && (stat.mode & 0o111) === 0) {
    console.log('FAIL');
    fail(`File is not executable: ${filePath}`);
  }
  console.log('OK');
}

function checkFilesField() {
  console.log('Step 1: Checking files field in package.json');
  if (!Array.isArray(pkg.files)) {
    fail('No "files" field in package.json');
  }
  pkg.files.forEach((entry) => {
    const absPath = path.join(root, entry);
    if (entry.endsWith('/')) {
      process.stdout.write(`  - Checking directory: ${entry} ... `);
      if (!fs.existsSync(absPath) || !fs.statSync(absPath).isDirectory()) {
        console.log('FAIL');
        fail(`Missing required directory: ${entry}`);
      }
      const files = fs.readdirSync(absPath);
      if (files.length === 0) {
        console.log('FAIL');
        fail(`Directory is empty: ${entry}`);
      }
      console.log('OK');
    } else {
      checkFileExists(absPath);
    }
  });
}

function checkMainEntry() {
  console.log('Step 2: Checking main entry');
  if (!pkg.main) {
    fail('No "main" field in package.json');
  }
  checkFileExists(path.join(root, pkg.main));
}

function checkBinEntry() {
  console.log('Step 3: Checking bin entry');
  if (!pkg.bin || typeof pkg.bin !== 'object') {
    fail('No "bin" field in package.json');
  }
  Object.entries(pkg.bin).forEach(([binName, binPath]) => {
    const absPath = path.join(root, binPath);
    checkFileExists(absPath, true);
  });
}

function checkReadme() {
  console.log('Step 4: Checking README.md');
  checkFileExists(path.join(root, 'README.md'));
}

function checkDependencies() {
  console.log('Step 5: Checking dependencies');
  if (!pkg.dependencies) return;
  Object.keys(pkg.dependencies).forEach(dep => {
    process.stdout.write(`  - Checking dependency: ${dep} ... `);
    try {
      require.resolve(dep, { paths: [root] });
      console.log('OK');
    } catch (e) {
      console.log('FAIL');
      fail(`Dependency not installed: ${dep}`);
    }
  });
}

function runBuildTests() {
  console.log('🔎 Checking package integrity for publish...\n');
  checkFilesField();
  checkMainEntry();
  checkBinEntry();
  checkReadme();
  checkDependencies();
  console.log('\n✅ All checks passed. Package is ready to publish!');
}

if (require.main === module) {
  runBuildTests();
}

module.exports = { runBuildTests };
