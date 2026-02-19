/**
 * Fixture Manager for Integration Tests
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * Captures and saves real API responses as test fixtures for offline testing
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Module-level Set for efficient PII field lookup (hoisted for performance)
const PII_FIELDS = new Set(['email', 'phone', 'address', 'phoneNumber', 'personalEmail', 'officeAddress']);

/**
 * Sanitize PII fields from data before saving fixtures (GDPR compliance)
 * 
 * @param data - Data to sanitize
 * @returns Sanitized copy of data
 */
function sanitizePII(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizePII(item));
  }
  
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (PII_FIELDS.has(key)) {
        // Redact PII fields
        sanitized[key] = '[REDACTED]';
      } else {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizePII(value);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

/**
 * Check if fixture saving is enabled
 */
export function shouldSaveFixtures(): boolean {
  return process.env.EP_SAVE_FIXTURES === 'true';
}

/**
 * Save API response as fixture
 * 
 * @param toolName - Name of the MCP tool
 * @param testName - Name of the test case
 * @param data - Response data to save
 * 
 * @example
 * ```typescript
 * saveFixture('get_meps', 'swedish-meps', result);
 * ```
 */
export function saveFixture(
  toolName: string,
  testName: string,
  data: unknown
): void {
  if (!shouldSaveFixtures()) {
    return;
  }
  
  try {
    const fixturesDir = join(process.cwd(), 'tests', 'fixtures', 'real-api', toolName);
    
    // Ensure directory exists
    if (!existsSync(fixturesDir)) {
      mkdirSync(fixturesDir, { recursive: true });
    }
    
    const filename = `${testName}.json`;
    const filepath = join(fixturesDir, filename);
    
    // Sanitize PII before saving (GDPR compliance)
    const sanitizedData = sanitizePII(data);
    
    // Save with pretty formatting
    const json = JSON.stringify(sanitizedData, null, 2);
    writeFileSync(filepath, json, 'utf-8');
    
    console.log(`[Fixture] Saved: ${toolName}/${filename}`);
  } catch (error) {
    console.warn(`[Fixture] Failed to save ${toolName}/${testName}:`, error);
  }
}

/**
 * Save MCP response content as fixture
 * 
 * @param toolName - Name of the MCP tool
 * @param testName - Name of the test case
 * @param result - MCP tool result
 */
export function saveMCPResponseFixture(
  toolName: string,
  testName: string,
  result: { content: Array<{ type: string; text: string }> }
): void {
  if (!shouldSaveFixtures()) {
    return;
  }
  
  try {
    const textContent = result.content[0];
    if (!textContent) {
      return;
    }
    
    const data = JSON.parse(textContent.text) as unknown;
    saveFixture(toolName, testName, data);
  } catch (error) {
    console.warn(`[Fixture] Failed to parse MCP response for ${toolName}/${testName}:`, error);
  }
}

/**
 * Create fixtures directory if it doesn't exist
 */
export function ensureFixturesDirectory(): void {
  const fixturesDir = join(process.cwd(), 'tests', 'fixtures', 'real-api');
  
  if (!existsSync(fixturesDir)) {
    mkdirSync(fixturesDir, { recursive: true });
    console.log('[Fixture] Created fixtures directory:', fixturesDir);
  }
}
