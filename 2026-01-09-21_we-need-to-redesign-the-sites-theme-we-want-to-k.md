# Plan: We need to redesign the site’s theme. We want to keep content in generally the s
Created: **2026-01-09 21:18**

## Info

We need to redesign the site’s theme. We want to keep content in generally the same places but give it a fresh coat of paint. Tech-y, smart, approachable, stylish. We can change the theme files in place, don’t need to worry about overriding/sub-themeing

## Explanation of current problem

The site's current theme needs a visual refresh to better convey a tech-savvy, smart, approachable, and stylish brand identity. While the content structure and layout are working well, the visual design requires modernization. We need to update the theme styling directly without creating theme overrides or child themes.

## Context documents

- `README.md` - Site overview, Hugo/PaperMod setup, build and deployment commands
- `docs/WritingStyle.md` - Content voice and tone guidelines that inform design aesthetics
- `hugo.yaml` - Site configuration including theme settings, menu structure, and feature flags
- `themes/PaperMod/README.md` - PaperMod theme features, modes, and customization options
- `themes/PaperMod/assets/css/` - Theme stylesheet structure and organization

## Description of current system

The site uses Hugo with the PaperMod theme, customized through direct theme modifications and Bootstrap 5 styling.

### Theme architecture

PaperMod provides the base structure via Hugo templates in `/themes/PaperMod/`:
⎿ `/themes/PaperMod/assets/css/` contains modular CSS files (core, common, extended, includes)
⎿ `/themes/PaperMod/assets/css/core/theme-vars.css` defines CSS custom properties for light/dark modes
⎿ `/themes/PaperMod/assets/css/extended/custom.css` is a stub pointing to Bootstrap implementation

Custom styling overrides PaperMod via `/assets/scss/custom.scss`:
⎿ Imports Bootstrap 5 with custom variables ($primary: #2b7fc7, Inter font family)
⎿ Defines Bootstrap-compatible CSS custom properties (--bs-primary, --bs-background, etc.)
⎿ Overrides PaperMod's `--theme` variable to `transparent` for VantaJS background
⎿ Implements custom components: shimmer buttons, profile layout, navigation gradient, tout cards
⎿ Hard-codes dark mode styling (currently configured in [hugo.yaml:11-12](/workspace/hugo.yaml:11-12) as `defaultTheme: dark` with toggle disabled)

### Visual identity

Current styling uses:
- Deep blue gradient backgrounds: `rgba(16, 40, 56, 0.72)` → `rgba(25, 35, 65, 0.94)`
- Primary blue: #2b7fc7 with light variant #aad8ff
- Inter font at 300 weight (light) for body, 600 for headings
- VantaJS animated background with glassmorphic overlays (backdrop-filter blur)
- Shimmer button effects with gradient hover states

The design reads technical but leans heavily blue/corporate rather than stylish/approachable. Heavy use of transparency and blur effects creates visual complexity. Custom Bootstrap integration adds ~568 lines of SCSS handling buttons, navigation, profile layouts, and responsive behavior.

## Considerations and constraints

- **Direct theme modification required** - No child themes or overrides. Changes go directly into `/themes/PaperMod/` and `/assets/scss/custom.scss`
- **Bootstrap 5 dependency must stay** - Custom SCSS relies on Bootstrap imports for grid, utilities, and component structure
- **Keep VantaJS animated background** - Core to current visual identity, new theme should work with or without it
- **Maintain existing layouts** - Content structure, navigation, profile mode, post listings stay in current positions. Only visual styling changes
- **Dark mode only** - Currently hard-coded as `defaultTheme: dark` with toggle disabled. Preserve this or make both modes work
- **Writing voice alignment** - Design should feel direct, technical, pragmatic (see WritingStyle.md). Avoid corporate polish or overly sleek aesthetics
- **9 custom layout files exist** - Any template changes need to work with custom shortcodes (audio, gallery, parallaxblur, etc.)
- **Performance considerations** - PaperMod is optimized for speed. Keep asset pipeline lightweight, avoid heavy frameworks beyond Bootstrap

## Solution options

1. **Minimal color palette refresh** – Keep existing structure, swap blue (#2b7fc7) for warmer accent colors, adjust gradient backgrounds. Fastest but may not achieve "stylish."
2. **Typography-first redesign** – Replace Inter with more distinctive typeface, adjust weights/spacing, refine button styles. Moderate effort, strong visual impact.
3. **Modern dark theme overhaul** – New color system (greyscale base + accent), simplified effects (reduce blur/shimmer), cleaner spacing. Achieves tech-y + stylish balance.
4. **Brutalist/minimal approach** – Strip glassmorphic effects, high-contrast monochrome with single accent, sharp edges. Bold but risks feeling cold/unapproachable.
5. **Component-by-component refinement** – Iteratively update buttons, navigation, cards, typography in sequence. Low risk, allows testing, but lacks cohesive vision upfront.

## Recommended solution

**Modern Dark Theme Overhaul with Typography Refinement** – Combine options 2 and 3 for comprehensive visual refresh that balances tech-y precision with approachable style.

### Why This Approach

- **Addresses root causes** – Current design's blue/corporate feel stems from color system AND heavy visual effects. Fixing both creates cohesive improvement
- **Typography provides quick wins** – Font changes deliver immediate visual impact with minimal risk. Sets foundation for color work
- **Simplified effects improve approachability** – Reducing blur/shimmer complexity makes design feel less "trying too hard," more confident and direct (aligns with WritingStyle.md voice)
- **Greyscale base + accent is proven** – Common pattern in modern dark themes (GitHub, Linear, Vercel). Tech-y without corporate blue
- **Works with VantaJS background** – Simplified overlays let animated background breathe instead of competing with gradients/blur
- **Low risk to layouts** – Pure styling changes in existing `/assets/scss/custom.scss` structure. No template modifications needed

### Implementation Plan

1. **Typography system update**
   - Research and select typeface that balances technical precision with warmth (consider: JetBrains Mono for code, Inter replacement for body)
   - Update font weights and hierarchy to create stronger visual structure
   - Adjust line-height, letter-spacing for improved readability

2. **Color system redesign**
   - Define new color palette: neutral greyscale base (#1a1a1a → #f5f5f5 range) + single vibrant accent
   - Map colors to semantic CSS variables (--text-primary, --text-secondary, --surface-elevated, --accent-primary, etc.)
   - Replace Bootstrap color overrides with new system while maintaining Bootstrap structure

3. **Component simplification**
   - Strip shimmer effects from buttons (lines 76-125), replace with clean hover states
   - Reduce glassmorphic blur effects on content cards (lines 462-475)
   - Simplify gradient backgrounds on navigation and post entries to solid or subtle gradients
   - Maintain hover animations but make them subtler (transform values)

4. **Visual refinement pass**
   - Update border-radius values for more consistent spacing rhythm
   - Refine spacing scale (padding/margins) for better breathing room
   - Adjust button and card shadows for depth without heaviness
   - Test contrast ratios to ensure accessibility (WCAG AA minimum)

5. **Testing and validation**
   - Build Hugo site locally and verify all pages render correctly
   - Test responsive behavior on mobile/tablet breakpoints
   - Verify custom shortcodes (gallery, audio, parallaxblur) still function
   - Validate VantaJS background integration

### Architecture

Following existing pattern in `/assets/scss/custom.scss`:

**Variables layer** (lines 1-41)
- Replace Bootstrap `$primary`, `$secondary` with new color values
- Update `:root` CSS custom properties to new semantic naming system
- Maintain Bootstrap import structure (line 18)

**Component overrides** (lines 42-568)
- Modify button styles (`.btn`, `.btn-shimmer`) to remove complex effects
- Update typography declarations (`body`, headings) with new fonts
- Simplify background/blur properties on content containers
- Preserve layout structure (grid, flexbox) while refining visual properties

**PaperMod integration** (line 40)
- Continue overriding `--theme: transparent` to work with VantaJS
- Maintain compatibility with PaperMod's CSS variable system in `/themes/PaperMod/assets/css/core/theme-vars.css`

### Files to Create/Modify

**Primary modification:**
- `/assets/scss/custom.scss` – Complete color system, typography, and component style updates (~200-300 lines changed out of 567 total)

**Reference (read-only during implementation):**
- `/themes/PaperMod/assets/css/core/theme-vars.css` – PaperMod's base variables to ensure compatibility
- `/themes/PaperMod/assets/css/common/*.css` – Component styles to understand override requirements
- `/hugo.yaml` – Verify theme config (defaultTheme, disableThemeToggle) still appropriate

**Testing targets:**
- `/layouts/partials/extend_head.html` – May need to update font CDN imports
- `/layouts/shortcodes/*.html` – Verify custom shortcodes render correctly with new styles
- Homepage (`/`), blog listing (`/blog`), individual posts – Visual QA across all page types

## Implementation Steps

### 1. Typography System Update

**Objective:** Replace Inter font with more distinctive typeface, update weights and hierarchy

**Actions:**
- Research and select body font (consider: Space Grotesk, DM Sans, or keep Inter with adjusted weights)
- Select monospace font for code blocks (consider: JetBrains Mono, Fira Code, or Berkeley Mono)
- Update Google Fonts import in `/layouts/partials/extend_head.html` lines 8-11
- Modify SCSS variables in `/assets/scss/custom.scss` lines 13-15:
  - Change `$font-family-sans-serif` to new body font
  - Update `$font-weight-normal` from 300 to 400 (less spindly, more readable)
  - Keep or adjust `$headings-font-weight` at 600
- Update `code` font-family at line 401 if changing monospace font
- Add letter-spacing adjustments to body (consider -0.01em for tighter, more technical feel)

**Testing:**
- Build site with `npm run build` and verify font loads
- Check homepage, blog listing, and individual post for readability
- Test on mobile to ensure font size/weight works at small sizes

---

### 2. Color System Redesign

**Objective:** Replace blue color system with greyscale base + single vibrant accent

**Actions:**
- Define new color palette (example values, adjust to preference):
  - Accent: `#00e5ff` (cyan), `#7c3aed` (purple), or `#10b981` (green)
  - Background: `#0a0a0a` (near black)
  - Surface: `#1a1a1a` (elevated backgrounds)
  - Border: `#2a2a2a` (subtle borders)
  - Text primary: `#e5e5e5` (high contrast)
  - Text secondary: `#a3a3a3` (muted text)
- Update Bootstrap SCSS variables (lines 2-10):
  - Replace `$primary` from #2b7fc7 to new accent color
  - Keep `$secondary`, `$success`, etc. for utility (rarely used in current design)
- Update CSS custom properties in `:root` block (lines 21-41):
  - Replace `--bs-background` from `rgb(16 40 56)` to `#0a0a0a` or similar
  - Replace `--bs-text-color` from `#eee` to `#e5e5e5`
  - Replace `--bs-light-text-color` from `#fff` to `#a3a3a3`
  - Replace `--bs-border-color` from `#444` to `#2a2a2a`
  - Update `--bs-primary` and `--bs-primary-light` to new accent colors
- Update gradient backgrounds throughout file:
  - Navigation (lines 191-194): Replace blue gradient with solid or subtle grey gradient
  - Content cards (lines 465-468): Replace blue gradient with simple surface color or minimal gradient
  - Post entries (lines 479-482): Simplify to solid background with border

**Testing:**
- Build and visually inspect all page types
- Check contrast ratios with online tool (aim for WCAG AA: 4.5:1 for body text, 3:1 for large text)
- Verify VantaJS background shows through appropriately

---

### 3. Component Simplification

**Objective:** Remove shimmer effects, reduce glassmorphic blur, simplify hover states

**Actions:**
- **Buttons (lines 59-156):**
  - Remove entire `.btn-shimmer` class (lines 76-125) and `.btn-shimmer-success` (lines 128-140)
  - Simplify `.btn` hover from `transform: translateY(-3px)` to `translateY(-1px)` for subtlety
  - Add simple hover state: background color shift and/or border color change
  - Keep active state but reduce scale from 0.98 to 0.99
- **Content backgrounds (lines 462-475):**
  - Remove `backdrop-filter: blur(10px)` from `.post-single`, `.home-info`, `.home-profile .post-content`
  - Simplify gradient to solid background with slight transparency: `rgba(26, 26, 26, 0.95)`
  - Keep border and shadow for depth
- **Post entry cards (lines 373-385):**
  - Reduce hover transform from `translateY(-3px)` to `translateY(-2px)`
  - Simplify box-shadow values (less dramatic)
- **Navigation (lines 188-199):**
  - Consider solid background instead of gradient
  - Keep rounded bottom corners for visual interest

**Testing:**
- Interact with buttons, cards, and navigation to verify hover states feel polished but understated
- Check performance (blur effects can be GPU-intensive on some devices)

---

### 4. Visual Refinement Pass

**Objective:** Polish spacing, borders, shadows for cohesive modern aesthetic

**Actions:**
- **Border radius consistency:**
  - Review all `border-radius` values in file (currently mix of 6px, 8px, 10px, 12px)
  - Standardize to scale: 4px (small), 8px (medium), 12px (large)
  - Update buttons (line 60), cards (line 376), profile elements (line 251), etc.
- **Spacing refinement:**
  - Review padding/margin values for consistent rhythm
  - Consider increasing breathing room: `.main` padding (line 55), content padding (line 470)
  - Ensure mobile responsive spacing scales appropriately (lines 406-443)
- **Shadow adjustments:**
  - Standardize shadow depths (currently varied across components)
  - Define shadow scale: `0 2px 4px rgba(0,0,0,0.1)` (subtle), `0 4px 8px rgba(0,0,0,0.15)` (medium), `0 8px 16px rgba(0,0,0,0.2)` (elevated)
  - Apply consistently to cards, navigation, profile images
- **Profile image border (line 274):**
  - Update from `rgba(255, 255, 255, 0.2)` to match new border color system

**Testing:**
- Visual QA across all pages for consistent spacing and depth
- Use browser DevTools to inspect computed styles and verify consistency

---

### 5. Testing and Validation

**Objective:** Ensure all changes work across devices, browsers, and with existing customizations

**Actions:**
- **Build and local testing:**
  - Run `npm run build` to compile SCSS and generate static site
  - Run `npm run dev` to start Hugo dev server
  - Navigate to `localhost:1313` and test:
    - Homepage with profile layout
    - Blog listing page
    - Individual blog posts
    - All custom shortcodes (check posts using audio, gallery, parallaxblur)
- **Responsive testing:**
  - Test mobile breakpoints (< 600px, 600-900px)
  - Verify navigation, profile layout, and touts grid adapt correctly
  - Check font sizes remain readable on small screens
- **Browser compatibility:**
  - Test in Chrome, Firefox, Safari
  - Verify CSS custom properties work (should be fine, widely supported)
  - Check VantaJS background renders correctly
- **Accessibility validation:**
  - Run contrast checker on text/background combinations
  - Verify focus states on interactive elements (buttons, links)
  - Test keyboard navigation through site
- **Performance check:**
  - Compare Lighthouse scores before/after (aim to maintain or improve)
  - Verify removal of blur effects doesn't cause visual issues
  - Check font load performance (preconnect already in place at lines 6-7)

**Expected outcomes:**
- All pages render correctly with new theme
- No layout shifts or broken styles
- Custom shortcodes function without visual regressions
- Responsive breakpoints work smoothly
- Accessibility scores meet WCAG AA standards
- VantaJS background integrates cleanly with simplified overlays

---

### Files Modified Summary

1. **`/layouts/partials/extend_head.html`** (lines 8-11)
   - Update Google Fonts import with new typeface(s)
   - May add additional preconnect if using different font provider

2. **`/assets/scss/custom.scss`** (primary file, ~200-300 lines changed)
   - Variables section (lines 1-41): New color palette, typography settings
   - Button styles (lines 59-156): Simplified hover states, removed shimmer
   - Navigation (lines 188-199): Simplified gradient or solid background
   - Content backgrounds (lines 462-475): Removed blur, simplified gradients
   - Post entries (lines 373-385, 479-482): Updated colors and hover effects
   - Throughout: Border radius, spacing, shadow consistency updates

3. **Build files (generated, not edited):**
   - `/public/css/bootstrap-custom.css` - Auto-generated from SCSS
   - Hugo static site output in `/public/` - Verify visually, no direct edits
