# Forming Monitor Layout Design

Date: 2026-05-20
Project: Forming Machine Operations Monitor
Status: Approved for implementation planning

## Goal

Adapt the current dashboard for desktop and laptop use while preserving the existing enterprise-style formula:

- top bar
- left operational sidebar
- central floor map as the primary work area
- machine selection modal/details

The design must not change machine placement logic, map interaction model, or the cream/gold industrial visual direction.

## Problem Statement

The current screen was tuned for a fixed 1920x1080 wallboard-style layout. That creates three usability issues on PC and laptop:

1. Important sidebar and metadata text is too small for comfortable desktop viewing.
2. The fixed-width sidebar consumes valuable map space even when users do not need its content.
3. New users may not understand machine type illustrations immediately, but adding persistent type labels to every tile would make the map noisier.

## Design Principles

- Preserve the existing enterprise dashboard structure rather than redesigning the product.
- Keep the floor map as the primary visual and operational focus.
- Improve readability before adding more UI surface area.
- Keep machine tiles visually clean.
- Teach machine type meaning through reference UI, not repeated labels on every tile.
- Ensure any new behavior can evolve into a mobile pattern later without changing desktop mental models.

## Chosen Direction

Use a balanced enterprise layout with a collapsible left sidebar.

This direction keeps the current formula but improves space management and clarity:

- desktop/laptop default state is sidebar open
- sidebar can collapse to a slim rail
- center map expands when the sidebar collapses
- machine cards remain clean: picture + machine ID + status
- machine type meaning moves into a sidebar reference section rather than permanent per-tile labels

## Information Architecture

### Top Bar

Keep the top bar fixed and shallow.

It should contain:

- product/page title
- live/system status
- sidebar toggle control

It should not absorb operational detail that belongs in the sidebar or map.

### Left Sidebar

The left sidebar remains the secondary operational support area.

Open-state content order:

1. Summary
2. Status Legend
3. Machine Types
4. Actions

#### Summary

The summary block should show only the most important counts:

- total machines
- running
- down
- no plan or other top operational exception

Use one highlighted KPI at most. Avoid stacking many large KPI cards because that competes with the map.

#### Status Legend

Status legend remains permanently visible in the open sidebar because status meaning is operationally critical and must be quickly scannable.

#### Machine Types

Machine type explanation should live in a collapsible section labeled something like `Machine Types`.

This section contains:

- small machine illustration sample
- machine type name only
- optional one short supporting note if necessary

It must not list machine IDs. The purpose is to explain icon meaning, not inventory.

#### Actions

Administrative actions stay near the bottom:

- import
- export
- edit-layout

This keeps actions available without competing with operational scanning.

### Collapsed Sidebar

The collapsed state should become a slim rail, not full hide.

Recommended width: 64-72px.

The rail should expose only a few anchors:

- Summary
- Status
- Types
- Actions

Selecting an anchor re-expands the sidebar. The rail should not attempt to show full legend details.

The sidebar should remember whether the `Machine Types` section was open or closed when the user reopens it.

### Center Map Area

The floor map remains the primary work canvas.

Requirements:

- no changes to machine placement logic
- no changes to the overall map mental model
- expand available width when the sidebar collapses
- keep interaction behavior consistent with current selection/edit flows

## Machine Tile Design

The existing machine illustration style is preserved.

The map tile should continue to show:

- machine picture
- machine ID, such as `C01`, `C02`
- status indicator

The tile should not display persistent machine type text like `FORMING`, `DESMA`, `INJ`, or `TRANSFER`.

Reason:

- repeated type labels would clutter the map
- the current illustration language has value and should remain visually prominent
- type meaning is better handled in a reference panel, hover treatment, or modal

## Machine Type Reference Strategy

Machine type explanation must remain easy to discover, but should not live on every tile.

Primary reference location:

- sidebar `Machine Types` collapsible section

Optional secondary reference locations:

- tooltip on hover for desktop
- machine modal on selection

The design must avoid a picture-only system with no explanation path. New users need one clear place to learn the icon set.

## Typography

Typography should be adjusted for desktop/laptop readability.

Recommended scale:

- page title: 24-28px
- section titles: 18-20px
- emphasized KPI values: 18-22px
- normal labels/controls: 13-14px
- secondary metadata: 11-12px

Avoid using 8-10px text for core operational UI except for truly minor helper text.

Specific application to current layout:

- increase top-bar subtitle slightly
- increase filter and legend readability
- keep machine IDs strong and readable
- reduce reliance on ultra-small uppercase captions in the sidebar

## Motion and Interaction

Sidebar transition should be restrained and enterprise-safe.

Recommended behavior:

- duration: 220-260ms
- smooth width/transform transition
- map area expands and contracts in sync with the sidebar
- no dramatic motion, bounce, or decorative animation

## Visual Style

Keep the current cream/gold industrial theme.

Do not shift toward a blue-accent corporate SaaS style.

Design characteristics to preserve:

- cream/paper surfaces
- gold accents
- dark ink text
- refined industrial tone

Visual adjustments may improve spacing, contrast, and readability, but should not replace the current visual identity.

## Mobile Adaptation Later

Mobile is future scope, not part of the immediate desktop implementation, but current decisions should support it.

Planned adaptation path:

- desktop collapsible sidebar becomes a mobile drawer
- map remains part of the experience, but detail density will need reduction
- reference content such as `Machine Types` can stay inside the drawer/accordion pattern

This avoids creating a desktop behavior that must be thrown away later.

## Non-Goals

- redesigning the application into a new SaaS-style dashboard
- changing machine placement logic
- replacing machine illustrations with photos
- adding machine type labels to every tile by default
- changing the current modal-driven detail workflow

## Implementation Implications

Expected code areas affected:

- `src/components/Dashboard.jsx`
- `src/components/Sidebar.jsx`
- `src/components/FloorMap.jsx`
- `src/styles.css`

Likely implementation themes:

- sidebar open/collapsed state management
- sidebar section/accordion behavior
- typography scale cleanup
- map area width adjustments tied to sidebar state
- machine-type reference content in sidebar

## Validation Criteria

The design is successful if:

- the dashboard still feels like the same enterprise product
- laptop users can read core text without strain
- collapsing the sidebar gives the map noticeably more room
- machine tiles stay visually clean
- a new user can learn machine type meaning from the sidebar without needing labels on every tile
- no machine layout behavior is broken or conceptually changed
