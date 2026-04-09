# Design System Strategy: The Architectural Ledger

## 1. Overview & Creative North Star
**Creative North Star: The Architectural Ledger**
In an industry often defined by clutter and anxiety, this design system establishes a "Digital Sanctuary." We are moving away from the "standard" FinTech template of dense grids and heavy borders. Instead, we embrace **The Architectural Ledger**: a layout philosophy that treats financial data as high-end editorial content. 

This system breaks the mold through **intentional asymmetry** and **tonal depth**. By utilizing expansive white space (breathing room) and a sophisticated hierarchy of overlapping surfaces, we convey "Security" through structural stability and "Modernity" through glass-like transparency. The interface doesn't just show data; it curates it.

## 2. Color & Surface Philosophy
The palette is anchored by the authoritative **Primary Deep Indigo (#24389c)**. However, the premium feel is achieved through the spaces *between* the elements.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning or containment. Boundaries must be defined through **Background Tonal Shifts**. 
*   **Surface Hierarchy:** To create a section, place a `surface_container_low` (#f4f2fc) element against a `surface` (#fbf8ff) background.
*   **Nesting:** Use the tiers (`lowest` to `highest`) to imply importance. A high-priority card should be `surface_container_lowest` (#ffffff) to "pop" against a `surface_container` (#efedf6) background.

### The "Glass & Gradient" Rule
Flat indigo is for utility; **Signature Gradients** are for brand moments. 
*   **CTAs:** Use a linear gradient from `primary` (#24389c) to `primary_container` (#3f51b5) at a 135° angle to provide a "soul" to the action.
*   **Glassmorphism:** For floating navigation or modal overlays, use `surface_container_lowest` with 80% opacity and a `backdrop-filter: blur(20px)`. This integrates the UI layers into a single, cohesive environment.

### Vibrant Accents
*   **Secondary (Mint Green):** Use `secondary` (#006d43) for growth and positive flow.
*   **Tertiary (Amber):** Use `tertiary` (#573f00) for warnings or transport categories.

## 3. Typography: Editorial Authority
We pair the geometric precision of **Manrope** for headlines with the legendary legibility of **Inter** for data.

*   **Display & Headlines (Manrope):** These should be treated as architectural elements. Use `display-lg` (3.5rem) for high-impact balance summaries. The wide apertures of Manrope convey a sense of openness and transparency.
*   **Body & Labels (Inter):** All transactional data must use `body-md` or `label-md`. Inter’s tall x-height ensures that even at `label-sm` (0.6875rem), financial figures remain crystalline and error-proof.
*   **The Scale Shift:** Create drama by pairing a `headline-lg` title with a significantly smaller `label-md` uppercase sub-header. This high-contrast scale is the hallmark of premium editorial design.

## 4. Elevation & Depth
Depth in this system is organic, not artificial. We mimic natural light hitting fine paper and glass.

*   **Tonal Layering:** Avoid shadows for standard cards. Achieve "lift" by placing a `surface_container_highest` (#e3e1ea) element inside a `surface` (#fbf8ff) environment.
*   **Ambient Shadows:** For high-priority floating elements (like a "Transfer" FAB), use an ultra-diffused shadow:
    *   **Color:** `on_surface` (#1a1b22) at 6% opacity.
    *   **Blur:** 32px to 48px.
    *   **Offset:** Y: 8px.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use the `outline_variant` (#c5c5d4) token at **15% opacity**. Never use 100% opaque lines.

## 5. Component Logic

### Buttons & Interaction
*   **Primary:** Indigo gradient (`primary` to `primary_container`). Roundedness: `md` (0.75rem / 12px).
*   **Secondary:** Ghost variant. No background, only a `primary` text label. 
*   **Haptics:** Interaction should feel "soft." On-press, components should scale to 98% rather than just changing color.

### Input Fields
*   **Structure:** No bottom-line-only inputs. Use a `surface_container_low` fill with a `sm` (0.25rem) corner radius. 
*   **State:** On focus, transition the background to `surface_container_lowest` and apply a 2px `surface_tint` (#4355b9) "Ghost Border" (20% opacity).

### Cards & Lists
*   **The Divider Ban:** Strictly forbid 1px dividers between list items. Use **24px vertical white space** or alternating tonal backgrounds (`surface_container_low` vs `surface_container_lowest`) to separate transactions.
*   **Visual Rhythm:** Use `lg` (1rem / 16px) rounding for main account cards to make them feel friendly and tactile.

### Data Chips
*   **Category Chips:** Use the `secondary_fixed` (#78fbb6) for "Food" and `tertiary_fixed` (#ffdfa0) for "Transport." Text should always be the `on_fixed` variant to maintain a 7:1 contrast ratio.

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts for dashboards (e.g., a large balance on the left, smaller action chips stacked on the right).
*   **Do** prioritize "Overlapping." Let a card partially overlap a background gradient to create a sense of three-dimensional space.
*   **Do** use `surface_bright` (#fbf8ff) to highlight the most important user path.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#1a1b22) to keep the aesthetic high-end and soft.
*   **Don't** use standard 8px grids for everything. Allow for "macro-spacing" (64px+) between major sections to let the design breathe.
*   **Don't** use sharp 90-degree corners. Everything must have at least a `sm` (4px) radius to maintain the "Modern FinTech" approachability.