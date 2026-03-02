/**
 * Shared server type definitions for the MCP server layer.
 *
 * Provides typed interfaces and aliases used across the server, CLI,
 * and tool registry modules.
 *
 * @module server/types
 */

// ── Tool result type ──────────────────────────────────────────────

/**
 * Standard MCP tool execution result.
 * Re-exported from the canonical definition in tools/shared/types.ts
 * which enforces the MCP protocol's `type: 'text'` literal constraint.
 */
import type { ToolResult } from '../tools/shared/types.js';
export type { ToolResult };

/**
 * Typed handler function for an MCP tool call.
 *
 * @param args - Raw (unvalidated) tool arguments from the MCP request
 * @returns Promise resolving to the tool execution result
 */
export type ToolHandler = (args: unknown) => Promise<ToolResult>;

// ── Tool category ─────────────────────────────────────────────────

/**
 * Logical grouping for tools in the registry.
 *
 * | Category | Description |
 * |----------|-------------|
 * | `core`     | Fundamental EP data retrieval tools (MEPs, plenary, etc.) |
 * | `advanced` | Multi-step analytical tools (voting patterns, reports) |
 * | `osint`    | Open-source intelligence analysis tools (influence, coalitions) |
 * | `phase4`   | EP API v2 endpoint tools added in phase 4 |
 * | `phase5`   | Complete EP API v2 coverage added in phase 5 |
 * | `feed`     | EP API v2 change-feed endpoints for monitoring recently updated data |
 */
export type ToolCategory = 'core' | 'advanced' | 'osint' | 'phase4' | 'phase5' | 'feed';

// ── Tool metadata ─────────────────────────────────────────────────

/**
 * Full metadata descriptor for a registered MCP tool.
 *
 * Extends the minimal MCP schema with a `category` field so callers
 * can group, filter, or display tools by logical purpose.
 */
export interface ToolMetadata {
  /** Unique tool identifier used in MCP `CallTool` requests */
  name: string;
  /** Human-readable description shown in `ListTools` responses */
  description: string;
  /** JSON-Schema object describing the tool's input parameters */
  inputSchema: unknown;
  /** Logical category for grouping and display */
  category: ToolCategory;
}

// ── CLI options ───────────────────────────────────────────────────

/**
 * Parsed command-line options for the MCP server binary.
 *
 * All fields are optional: absent fields indicate the flag was not
 * provided on the command line.
 */
export interface CLIOptions {
  /** Show usage / help text and exit */
  help?: boolean;
  /** Show version string and exit */
  version?: boolean;
  /** Show health-check / diagnostics JSON and exit */
  health?: boolean;
}
