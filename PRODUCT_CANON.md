# Central Eye - Product Canon

This document is the highest source of truth in the repository. It dictates the philosophy of the product. Every engineer, designer, and AI agent must read this before contributing. If a pull request, design, or architecture violates these tenets, it must be rejected.

## 1. Product Truth
Every visual must represent a real capability. If something cannot eventually happen inside Central Eye, it cannot appear on the website.

## 2. Runtime Truth
Every rendered frame originates from the runtime. No fake animations. No hardcoded SVG timelines. No CSS pretending to be product behavior.

## 3. User Truth
Every interaction answers a user question. Not "Cool animation." Instead: "Now I understand."

## 4. Engineering Truth
Experiences own composition. Runtime owns truth. React never computes infrastructure logic.

## 5. Design Truth
Color carries meaning:
- **Cyan** = Observation
- **Emerald** = Verified inference (truth)
- **Amber** = Degraded confidence
- **Red** = Failure
- **White** = Narrative
- **Black** = Silence
Never violate this.

## 6. Motion Truth
Animation communicates state change. Never decorate. Never distract.

## 7. AI Truth
The AI never guesses. Every recommendation links back to evidence. Eventually every recommendation should expose: observations, dependencies, confidence, reasoning path.

## 8. Product Rule
If a feature cannot be explained in one sentence, it is not ready.
