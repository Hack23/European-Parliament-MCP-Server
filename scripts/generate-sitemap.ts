#!/usr/bin/env node

/**
 * Generate sitemap for GitHub Pages documentation
 * This script creates an index.html that links to all documentation pages
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Configuration for the sitemap generator */
interface SitemapConfig {
  /** Absolute path to the docs output directory */
  docsDir: string;
  /** Absolute path to the output index.html file */
  outputFile: string;
  /** Package version string (e.g. "1.0.0") */
  version: string;
  /** ISO date string of today, e.g. "2024-06-01" */
  lastUpdate: string;
}

/** Metadata for a documentation page card */
interface PageMetadata {
  /** Emoji icon displayed on the card */
  icon: string;
  /** Card heading */
  title: string;
  /** Short description shown on the card */
  description: string;
  /** Link target for the card */
  href: string;
  /** Optional badge label */
  badge?: string;
  /** Badge colour variant */
  badgeType?: 'default' | 'success' | 'info';
}

// ---------------------------------------------------------------------------
// Quality-metric constants (typed, single source of truth)
// ---------------------------------------------------------------------------

const SLSA_LEVEL = 'SLSA Level 3' as const;
const COVERAGE_TARGET = '80%+ Coverage' as const;

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = join(__dirname, '..', 'docs');
const OUTPUT_FILE = join(DOCS_DIR, 'index.html');

// ---------------------------------------------------------------------------
// Type guard – validates that a parsed JSON value contains a version string
// ---------------------------------------------------------------------------

function isValidPackageJson(data: unknown): data is { version: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'version' in data &&
    typeof (data as Record<string, unknown>)['version'] === 'string'
  );
}

// ---------------------------------------------------------------------------
// Read and validate package.json
// ---------------------------------------------------------------------------

let version: string;
const packageJsonPath = join(__dirname, '..', 'package.json');

try {
  const rawContent = readFileSync(packageJsonPath, 'utf8');
  const parsed: unknown = JSON.parse(rawContent);

  if (!isValidPackageJson(parsed)) {
    throw new Error('package.json does not contain a valid "version" string field');
  }

  version = parsed.version;
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`❌ Failed to read package.json: ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Assemble config
// ---------------------------------------------------------------------------

const isoDate = new Date().toISOString();
const lastUpdate: string = isoDate.split('T')[0] ?? isoDate.substring(0, 10);

const config: SitemapConfig = {
  docsDir: DOCS_DIR,
  outputFile: OUTPUT_FILE,
  version,
  lastUpdate,
};

// ---------------------------------------------------------------------------
// Page catalogue (illustrates PageMetadata usage)
// ---------------------------------------------------------------------------

/** Documentation pages rendered in the API Documentation section */
const _apiPages: PageMetadata[] = [
  {
    icon: '📖',
    title: 'API Reference (HTML)',
    href: 'api/index.html',
    description: 'Complete TypeScript API documentation with search, navigation, and type hierarchy',
    badge: 'TypeDoc HTML',
    badgeType: 'info',
  },
  {
    icon: '📝',
    title: 'API Reference (Markdown)',
    href: 'api-markdown/modules.md',
    description: 'SEO-friendly Markdown API documentation for all 39 tools, types, and schemas',
    badge: 'TypeDoc Markdown',
    badgeType: 'info',
  },
  {
    icon: '📦',
    title: 'SBOM',
    href: 'SBOM.md',
    description: 'Software Bill of Materials in SPDX format',
    badge: 'SPDX 2.3',
    badgeType: 'info',
  },
  {
    icon: '🔐',
    title: 'Attestations',
    href: 'ATTESTATIONS.md',
    description: 'Build provenance and supply chain security',
    badge: 'SLSA L3',
    badgeType: 'success',
  },
];

// ---------------------------------------------------------------------------
// HTML template (uses config + typed constants)
// ---------------------------------------------------------------------------

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="European Parliament MCP Server Documentation - API docs, test reports, and attestations">
    <title>European Parliament MCP Server Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        header {
            background: linear-gradient(135deg, #003399 0%, #0052cc 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
        }
        
        header img {
            width: 128px;
            height: 128px;
            border-radius: 50%;
            margin-bottom: 1rem;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        
        .version-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
        }
        
        .content {
            padding: 3rem 2rem;
        }
        
        .section {
            margin-bottom: 3rem;
        }
        
        .section h2 {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            color: #003399;
            border-bottom: 3px solid #003399;
            padding-bottom: 0.5rem;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        
        .card {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 1.5rem;
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            border-color: #003399;
        }
        
        .card-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .card h3 {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
            color: #003399;
        }
        
        .card p {
            color: #666;
            font-size: 0.95rem;
        }
        
        .badge {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            background: #003399;
            color: white;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-top: 0.5rem;
        }
        
        .badge.success {
            background: #28a745;
        }
        
        .badge.info {
            background: #17a2b8;
        }
        
        footer {
            background: #f8f9fa;
            padding: 2rem;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
        }
        
        footer a {
            color: #003399;
            text-decoration: none;
        }
        
        footer a:hover {
            text-decoration: underline;
        }
        
        .metadata {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }
        
        .metadata-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 1.8rem;
            }
            
            .grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo">
            <h1>🏛️ European Parliament MCP Server</h1>
            <p class="subtitle">Complete Documentation Portal</p>
            <div class="version-badge">Version ${config.version}</div>
            <div class="metadata">
                <div class="metadata-item">
                    <span>📅</span>
                    <span>Last Updated: ${config.lastUpdate}</span>
                </div>
                <div class="metadata-item">
                    <span>🔐</span>
                    <span>${SLSA_LEVEL}</span>
                </div>
                <div class="metadata-item">
                    <span>📊</span>
                    <span>${COVERAGE_TARGET}</span>
                </div>
            </div>
        </header>
        
        <div class="content">
            <div class="section">
                <h2>📚 API Documentation</h2>
                <div class="grid">
                    <a href="api/index.html" class="card">
                        <div class="card-icon">📖</div>
                        <h3>API Reference (HTML)</h3>
                        <p>Complete TypeScript API documentation with search, navigation, and type hierarchy</p>
                        <span class="badge info">TypeDoc HTML</span>
                    </a>
                    
                    <a href="api-markdown/modules.md" class="card">
                        <div class="card-icon">📝</div>
                        <h3>API Reference (Markdown)</h3>
                        <p>SEO-friendly Markdown API documentation for all 39 tools, types, and schemas</p>
                        <span class="badge info">TypeDoc Markdown</span>
                    </a>
                    
                    <a href="SBOM.md" class="card">
                        <div class="card-icon">📦</div>
                        <h3>SBOM</h3>
                        <p>Software Bill of Materials in SPDX format</p>
                        <span class="badge info">SPDX 2.3</span>
                    </a>
                    
                    <a href="ATTESTATIONS.md" class="card">
                        <div class="card-icon">🔐</div>
                        <h3>Attestations</h3>
                        <p>Build provenance and supply chain security</p>
                        <span class="badge success">SLSA L3</span>
                    </a>
                </div>
            </div>
            
            <div class="section">
                <h2>🧪 Test Reports</h2>
                <div class="grid">
                    <a href="coverage/index.html" class="card">
                        <div class="card-icon">📊</div>
                        <h3>Coverage Report</h3>
                        <p>Code coverage analysis with line, branch, and function metrics</p>
                        <span class="badge success">80%+ Target</span>
                    </a>
                    
                    <a href="test-results/report.html" class="card">
                        <div class="card-icon">✅</div>
                        <h3>Unit Test Results</h3>
                        <p>Detailed unit test execution results</p>
                        <span class="badge info">Vitest</span>
                    </a>
                    
                    <a href="e2e-results/report.html" class="card">
                        <div class="card-icon">🔄</div>
                        <h3>E2E Test Results</h3>
                        <p>End-to-end test execution results</p>
                        <span class="badge info">Integration</span>
                    </a>
                </div>
            </div>
            
            <div class="section">
                <h2>📖 Additional Documentation</h2>
                <div class="grid">
                    <a href="EP_API_INTEGRATION.md" class="card">
                        <div class="card-icon">🏛️</div>
                        <h3>EP API Integration</h3>
                        <p>European Parliament API integration guide</p>
                    </a>
                    
                    <a href="TESTING_GUIDE.md" class="card">
                        <div class="card-icon">🧪</div>
                        <h3>Testing Guide</h3>
                        <p>Comprehensive testing strategy and patterns</p>
                    </a>
                </div>
            </div>
            
            <div class="section">
                <h2>🔗 External Links</h2>
                <div class="grid">
                    <a href="https://github.com/Hack23/European-Parliament-MCP-Server" class="card">
                        <div class="card-icon">💻</div>
                        <h3>GitHub Repository</h3>
                        <p>Source code, issues, and contributions</p>
                    </a>
                    
                    <a href="https://www.npmjs.com/package/european-parliament-mcp-server" class="card">
                        <div class="card-icon">📦</div>
                        <h3>npm Package</h3>
                        <p>Install via npm registry</p>
                    </a>
                    
                    <a href="https://data.europarl.europa.eu/" class="card">
                        <div class="card-icon">🏛️</div>
                        <h3>EP Open Data Portal</h3>
                        <p>European Parliament data source</p>
                    </a>
                </div>
            </div>
        </div>
        
        <footer>
            <p><strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong></p>
            <p>Licensed under Apache-2.0 | ISMS Compliant (ISO 27001, NIST CSF 2.0, CIS Controls v8.1)</p>
            <p>GDPR Compliant | SLSA Level 3 | OpenSSF Best Practices</p>
        </footer>
    </div>
</body>
</html>
`;

// ---------------------------------------------------------------------------
// Ensure docs directory exists
// ---------------------------------------------------------------------------

try {
  if (!existsSync(config.docsDir)) {
    mkdirSync(config.docsDir, { recursive: true });
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`❌ Failed to create docs directory "${config.docsDir}": ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Write index.html
// ---------------------------------------------------------------------------

try {
  writeFileSync(config.outputFile, html, 'utf8');
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`❌ Failed to write "${config.outputFile}": ${message}`);
  process.exit(1);
}

console.log('✅ Documentation sitemap generated successfully!');
console.log(`📁 Output: ${config.outputFile}`);
console.log(`📦 Version: ${config.version}`);
console.log(`📅 Date: ${config.lastUpdate}`);
