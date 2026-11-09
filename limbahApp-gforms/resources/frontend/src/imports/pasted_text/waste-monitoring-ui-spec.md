Design a desktop UI (not mobile) for a web application that monitors waste at a
facility. The layout should take advantage of desktop screen width — use a left
sidebar for navigation (not a bottom navigation bar like on mobile), and arrange
content in a more spacious multi-column grid.

## Page Structure (Sidebar Navigation — 4 items only)
- Dashboard
- Hazardous Waste (B3)
- Domestic Waste
- Settings

## 1. Dashboard Page

Top header: page title, search widget, year filter dropdown, notification bell
icon, user profile.

For each waste category (B3 In, B3 Out, Domestic Morning, Domestic Afternoon —
or whichever categories apply), display:
- Summary card: icon, label, large number, percentage change badge (up/down)
  compared to the previous period.
- Bar chart — one bar per individual entry, ordered chronologically from oldest
  to newest.
- Pie chart — internal breakdown of that category (B3 In: by source; B3 Out: by
  disposal/handover destination; Domestic: by Organic/Inorganic).
- Trend chart with a toggle to switch between weekly, monthly, and yearly view.

For desktop, arrange the summary card and the three visualizations (bar - pie -
trend) of each category side by side in one row, taking advantage of the
available screen width. Each category becomes one section with a section
title, then the user scrolls down to the next category.

Cards and charts should be clickable to open a quick-preview (side panel/modal
on desktop), with a button to open the full detail page.

## 2. Hazardous Waste (B3) Detail Page

- A full table/list of all B3 waste transactions (in & out), showing more
  columns at once (date, amount, type/source/destination, status), taking
  advantage of desktop width.
- The same bar chart, pie chart, and trend chart as on the Dashboard, but a
  more detailed version (e.g. more granular breakdown, freely adjustable date
  range rather than only weekly/monthly/yearly).
- A prominent alert/warning section for waste that is approaching or has
  already exceeded its maximum storage limit — placed near the top of the
  page, either as a banner or a separate panel, with color indicators
  (green/yellow/red) based on urgency.
- A recent activity history section related to B3 waste.
- Search/filter functionality for the table (by date, category, source,
  destination, status).

## 3. Domestic Waste Detail Page

- A full table/list of all domestic waste transactions, with columns for date,
  amount, session (Morning/Afternoon), type (Organic/Inorganic), status.
- A filter to select the session (Morning/Afternoon).
- The same detailed bar chart, pie chart, and trend chart as on the Dashboard
  (with the weekly/monthly/yearly toggle).
- A recent activity history section related to domestic waste.
- Search/filter functionality for the table (by date, session, type).

## 4. Settings Page

- Language switcher (multi-language — see the full list in the "Language
  System" section below).
- Theme switcher (see the full list in the "Theme System" section below),
  including light/dark mode.
- Notification settings (on/off).
- Help/support.

For desktop, arrange this as a settings form with a two-column layout or a more
spacious settings list (not a narrow menu list like the mobile version).

## 5. Notifications

- A bell icon in the header that, when clicked, opens a dropdown panel showing
  recent notifications (instead of a full page like on mobile) — a common
  desktop app pattern.
- Notifications appear for new activity across all waste categories (B3 In, B3
  Out, Domestic).

## 6. Theme System

Provide several selectable visual themes, each genuinely distinct visually
(not just a different accent color):

- **Frosted Glass** — blurred/frosted surfaces with soft transparency, suited
  to cards and panels.
- **Liquid Glass** — a more dynamic/glossy glassmorphism effect with light
  highlights and subtle refraction.
- **Flat** — flat design with no excessive shadows/gradients, solid colors,
  crisp lines.
- **High-Contrast** — high contrast for accessibility, sharp colors, large
  and clear text.
- **Night City** — a dark theme with a neon/cyberpunk feel, bright accent
  colors on a dark background.
- **Corporate/Office** — a formal, professional theme, neutral colors (gray,
  navy blue), minimal decoration, suited to a formal work environment.

Each theme should be available in both light and dark mode (except where a
theme is inherently dark by design, such as Night City). For dark mode, also
provide an **AMOLED black** option (a true, deep black background rather than
dark gray) as a power-saving variant for OLED screens.

## 7. Language System

Provide a language switcher with the following list:
- Indonesian
- English (US)
- English (UK)
- Mandarin (Simplified Chinese)
- Arabic (include RTL — right-to-left — layout support)
- Japanese
- Old-Style Indonesian ("Indonesia Djaman Doeloe" — an archaic/classic style
  of Indonesian, included as an easter egg/stylistic option — not a standard
  formal language)
- Dutch
- French
- Portuguese
- Spanish

All UI labels, system messages, menu names, and status text should go through
an i18n system so they can easily be translated into all the languages above.
For Arabic, make sure the layout fully supports RTL (sidebar, tables,
directional icons, etc.).

## 8. Splash Screen

Show a brief splash screen when the app first loads, containing the app's
logo/branding and a loading indicator, before entering the Dashboard. The
splash screen should adapt to the user's currently active theme (e.g. an
AMOLED-dark version of the splash screen when a dark theme is active).

## 9. Device Detection (Responsive)

The UI should detect the type of device (desktop, tablet, mobile) and screen
size, then adapt automatically:
- Desktop: full left sidebar, multi-column grid, charts side by side.
- Tablet: sidebar can collapse to icons only, grid adjusts to 2 columns.
- Mobile: navigation switches to a bottom navigation bar, charts stack
  vertically, tables simplify to a summarized row per entry.

## 10. Content Principles (apply to all pages)

- All numbers shown in the design should look like realistic data (not
  obviously round sample numbers like 100%/50%/25%) — if placeholder data is
  needed for design purposes, mark it clearly as a placeholder.
- Also include designs for empty states (e.g. "No storage deadline data yet"
  for waste that doesn't have a storage limit date recorded) and loading
  states, so these aren't missed during implementation later.

## Visual Style

Modern, clean, cards with rounded corners, consistent and distinct colors per
category (In/Out/Morning/Afternoon) across all charts so they're easy to
recognize at a glance. Suited for professional/operational users (not an
overly playful consumer style) — except when the Night City theme is
selected, where it can be more visually expressive as long as it stays
functional.

Start with a low-fidelity wireframe of the Dashboard page structure first (the
most complex page), then move on to the other pages.