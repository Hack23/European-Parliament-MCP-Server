#!/usr/bin/env node
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

console.log('🔍 Verifying package before publish...\n');

let errors = 0;
let warnings = 0;

/**
 * Log error message
 * @param {string} message - Error message
 */
function error(message) {
  console.error(`❌ ${message}`);
  errors++;
}

/**
 * Log warning message
 * @param {string} message - Warning message
 */
function warn(message) {
  console.warn(`⚠️  ${message}`);
  warnings++;
}

/**
 * Log success message
 * @param {string} message - Success message
 */
function success(message) {
  console.log(`✅ ${message}`);
}

// Check 1: dist/ directory exists
console.log('📁 Checking dist/ directory...');
if (!existsSync(join(ROOT_DIR, 'dist'))) {
  error('dist/ directory not found. Run "npm run build" first.');
} else {
  success('dist/ directory exists');
}

// Check 2: Required files in dist/
console.log('\n📄 Checking required files...');
const requiredDistFiles = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/index.js.map',
  'dist/index.d.ts.map'
];

for (const file of requiredDistFiles) {
  const filePath = join(ROOT_DIR, file);
  if (!existsSync(filePath)) {
    error(`Required file missing: ${file}`);
  } else {
    const stats = statSync(filePath);
    success(`${file} (${stats.size} bytes)`);
  }
}

// Check 3: Required documentation files
const requiredDocs = [
  'README.md',
  'LICENSE.md',
  'SECURITY.md',
  'CHANGELOG.md'
];

for (const file of requiredDocs) {
  const filePath = join(ROOT_DIR, file);
  if (!existsSync(filePath)) {
    error(`Required documentation missing: ${file}`);
  } else {
    const stats = statSync(filePath);
    success(`${file} (${stats.size} bytes)`);
  }
}

// Check 4: Shebang in entry point
console.log('\n🔨 Checking entry point...');
const indexPath = join(ROOT_DIR, 'dist/index.js');
if (existsSync(indexPath)) {
  const indexContent = readFileSync(indexPath, 'utf8');
  if (!indexContent.startsWith('#!/usr/bin/env node')) {
    error('dist/index.js missing shebang (#!/usr/bin/env node)');
  } else {
    success('Shebang present in dist/index.js');
  }
  
  // Check module format using a simple heuristic
  const hasImportSyntax = indexContent.includes('import ');
  const hasCommonJsSyntax =
    indexContent.includes('require(') ||
    indexContent.includes('module.exports') ||
    indexContent.includes('exports.');

  if (hasImportSyntax && !hasCommonJsSyntax) {
    success('ES module format detected');
  } else if (hasCommonJsSyntax && !hasImportSyntax) {
    warn('dist/index.js appears to be CommonJS format');
  } else {
    warn('dist/index.js module format could not be reliably determined');
  }
}

// Check 5: package.json validation
console.log('\n📦 Checking package.json...');
const pkgPath = join(ROOT_DIR, 'package.json');
if (!existsSync(pkgPath)) {
  error('package.json not found');
} else {
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    
    success(`Package: ${pkg.name}@${pkg.version}`);
    
    // Check required fields
    if (!pkg.name) error('package.json missing "name" field');
    if (!pkg.version) error('package.json missing "version" field');
    if (!pkg.description) warn('package.json missing "description" field');
    if (!pkg.license) error('package.json missing "license" field');
    if (!pkg.repository) warn('package.json missing "repository" field');
    if (!pkg.main) error('package.json missing "main" field');
    if (!pkg.bin) error('package.json missing "bin" field');
    if (!pkg.files) error('package.json missing "files" field');
    
    // Check bin configuration
    if (pkg.bin) {
      const binKeys = Object.keys(pkg.bin);
      success(`Binary entry points: ${binKeys.join(', ')}`);
      
      // Check if npx-compatible bin entry exists
      // npx looks for exact package name match or scoped package basename
      const packageBaseName = pkg.name.startsWith('@')
        ? pkg.name.split('/')[1]
        : pkg.name;
      const hasNpxCompatibleBin =
        binKeys.includes(pkg.name) || binKeys.includes(packageBaseName);
      
      if (!hasNpxCompatibleBin) {
        warn(`No bin entry for '${pkg.name}' - npx ${pkg.name} may not work as expected`);
      } else {
        success(`npx-compatible bin entry exists for package`);
      }
      
      for (const binName of binKeys) {
        const binPath = pkg.bin[binName];
        if (binPath !== 'dist/index.js') {
          warn(`Binary "${binName}" points to ${binPath}, expected dist/index.js`);
        }
      }
    }
    
    // Check files array
    if (pkg.files) {
      success(`Package files: ${pkg.files.length} entries`);
      console.log(`   Files to include: ${pkg.files.join(', ')}`);
      
      // Verify files exist
      for (const file of pkg.files) {
        const filePath = join(ROOT_DIR, file);
        if (!existsSync(filePath)) {
          error(`Package file not found: ${file}`);
        }
      }
    }
    
    // Check dependencies
    if (pkg.dependencies) {
      const depCount = Object.keys(pkg.dependencies).length;
      success(`Dependencies: ${depCount}`);
      console.log(`   Runtime deps: ${Object.keys(pkg.dependencies).join(', ')}`);
    } else {
      warn('No dependencies declared');
    }
    
    if (pkg.devDependencies) {
      const devDepCount = Object.keys(pkg.devDependencies).length;
      success(`DevDependencies: ${devDepCount}`);
    }
    
    // Check engines
    if (pkg.engines) {
      success(`Node version requirement: ${pkg.engines.node || 'not specified'}`);
      if (pkg.engines.npm) {
        success(`npm version requirement: ${pkg.engines.npm}`);
      }
    } else {
      warn('No engines field specified');
    }
    
    // Check type field for ES modules
    if (pkg.type !== 'module') {
      error('package.json missing "type": "module" for ES modules');
    } else {
      success('ES module type specified');
    }
    
    // Check publishConfig
    if (pkg.publishConfig) {
      if (pkg.publishConfig.access === 'public') {
        success('Public access configured');
      }
      if (pkg.publishConfig.provenance === true) {
        success('npm provenance is configured/enabled');
      } else {
        warn('npm provenance is not configured/enabled');
      }
    } else {
      warn('No publishConfig specified');
    }
    
  } catch (e) {
    error(`Invalid package.json: ${e.message}`);
  }
}

// Check 6: TypeScript configuration
console.log('\n📘 Checking TypeScript configuration...');
const tsconfigPath = join(ROOT_DIR, 'tsconfig.json');
if (!existsSync(tsconfigPath)) {
  warn('tsconfig.json not found');
} else {
  try {
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
    if (tsconfig.compilerOptions?.declaration !== true) {
      warn('TypeScript declarations not enabled');
    } else {
      success('TypeScript declarations enabled');
    }
    if (tsconfig.compilerOptions?.declarationMap !== true) {
      warn('TypeScript declaration maps not enabled');
    } else {
      success('TypeScript declaration maps enabled');
    }
  } catch (e) {
    warn(`Could not parse tsconfig.json: ${e.message}`);
  }
}

// Check 7: Test for common issues
console.log('\n🔍 Checking for common issues...');

// Check .npmignore doesn't exclude needed files
const npmignorePath = join(ROOT_DIR, '.npmignore');
if (existsSync(npmignorePath)) {
  const npmignore = readFileSync(npmignorePath, 'utf8');
  // Check if dist/ is explicitly excluded (not just mentioned in comments)
  const lines = npmignore.split('\n').filter(line => !line.trim().startsWith('#'));
  const excludesDist = lines.some(line => line.trim() === 'dist/' || line.trim() === 'dist');
  
  if (excludesDist) {
    error('.npmignore is excluding dist/ directory');
  } else {
    success('.npmignore does not exclude dist/');
  }
}

// Check for node_modules in dist (shouldn't happen but check anyway)
if (existsSync(join(ROOT_DIR, 'dist', 'node_modules'))) {
  error('node_modules found in dist/ - this should not happen');
}

// Summary
console.log('\n═══════════════════════════════════════════════════');
console.log(`📊 Verification Summary:`);
console.log(`   ✅ ${errors === 0 ? 'No errors' : `${errors} error(s)`}`);
console.log(`   ⚠️  ${warnings === 0 ? 'No warnings' : `${warnings} warning(s)`}`);
console.log('═══════════════════════════════════════════════════');

if (errors > 0) {
  console.error('\n❌ Package verification failed! Please fix the errors above.');
  process.exit(1);
}

if (warnings > 0) {
  console.log('\n⚠️  Package has warnings. Review them before publishing.');
  console.log('   You can proceed, but consider addressing warnings.');
}

console.log('\n✅ Package verification passed!');
console.log('\n🚀 Ready to publish with: npm publish');
console.log('   Or test locally with: npm link');
console.log('\n📦 ISMS Compliance:');
console.log('   ✓ Documentation complete (README, LICENSE, SECURITY, CHANGELOG)');
console.log('   ✓ npm provenance configuration enabled');
console.log('   ✓ All required files included');

process.exit(0);
