#!/usr/bin/env tsx
/**
 * Verify Package Before Publishing
 *
 * Pre-publish verification script that checks:
 * - dist/ directory exists and contains required files
 * - Shebang is present in entry point
 * - package.json is valid and includes all runtime files
 * - Dependencies are properly declared
 * - Required documentation files exist
 * - TypeScript declarations are generated
 *
 * **ISMS Compliance:**
 * Per Hack23 Open Source Policy, all packages must include:
 * - README.md with usage instructions
 * - LICENSE.md with Apache-2.0 license
 * - SECURITY.md with vulnerability disclosure
 * - CHANGELOG.md with version history
 *
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#distribution
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Mutable counters for accumulated validation results */
interface ValidationState {
  errors: number;
  warnings: number;
}

/** Minimal publishConfig subset expected in package.json */
interface PublishConfig {
  access?: string;
  provenance?: boolean;
  registry?: string;
}

/** Minimal engines subset expected in package.json */
interface EnginesConfig {
  node?: string;
  npm?: string;
}

/** Shape of the package.json fields this script inspects */
interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  license?: string;
  repository?: unknown;
  main?: string;
  bin?: Record<string, string>;
  files?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: EnginesConfig;
  type?: string;
  publishConfig?: PublishConfig;
}

/** Minimal tsconfig.json shape this script inspects */
interface TsConfig {
  compilerOptions?: {
    declaration?: boolean;
    declarationMap?: boolean;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Expected entry-point path for the published package */
const ENTRY_POINT = 'dist/index.js' as const;

/** Files that must exist in dist/ after a successful build */
const REQUIRED_DIST_FILES: readonly string[] = [
  ENTRY_POINT,
  'dist/index.d.ts',
  'dist/index.js.map',
  'dist/index.d.ts.map',
] as const;

/** Documentation files required by the ISMS Open Source Policy */
const REQUIRED_DOCS: readonly string[] = [
  'README.md',
  'LICENSE.md',
  'SECURITY.md',
  'CHANGELOG.md',
] as const;

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/** Narrows an unknown JSON value to {@link PackageJson}. */
function isPackageJson(data: unknown): data is PackageJson {
  return typeof data === 'object' && data !== null;
}

/** Narrows an unknown JSON value to {@link TsConfig}. */
function isTsConfig(data: unknown): data is TsConfig {
  return typeof data === 'object' && data !== null;
}

// ---------------------------------------------------------------------------
// Logging helpers (all accept state so callers remain pure functions)
// ---------------------------------------------------------------------------

/**
 * Record an error and print it to stderr.
 *
 * @param state   - Mutable validation counters to increment.
 * @param message - Human-readable error description.
 */
function error(state: ValidationState, message: string): void {
  console.error(`❌ ${message}`);
  state.errors++;
}

/**
 * Record a warning and print it to stderr.
 *
 * @param state   - Mutable validation counters to increment.
 * @param message - Human-readable warning description.
 */
function warn(state: ValidationState, message: string): void {
  console.warn(`⚠️  ${message}`);
  state.warnings++;
}

/**
 * Print a success message (state is accepted for API consistency).
 *
 * @param _state  - Validation counters (not modified by a success).
 * @param message - Human-readable success description.
 */
function success(_state: ValidationState, message: string): void {
  console.log(`✅ ${message}`);
}

// ---------------------------------------------------------------------------
// Main verification
// ---------------------------------------------------------------------------

console.log('🔍 Verifying package before publish...\n');

const state: ValidationState = { errors: 0, warnings: 0 };

// ── Check 1: dist/ directory exists ────────────────────────────────────────
console.log('📁 Checking dist/ directory...');
if (!existsSync(join(ROOT_DIR, 'dist'))) {
  error(state, 'dist/ directory not found. Run "npm run build" first.');
} else {
  success(state, 'dist/ directory exists');
}

// ── Check 2: Required files in dist/ ───────────────────────────────────────
console.log('\n📄 Checking required files...');

for (const file of REQUIRED_DIST_FILES) {
  const filePath = join(ROOT_DIR, file);
  if (!existsSync(filePath)) {
    error(state, `Required file missing: ${file}`);
  } else {
    try {
      const stats = statSync(filePath);
      success(state, `${file} (${stats.size} bytes)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error(state, `Failed to stat ${file}: ${message}`);
    }
  }
}

// ── Check 3: Required documentation files ──────────────────────────────────
for (const file of REQUIRED_DOCS) {
  const filePath = join(ROOT_DIR, file);
  if (!existsSync(filePath)) {
    error(state, `Required documentation missing: ${file}`);
  } else {
    try {
      const stats = statSync(filePath);
      success(state, `${file} (${stats.size} bytes)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error(state, `Failed to stat ${file}: ${message}`);
    }
  }
}

// ── Check 4: Shebang in entry point ────────────────────────────────────────
console.log('\n🔨 Checking entry point...');
const indexPath = join(ROOT_DIR, ENTRY_POINT);
if (existsSync(indexPath)) {
  let indexContent: string;
  try {
    indexContent = readFileSync(indexPath, 'utf8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error(state, `Failed to read ${ENTRY_POINT}: ${message}`);
    indexContent = '';
  }

  if (indexContent.length > 0) {
    if (!indexContent.startsWith('#!/usr/bin/env node')) {
      error(state, `${ENTRY_POINT} missing shebang (#!/usr/bin/env node)`);
    } else {
      success(state, `Shebang present in ${ENTRY_POINT}`);
    }

    // Check module format using a simple heuristic
    const hasImportSyntax = indexContent.includes('import ');
    const hasCommonJsSyntax =
      indexContent.includes('require(') ||
      indexContent.includes('module.exports') ||
      indexContent.includes('exports.');

    if (hasImportSyntax && !hasCommonJsSyntax) {
      success(state, 'ES module format detected');
    } else if (hasCommonJsSyntax && !hasImportSyntax) {
      warn(state, `${ENTRY_POINT} appears to be CommonJS format`);
    } else {
      warn(state, `${ENTRY_POINT} module format could not be reliably determined`);
    }
  }
}

// ── Check 5: package.json validation ───────────────────────────────────────
console.log('\n📦 Checking package.json...');
const pkgPath = join(ROOT_DIR, 'package.json');
if (!existsSync(pkgPath)) {
  error(state, 'package.json not found');
} else {
  try {
    const rawPkg: unknown = JSON.parse(readFileSync(pkgPath, 'utf8'));

    if (!isPackageJson(rawPkg)) {
      error(state, 'package.json could not be parsed as an object');
    } else {
      const pkg: PackageJson = rawPkg;

      success(state, `Package: ${pkg.name ?? '(unnamed)'}@${pkg.version ?? '(no version)'}`);

      // Required fields
      if (!pkg.name) error(state, 'package.json missing "name" field');
      if (!pkg.version) error(state, 'package.json missing "version" field');
      if (!pkg.description) warn(state, 'package.json missing "description" field');
      if (!pkg.license) error(state, 'package.json missing "license" field');
      if (!pkg.repository) warn(state, 'package.json missing "repository" field');
      if (!pkg.main) error(state, 'package.json missing "main" field');
      if (!pkg.bin) error(state, 'package.json missing "bin" field');
      if (!pkg.files) error(state, 'package.json missing "files" field');

      // Check bin configuration
      if (pkg.bin) {
        const binKeys = Object.keys(pkg.bin);
        success(state, `Binary entry points: ${binKeys.join(', ')}`);

        // Check if npx-compatible bin entry exists
        // npx looks for exact package name match or scoped package basename
        const packageName = pkg.name ?? '';
        const packageBaseName = packageName.startsWith('@')
          ? packageName.split('/')[1] ?? packageName
          : packageName;
        const hasNpxCompatibleBin =
          binKeys.includes(packageName) || binKeys.includes(packageBaseName);

        if (!hasNpxCompatibleBin) {
          warn(
            state,
            `No bin entry for '${packageName}' - npx ${packageName} may not work as expected`,
          );
        } else {
          success(state, 'npx-compatible bin entry exists for package');
        }

        for (const binName of binKeys) {
          const binPath = pkg.bin[binName];
          if (binPath !== ENTRY_POINT) {
            warn(state, `Binary "${binName}" points to ${binPath}, expected ${ENTRY_POINT}`);
          }
        }
      }

      // Check files array
      if (pkg.files) {
        success(state, `Package files: ${pkg.files.length} entries`);
        console.log(`   Files to include: ${pkg.files.join(', ')}`);

        // Verify each listed file exists
        for (const file of pkg.files) {
          const filePath = join(ROOT_DIR, file);
          if (!existsSync(filePath)) {
            error(state, `Package file not found: ${file}`);
          }
        }
      }

      // Check dependencies
      if (pkg.dependencies) {
        const depCount = Object.keys(pkg.dependencies).length;
        success(state, `Dependencies: ${depCount}`);
        console.log(`   Runtime deps: ${Object.keys(pkg.dependencies).join(', ')}`);
      } else {
        warn(state, 'No dependencies declared');
      }

      if (pkg.devDependencies) {
        const devDepCount = Object.keys(pkg.devDependencies).length;
        success(state, `DevDependencies: ${devDepCount}`);
      }

      // Check engines
      if (pkg.engines) {
        success(state, `Node version requirement: ${pkg.engines.node ?? 'not specified'}`);
        if (pkg.engines.npm) {
          success(state, `npm version requirement: ${pkg.engines.npm}`);
        }
      } else {
        warn(state, 'No engines field specified');
      }

      // Check ES module type
      if (pkg.type !== 'module') {
        error(state, 'package.json missing "type": "module" for ES modules');
      } else {
        success(state, 'ES module type specified');
      }

      // Check publishConfig
      if (pkg.publishConfig) {
        if (pkg.publishConfig.access === 'public') {
          success(state, 'Public access configured');
        }
        if (pkg.publishConfig.provenance === true) {
          success(state, 'npm provenance is configured/enabled');
        } else {
          warn(state, 'npm provenance is not configured/enabled');
        }
      } else {
        warn(state, 'No publishConfig specified');
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error(state, `Invalid package.json: ${message}`);
  }
}

// ── Check 6: TypeScript configuration ──────────────────────────────────────
console.log('\n📘 Checking TypeScript configuration...');
const tsconfigPath = join(ROOT_DIR, 'tsconfig.json');
if (!existsSync(tsconfigPath)) {
  warn(state, 'tsconfig.json not found');
} else {
  try {
    const rawTsconfig: unknown = JSON.parse(readFileSync(tsconfigPath, 'utf8'));

    if (!isTsConfig(rawTsconfig)) {
      warn(state, 'tsconfig.json could not be parsed as an object');
    } else {
      const tsconfig: TsConfig = rawTsconfig;
      if (tsconfig.compilerOptions?.declaration !== true) {
        warn(state, 'TypeScript declarations not enabled');
      } else {
        success(state, 'TypeScript declarations enabled');
      }
      if (tsconfig.compilerOptions?.declarationMap !== true) {
        warn(state, 'TypeScript declaration maps not enabled');
      } else {
        success(state, 'TypeScript declaration maps enabled');
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    warn(state, `Could not parse tsconfig.json: ${message}`);
  }
}

// ── Check 7: Common issues ──────────────────────────────────────────────────
console.log('\n🔍 Checking for common issues...');

// Check .npmignore doesn't exclude dist/
const npmignorePath = join(ROOT_DIR, '.npmignore');
if (existsSync(npmignorePath)) {
  try {
    const npmignore = readFileSync(npmignorePath, 'utf8');
    // Ignore comment lines
    const lines = npmignore
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'));
    const excludesDist = lines.some(
      (line) => line.trim() === 'dist/' || line.trim() === 'dist',
    );

    if (excludesDist) {
      error(state, '.npmignore is excluding dist/ directory');
    } else {
      success(state, '.npmignore does not exclude dist/');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    warn(state, `Could not read .npmignore: ${message}`);
  }
}

// Check for node_modules accidentally bundled into dist/
if (existsSync(join(ROOT_DIR, 'dist', 'node_modules'))) {
  error(state, 'node_modules found in dist/ - this should not happen');
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════');
console.log('📊 Verification Summary:');
console.log(`   ✅ ${state.errors === 0 ? 'No errors' : `${state.errors} error(s)`}`);
console.log(`   ⚠️  ${state.warnings === 0 ? 'No warnings' : `${state.warnings} warning(s)`}`);
console.log('═══════════════════════════════════════════════════');

if (state.errors > 0) {
  console.error('\n❌ Package verification failed! Please fix the errors above.');
  process.exit(1);
}

if (state.warnings > 0) {
  console.log('\n⚠️  Package has warnings. Review them before publishing.');
  console.log('   You can proceed, but consider addressing warnings.');
}

console.log('\n✅ Package verification passed!');
console.log('\n🚀 Ready to publish with: npm publish');
console.log('   Or test locally with: npm link');
console.log('\n📦 ISMS Compliance:');
console.log('   ✓ Documentation complete (README, LICENSE, SECURITY, CHANGELOG)');
console.log('   ✓ npm provenance configuration verified (see checks above)');
console.log('   ✓ All required files included');

process.exit(0);
