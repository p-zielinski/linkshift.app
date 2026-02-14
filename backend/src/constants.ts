/**
 * Global safety constants for the redirection engine.
 */
export const REDIRECT_ENGINE_LIMITS = {
  /**
   * Maximum allowed nesting level for conditional logic (ternary operators).
   * This prevents Stack Overflow errors during parsing and execution.
   */
  MAX_RECURSION_DEPTH: 32,
};
