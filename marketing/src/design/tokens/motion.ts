/**
 * Central Eye - Motion Tokens
 *
 * All animations must use these predefined tokens to ensure consistency.
 * We use Framer Motion physics springs for interaction, and durations for fades.
 */

export const motion = {
  // 1. Spring Physics (used for layout shifts, hovers, graph nodes)
  spring: {
    stiff: { type: "spring", stiffness: 400, damping: 30 }, // Snapping UI elements
    fluid: { type: "spring", stiffness: 100, damping: 20 }, // Graph nodes, fluid layout changes
    heavy: { type: "spring", stiffness: 50, damping: 15 },  // Camera movements, large morphs
  },

  // 2. Durations (used for opacity, colors)
  duration: {
    fast: 0.15,   // 150ms: Color changes, quick hovers
    normal: 0.3,  // 300ms: Opacity fades, simple reveals
    slow: 0.8,    // 800ms: Cinematic state morphs (between scenes)
  },

  // 3. Easing Curves (CSS / Framer standard easing)
  ease: {
    standard: [0.4, 0, 0.2, 1],
    decelerate: [0.0, 0, 0.2, 1], // Entering screen
    accelerate: [0.4, 0, 1, 1],   // Exiting screen
  },
} as const;
