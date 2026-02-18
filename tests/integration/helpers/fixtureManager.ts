/**
 * Fixture Manager for Integration Tests
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * Captures and saves real API responses as test fixtures for offline testing
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

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
    
    // Save with pretty formatting
    const json = JSON.stringify(data, null, 2);
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
