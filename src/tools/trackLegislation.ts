/**
 * MCP Tool: track_legislation (Legacy export)
 * 
 * Re-exports from modular structure in ./trackLegislation/
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/** Re-export legislation tracking handler and metadata from modular implementation */
export { handleTrackLegislation, trackLegislationToolMetadata, toProcessId } from './trackLegislation/index.js';
