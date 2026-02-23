/**
 * MCP Tool: generate_report (Legacy export)
 * 
 * Re-exports from modular structure in ./generateReport/
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/** Re-export report generation handler and metadata from modular implementation */
export { handleGenerateReport, generateReportToolMetadata } from './generateReport/index.js';
