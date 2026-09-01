---
name: Precision Engineering Interface
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#424752'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#727784'
  outline-variant: '#c2c6d4'
  surface-tint: '#115cb9'
  primary: '#003f87'
  on-primary: '#ffffff'
  primary-container: '#0056b3'
  on-primary-container: '#bbd0ff'
  inverse-primary: '#acc7ff'
  secondary: '#476083'
  on-secondary: '#ffffff'
  secondary-container: '#bdd6ff'
  on-secondary-container: '#445d80'
  tertiary: '#3c405a'
  on-tertiary: '#ffffff'
  tertiary-container: '#535773'
  on-tertiary-container: '#cbceee'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#afc8f0'
  on-secondary-fixed: '#001c3a'
  on-secondary-fixed-variant: '#2f486a'
  tertiary-fixed: '#dee0ff'
  tertiary-fixed-dim: '#c1c4e5'
  on-tertiary-fixed: '#161a32'
  on-tertiary-fixed-variant: '#414560'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is built for the high-precision world of additive manufacturing and industrial engineering. The brand personality is **Innovative, Precise, Reliable, and Specialized**. It bridges the gap between raw industrial power and sophisticated digital control.

The aesthetic follows a **High-Tech Minimalist** movement. It prioritizes clarity, structural integrity, and functional beauty. By utilizing generous whitespace and a "form follows function" philosophy, the UI reflects the cleanliness of a high-end laboratory environment. Visual elements should incorporate high-quality CAD renders, technical schematics, and macro-photography of precision-engineered components to reinforce the specialized nature of the product.

## Colors

The palette is rooted in industrial reliability and technical clarity. 

- **Primary Blue (#0056B3):** A sophisticated, high-visibility blue used exclusively for primary actions, critical data points, and active states. It suggests digital intelligence and precision.
- **Deep Navy (#001F3F):** Used for structural navigation and grounding elements. It provides an "executive" weight to the interface.
- **Slate Gray (#4A4E69):** Utilized for secondary information, meta-data, and technical labels.
- **Black (#000000):** Reserved for high-contrast typography and sharp architectural borders.
- **White (#FFFFFF):** The dominant background color to maximize legibility and create a clinical, high-tech lab feel.

## Typography

The typography system uses **Inter** for its neutral, highly legible, and modern characteristics. It scales perfectly from large display headlines to dense body copy. To emphasize the engineering aspect, **JetBrains Mono** is introduced for labels, technical data, and "read-out" metrics, mimicking the output of industrial machinery.

- **Headlines:** Should be tight and authoritative.
- **Data Display:** Always use the monospaced utility font for numerical values (dimensions, tolerances, coordinates) to ensure column alignment and a technical feel.
- **Case Usage:** Use Sentence case for almost all UI elements except for "Label-Caps," which should be used for category tags or status indicators.

## Layout & Spacing

The layout is built on a **12-column fixed grid** for desktop, ensuring that technical diagrams and data tables remain structured and balanced. 

- **Engineering Rhythm:** Use a strict 8px baseline grid. All margins and paddings must be multiples of 8 to maintain mathematical consistency.
- **Whitespace:** Use "generous" whitespace (the `xl` unit) to separate distinct functional blocks, preventing the dense engineering data from feeling overwhelming.
- **Mobile Adaptivity:** On mobile, the grid collapses to 4 columns with 16px margins. Content cards should be full-width to prioritize the legibility of technical details.

## Elevation & Depth

To maintain a "sharp" and modern engineering aesthetic, this design system avoids heavy shadows.

- **Low-Contrast Outlines:** Instead of shadows, use 1px solid borders in `#E5E7EB` or `#000000` (at 10% opacity) to define surfaces.
- **Tonal Layers:** Use subtle shifts in background color (`#F8F9FA` vs `#FFFFFF`) to differentiate between navigation sidebars and main content areas.
- **Active Elevation:** When an element is focused or active, use a crisp 2px border in the Primary Blue rather than a shadow. This reinforces the "precision" brand trait.

## Shapes

The shape language is strictly **Sharp (0px roundedness)**. 

Every UI element—from buttons and input fields to large cards and containers—must feature 90-degree corners. This evokes the feeling of machined parts, blueprints, and architectural precision. Circular elements should only be used for status indicators or profile avatars to provide a clear visual contrast to the structural UI.

## Components

### Buttons
- **Primary:** Solid `#0056B3` with white text. Sharp corners. No gradients.
- **Secondary:** Transparent background with a 1px `#000000` border.
- **Ghost:** Text-only with a subtle gray hover state. Use for low-priority technical actions.

### Technical Inputs
- **Text Fields:** 1px `#000000` border. Label sits above in `Label-Caps`.
- **Numeric Steppers:** Specialized inputs for dimensions, featuring "plus" and "minus" buttons integrated into the field border.

### Status Indicators
- Use a small, solid square (not a dot) to indicate status:
  - Blue: Processing/Active
  - Black: Standby
  - Gray: Offline

### Technical Cards
- White background, 1px black border (10% opacity). 
- Header section should be separated by a 1px horizontal rule.
- Use for grouping CAD thumbnails or sensor data.

### Data Tables
- No vertical lines.
- Light gray horizontal dividers (`#F1F1F1`).
- All numerical data must use the `mono-data` typography role for vertical alignment of decimals.