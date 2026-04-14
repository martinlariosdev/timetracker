import * as fs from 'fs';
import * as path from 'path';
import { exit } from 'process';

const ROOT_DIR = path.resolve(__dirname, '..');

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

function test(name: string, fn: () => void): TestResult {
  try {
    fn();
    return { name, passed: true };
  } catch (error) {
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function fileExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
}

function directoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }
  if (!fs.statSync(dirPath).isDirectory()) {
    throw new Error(`Path exists but is not a directory: ${dirPath}`);
  }
}

function fileContains(filePath: string, content: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  if (!fileContent.includes(content)) {
    throw new Error(`File does not contain expected content: ${content}`);
  }
}

console.log('Running monorepo structure verification tests...\n');

const tests: TestResult[] = [];

// Test 1: pnpm-workspace.yaml exists
tests.push(test('pnpm-workspace.yaml exists', () => {
  fileExists(path.join(ROOT_DIR, 'pnpm-workspace.yaml'));
}));

// Test 2: .npmrc exists
tests.push(test('.npmrc exists', () => {
  fileExists(path.join(ROOT_DIR, '.npmrc'));
}));

// Test 3: turbo.json exists
tests.push(test('turbo.json exists', () => {
  fileExists(path.join(ROOT_DIR, 'turbo.json'));
}));

// Test 4: Root package.json exists
tests.push(test('Root package.json exists', () => {
  fileExists(path.join(ROOT_DIR, 'package.json'));
}));

// Test 5: apps/mobile directory exists
tests.push(test('apps/mobile directory exists', () => {
  directoryExists(path.join(ROOT_DIR, 'apps/mobile'));
}));

// Test 6: apps/backend directory exists
tests.push(test('apps/backend directory exists', () => {
  directoryExists(path.join(ROOT_DIR, 'apps/backend'));
}));

// Test 7: packages/shared directory exists
tests.push(test('packages/shared directory exists', () => {
  directoryExists(path.join(ROOT_DIR, 'packages/shared'));
}));

// Test 8: Root package.json has private: true
tests.push(test('Root package.json has private: true', () => {
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  fileExists(packageJsonPath);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  if (packageJson.private !== true) {
    throw new Error('Root package.json must have private: true');
  }
}));

// Test 9: Root package.json has required scripts
tests.push(test('Root package.json has required scripts', () => {
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  fileExists(packageJsonPath);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const requiredScripts = ['dev', 'build', 'test', 'lint', 'mobile', 'backend', 'type-check'];
  const scripts = packageJson.scripts || {};

  for (const script of requiredScripts) {
    if (!scripts[script]) {
      throw new Error(`Missing required script: ${script}`);
    }
  }
}));

// Test 10: pnpm-workspace.yaml has correct structure
tests.push(test('pnpm-workspace.yaml has correct workspace paths', () => {
  const workspaceFilePath = path.join(ROOT_DIR, 'pnpm-workspace.yaml');
  fileExists(workspaceFilePath);
  const content = fs.readFileSync(workspaceFilePath, 'utf-8');

  if (!content.includes('apps/*')) {
    throw new Error('pnpm-workspace.yaml must include apps/*');
  }
  if (!content.includes('packages/*')) {
    throw new Error('pnpm-workspace.yaml must include packages/*');
  }
}));

// Print results
let passedCount = 0;
let failedCount = 0;

tests.forEach(result => {
  if (result.passed) {
    console.log(`✓ ${result.name}`);
    passedCount++;
  } else {
    console.log(`✗ ${result.name}`);
    console.log(`  Error: ${result.error}`);
    failedCount++;
  }
});

console.log(`\nTotal: ${tests.length} tests`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failedCount}`);

if (failedCount > 0) {
  console.log('\n❌ Tests failed');
  exit(1);
} else {
  console.log('\n✅ All tests passed');
  exit(0);
}
