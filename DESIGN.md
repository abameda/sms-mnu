---
name: MNU Student Management System
description: Premium, dynamic, efficient academic operations for Minya National University.
colors:
  primary-blue: "#2563eb"
  primary-blue-soft: "#eff6ff"
  primary-blue-strong: "#1e40af"
  institutional-surface: "#f9fafb"
  content-surface: "#ffffff"
  text-strong: "#111827"
  text-muted: "#6b7280"
  border-subtle: "#e5e7eb"
  success: "#16a34a"
  success-soft: "#f0fdf4"
  warning: "#d97706"
  warning-soft: "#fffbeb"
  danger: "#dc2626"
  danger-soft: "#fef2f2"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.05em"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-blue}"
    textColor: "{colors.content-surface}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-secondary:
    backgroundColor: "{colors.content-surface}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  card:
    backgroundColor: "{colors.content-surface}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.content-surface}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  badge-primary:
    backgroundColor: "{colors.primary-blue-soft}"
    textColor: "{colors.primary-blue-strong}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.75rem"
---

# Design System: MNU Student Management System

## 1. Overview

**Creative North Star: "The Academic Control Room"**

The interface is an operational academic control room: calm enough for long administrative sessions, premium enough to carry university authority, and dynamic enough to make academic progress feel alive. It serves admins, student affairs staff, and students with the same discipline: make status, records, and next actions visible without burying users in ERP density.

The current visual system is a restrained product UI built from Inter, cool blue primary actions, pale gray work surfaces, white content panels, compact tables, pill badges, and short state transitions. The design direction should keep that operational familiarity while sharpening the premium feel through contrast, rhythm, bilingual layout discipline, and color-blind-safe status treatment.

It explicitly rejects the anti-references in PRODUCT.md: a dense legacy ERP, a generic AI-generated Bootstrap template, a boring or childish academic portal, cheapness, and clutter.

**Key Characteristics:**
- Premium through precision, not ornament.
- Dynamic through state, progress, and motion feedback, not decorative choreography.
- Efficient through predictable navigation, compact tables, and low-friction forms.
- Bilingual by construction, with RTL/LTR layout parity treated as a core component requirement.
- High contrast with semantic redundancy so grades, attendance, and risk states are never color-only.

## 2. Colors

The palette is a restrained institutional system: cool blue for primary action and selection, clean neutral surfaces for record work, and semantic colors reserved for status.

### Primary
- **Command Blue**: The primary action, active navigation, focus ring, transcript header, selected segmented controls, and link color. Use it for decisive system actions, not decoration.
- **Command Blue Wash**: The selected row hover, active sidebar item, information badge, and low-emphasis blue surface. Use it to show context without competing with data.
- **Deep Command Blue**: The hover and strong-state companion for primary buttons and important active states.

### Secondary
- **Operational Gray**: The neutral text, inactive navigation, secondary buttons, filters, table headers, and quiet scaffolding around the task.

### Tertiary
- **Progress Green**: Success, active student status, positive trends, and completed actions.
- **Attention Amber**: Warnings, incomplete data, pending conditions, and values that need review.
- **Critical Red**: Errors, destructive actions, suspended status, validation failure, and irreversible risk.

### Neutral
- **Institutional Canvas**: The app background. It keeps long work sessions light and quiet.
- **Record Surface**: Cards, modals, forms, transcript sheets, and table containers.
- **Ink Text**: Primary text, data values, headings, and transcript content.
- **Muted Text**: Labels, helper copy, metadata, placeholder-adjacent text, and quiet counts.
- **Subtle Rule**: Borders, dividers, form strokes, table separators, and card outlines.

### Named Rules

**The Status Redundancy Rule.** Critical academic data must never rely on color alone. Pair semantic color with text, icon, label, position, or shape.

**The Accent Scarcity Rule.** Command Blue is for action, selection, focus, and official emphasis. Do not use it as page decoration.

**The Dark Mode Contract.** Any dark mode must preserve WCAG AA contrast and keep semantic states distinct for color-blind users before it is considered complete.

## 3. Typography

**Display Font:** Inter, with system-ui fallback.
**Body Font:** Inter, with system-ui fallback.
**Label/Mono Font:** Inter, with system-ui fallback. There is no separate mono language in the current product.

**Character:** The typography is direct, modern, and operational. It uses one sans family so dashboards, forms, tables, badges, reports, and transcripts feel like one product rather than a stitched collection of screens.

### Hierarchy
- **Display** (700, 1.5rem, 1.25): Page titles such as Students, Grade Management, and primary dashboard headings.
- **Headline** (700, 1.25rem, 1.3): Transcript titles, student names, and high-importance content headers.
- **Title** (600, 1.125rem, 1.35): Modal titles, section headings, and card titles.
- **Body** (400, 0.875rem, 1.5): Form values, table content, descriptions, metadata, and standard UI text. Prose should stay within 65-75ch when it appears outside tables.
- **Label** (600, 0.75rem, 0.05em tracking when uppercase): Table headers, badges, compact metadata labels, and transcript field labels.

### Named Rules

**The Data First Rule.** Tables, forms, and transcripts use compact type and clear weight shifts. Do not introduce display styling into labels, buttons, or data cells.

**The Bilingual Fit Rule.** Arabic and English labels must be tested in the same components. Do not shrink type until Arabic fits; adjust layout, wrapping, and alignment first.

## 4. Elevation

The system uses a hybrid of tonal layering and light structural shadows. Most surfaces are separated by borders and neutral backgrounds; shadow appears on cards, modals, and toasts to clarify stack order. Depth should stay quiet because academic records need credibility more than spectacle.

### Shadow Vocabulary
- **Surface Low** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)`): Standard cards and dashboard statistic panels.
- **Surface Raised** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): Inline content panels that need slight separation.
- **Overlay High** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Modals and transient overlays.
- **Toast High** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Alert toasts and temporary feedback.

### Named Rules

**The Official Paper Rule.** Transcript and record surfaces should feel like official paper inside software: bordered, stable, printable, and never glassy.

**The Flat Until Needed Rule.** Default surfaces are bordered and tonal. Add shadow only when stack order, hover feedback, or overlay hierarchy needs it.

## 5. Components

### Buttons

Buttons are compact, direct, and task-focused.

- **Shape:** Gently curved rectangle (0.5rem radius).
- **Primary:** Command Blue background with white text, medium weight, 0.5rem vertical padding and 1rem horizontal padding.
- **Hover / Focus:** Primary hover deepens to Deep Command Blue. Focus uses a visible 2px Command Blue ring. Active state scales to 0.98.
- **Secondary / Ghost / Tertiary:** White or transparent surface, Subtle Rule border when needed, Operational Gray text, and gray hover wash. Destructive buttons use Critical Red only for confirmed destructive action.

### Chips

Chips are status labels, not decoration.

- **Style:** Pill radius, compact padding, 0.75rem label text, semibold weight.
- **State:** Status chips use semantic soft backgrounds and strong text. Role chips use blue or info treatment. Each status must include readable text, not color alone.

### Cards / Containers

Cards are restrained work surfaces.

- **Corner Style:** Soft institutional corners (0.75rem radius).
- **Background:** Record Surface on Institutional Canvas.
- **Shadow Strategy:** Surface Low for dashboard cards; border-only for denser tables and forms when possible.
- **Border:** Subtle Rule border.
- **Internal Padding:** 1.5rem for cards, 1.25rem for filter panels, 1rem for dense table controls.

### Inputs / Fields

Fields are practical and consistent across forms, filters, and search.

- **Style:** White background, Subtle Rule border, 0.5rem radius, 0.875rem text, 0.5rem vertical padding.
- **Focus:** 2px Command Blue ring with no outline conflict.
- **Error / Disabled:** Errors use Critical Red border plus inline error text. Disabled fields reduce opacity and keep visible labels.

### Navigation

Navigation uses a familiar product shell: fixed sidebar on large screens, slide-in sidebar on smaller screens, sticky header, role-aware links, and compact identity blocks.

Sidebar active items use Command Blue Wash and Deep Command Blue text. Inactive items use Operational Gray and a quiet gray hover wash. Header search appears only for roles that can search students. The logo block should keep the Minya National University mark visible without turning navigation into a marketing header.

### Data Tables

Tables are the core operational surface.

Headers use uppercase label type, gray background, and sortable affordances. Rows alternate with a faint neutral tint and use blue wash on clickable hover. Empty states include an icon, a short title, and one useful sentence.

### Modals and Toasts

Modals are reserved for focused secondary tasks. They use a high overlay shadow, 1rem radius, a clear title bar, and 150-200ms opacity/transform transitions. Toasts appear bottom-end, carry semantic iconography, and use short messages. In RTL layouts, toast placement and transform direction must mirror.

### Transcript

The transcript is a signature official document component. It uses a blue institutional header, university logo, structured student metadata, semester tables, GPA summaries, and print/PDF export affordances. It must remain legible in print and retain official visual hierarchy when exported.

## 6. Do's and Don'ts

### Do:
- **Do** keep the product register clear: app shell, side navigation, sticky header, compact forms, and predictable tables.
- **Do** preserve the premium, dynamic, efficient personality through spacing precision, responsive feedback, and low cognitive load.
- **Do** support full Arabic/English switching with layout mirroring, logical alignment, mirrored icons where directional, and tested table overflow in both directions.
- **Do** meet WCAG AA contrast across light and dark themes.
- **Do** pair all critical status colors with text, icons, labels, or shape.
- **Do** keep Command Blue reserved for action, selection, focus, and official emphasis.
- **Do** use skeletons or structured loading states for content areas when possible, especially tables and dashboards.

### Don't:
- **Don't** make this feel like a dense legacy ERP.
- **Don't** make this feel like a generic AI-generated Bootstrap template.
- **Don't** make this feel like a boring or childish academic portal.
- **Don't** make the interface feel cheap or cluttered.
- **Don't** add decorative effects that make records, grades, attendance, reports, or transcripts harder to scan.
- **Don't** use color alone to communicate grade, attendance, status, risk, success, or error.
- **Don't** add colored side-stripe borders, gradient text, decorative glassmorphism, hero-metric templates, or repeated identical card grids.
- **Don't** introduce inconsistent button, input, badge, or table styling between admin, student affairs, and student surfaces.
