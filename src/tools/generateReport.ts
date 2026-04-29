/**
 * MCP Tool: generate_report (public subpath entrypoint)
 *
 * Thin re-export shim that preserves the package's public subpath
 * `european-parliament-mcp-server/tools/generateReport` (declared in
 * `package.json#exports["./tools/*"]`). The actual implementation lives
 * in the modular structure under `./generateReport/`.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

export { handleGenerateReport, generateReportToolMetadata } from './generateReport/index.js';
