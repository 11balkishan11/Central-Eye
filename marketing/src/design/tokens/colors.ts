/**
 * Central Eye - Color Tokens
 *
 * We do not use hex codes anywhere in our UI components.
 * All colors must map to their semantic meaning in the product.
 */

export const colors = {
  // 1. The Void (Backgrounds)
  background: {
    pure: "#000000",       // Pitch black for the main void
    surface: "#0A0A0B",    // Slightly elevated surfaces (cards, panels)
    elevated: "#111114",   // High-elevation surfaces (popovers, active states)
  },

  // 2. Data Flow & Product States
  product: {
    observation: "#00F0FF", // Cyan: Raw telemetry, active polling, collectors
    reasoning: "#00FFA3",   // Emerald: Verified inference, root cause, truth
    warning: "#FFB000",     // Amber: Degradation, uncertainty, drift
    error: "#FF3366",       // Crimson: Hard failure (use sparingly)
  },

  // 3. Typography & Lines
  text: {
    primary: "#FFFFFF",
    secondary: "#A1A1AA",   // Zinc 400
    tertiary: "#52525B",    // Zinc 600
  },
  
  border: {
    subtle: "rgba(255, 255, 255, 0.05)",
    active: "rgba(255, 255, 255, 0.15)",
  },

  // 4. The Graph (Edges and Nodes)
  graph: {
    nodeDefault: "#1C1C21",
    edgeDefault: "rgba(255, 255, 255, 0.1)",
    edgeActive: "rgba(0, 240, 255, 0.4)", // Cyan tint for active connections
  }
} as const;

// Helper for CSS Variables if needed
export type ColorTokens = typeof colors;
