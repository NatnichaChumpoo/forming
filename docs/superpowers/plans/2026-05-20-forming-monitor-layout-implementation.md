# Forming Monitor Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible enterprise-style left sidebar, improve desktop/laptop readability, and move machine-type explanation into a sidebar reference section without changing machine placement or map behavior.

**Architecture:** Keep the current `Dashboard -> Sidebar -> FloorMap -> MachineModal` structure intact. Add sidebar state in `Dashboard.jsx`, render an open panel or slim rail through `Sidebar.jsx`, source machine-type reference data from `machines.js`, and use CSS class/state changes in `styles.css` to resize the map and improve typography.

**Tech Stack:** React 18 UMD globals, Babel Standalone JSX scripts, plain CSS, static HTTP server for browser verification

---

## File Map

- Modify: `src/components/Dashboard.jsx`
  - Own sidebar collapse state.
  - Add topbar toggle control.
  - Pass open/collapsed props into `Sidebar`.
  - Switch the main grid/container classes when the sidebar collapses.

- Modify: `src/components/Sidebar.jsx`
  - Render open-state sections in the approved order.
  - Render the collapsed rail with anchors.
  - Add `Machine Types` accordion state and machine reference content.
  - Keep import/export actions in the bottom section.

- Modify: `src/data/machines.js`
  - Add a small machine-type reference list keyed to the existing illustration/category language so `Sidebar.jsx` does not invent labels inline.

- Modify: `src/styles.css`
  - Add collapsed/open sidebar sizing and transitions.
  - Increase operational text sizes to desktop-friendly values.
  - Add accordion, rail, and reference-card styles.
  - Keep the cream/gold industrial theme.

- Verify manually via browser:
  - `index.html`
  - no code changes planned

## Task 1: Wire Sidebar Collapse State Through Dashboard

**Files:**
- Modify: `src/components/Dashboard.jsx`
- Modify: `src/styles.css`
- Test: browser smoke check via `python -m http.server 8080`

- [ ] **Step 1: Add the failing UI state hook and layout props in `Dashboard.jsx`**

Add a dedicated sidebar collapse state next to the existing dashboard state so the view can distinguish `editMode` from `sidebarCollapsed`.

```jsx
function Dashboard() {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [partNos,  setPartNos]  = useState({});
  const [selected, setSelected] = useState(null);
  const [now,      setNow]      = useState(new Date());
  const [editMode, setEditMode] = useState(false);
  const [machines, setMachines] = useState(() => MACHINES.map(m => ({ ...m })));
  const [drag,     setDrag]     = useState(null);
  const [snapOn,   setSnapOn]   = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
```

Update the topbar and layout wrapper to use this state:

```jsx
<div className={`main${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
  <div className="col left">
    <Sidebar
      counts={counts}
      total={total}
      statuses={statuses}
      partNos={partNos}
      setStatuses={setStatuses}
      setPartNos={setPartNos}
      collapsed={sidebarCollapsed}
      onToggleCollapsed={() => setSidebarCollapsed(v => !v)}
    />
  </div>
</div>
```

- [ ] **Step 2: Run the app to verify the new prop is currently unused/broken**

Run:

```bash
python -m http.server 8080
```

Expected:
- terminal prints `Serving HTTP on ... port 8080`
- browser still loads the page
- clicking the future sidebar toggle is not available yet because `Sidebar.jsx` has not been updated

- [ ] **Step 3: Add the topbar sidebar toggle button in `Dashboard.jsx`**

Place the toggle in the non-edit-mode top-right controls so it stays visible during normal operation.

```jsx
<>
  <button
    className={`sidebar-toggle-btn${sidebarCollapsed ? ' collapsed' : ''}`}
    onClick={() => setSidebarCollapsed(v => !v)}
    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {sidebarCollapsed ? 'Show Panel' : 'Hide Panel'}
  </button>
  <div className="live"><span className="dot"></span> Live · MES sync 3s</div>
  <div className="meta-block">
    <span className="k">System Time</span>
    <span className="v">{fmtTime(now)}</span>
  </div>
</>
```

- [ ] **Step 4: Add the shell CSS for collapsed/open grid behavior**

In `src/styles.css`, replace the fixed left column width rule with a variable-driven layout:

```css
:root {
  --sidebar-open-w: 380px;
  --sidebar-collapsed-w: 68px;
}

.main {
  height: calc(1080px - 84px);
  display: grid;
  grid-template-columns: var(--sidebar-open-w) minmax(0, 1fr);
  gap: 0;
  transition: grid-template-columns .24s ease;
}

.main.sidebar-collapsed {
  grid-template-columns: var(--sidebar-collapsed-w) minmax(0, 1fr);
}
```

Add the new toggle button styling:

```css
.sidebar-toggle-btn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  padding: 8px 14px;
  border: 1px solid var(--rule-2);
  border-radius: 4px;
  background: #fff;
  color: var(--ink-2);
  cursor: pointer;
  transition: border-color .15s, color .15s, background .15s;
}

.sidebar-toggle-btn:hover {
  border-color: var(--gold);
  color: var(--ink);
  background: #fbf6e6;
}
```

- [ ] **Step 5: Run the browser smoke check**

Run:

```bash
python -m http.server 8080
```

Verify in browser:
- the page loads without console errors
- the topbar shows the new sidebar toggle
- toggling changes the main grid width without breaking the floor map
- edit mode still opens and closes correctly

- [ ] **Step 6: Commit the shell wiring**

```bash
git add src/components/Dashboard.jsx src/styles.css
git commit -m "feat: add collapsible sidebar shell"
```

## Task 2: Convert Sidebar Into Open Panel + Collapsed Rail

**Files:**
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/styles.css`
- Test: browser smoke check via `python -m http.server 8080`

- [ ] **Step 1: Refactor `Sidebar` to accept collapse props**

Update the signature:

```jsx
function Sidebar({
  counts,
  total,
  statuses,
  partNos,
  setStatuses,
  setPartNos,
  collapsed,
  onToggleCollapsed,
}) {
```

Add an early collapsed-rail branch before the current full panel markup:

```jsx
if (collapsed) {
  return (
    <div className="col left sidebar-rail">
      <button className="rail-toggle" onClick={onToggleCollapsed} title="Expand sidebar">
        »
      </button>
      <button className="rail-anchor" onClick={onToggleCollapsed}>Sum</button>
      <button className="rail-anchor" onClick={onToggleCollapsed}>Stat</button>
      <button className="rail-anchor" onClick={onToggleCollapsed}>Type</button>
      <button className="rail-anchor rail-anchor-bottom" onClick={onToggleCollapsed}>Data</button>
    </div>
  );
}
```

- [ ] **Step 2: Replace the double wrapper so `Sidebar` does not render a nested `.col.left`**

In `Dashboard.jsx`, change:

```jsx
<div className="col left">
  <Sidebar ... />
</div>
```

to:

```jsx
<Sidebar
  counts={counts}
  total={total}
  statuses={statuses}
  partNos={partNos}
  setStatuses={setStatuses}
  setPartNos={setPartNos}
  collapsed={sidebarCollapsed}
  onToggleCollapsed={() => setSidebarCollapsed(v => !v)}
/>;
```

This makes `Sidebar.jsx` the single owner of the left-column wrapper in both open and collapsed states.

- [ ] **Step 3: Add rail styles in `src/styles.css`**

```css
.sidebar-rail {
  padding: 14px 8px 16px;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  transition: padding .24s ease;
}

.rail-toggle,
.rail-anchor {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink-2);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
}

.rail-toggle:hover,
.rail-anchor:hover {
  border-color: var(--gold);
  color: var(--ink);
  background: #fbf6e6;
}

.rail-anchor-bottom {
  margin-top: auto;
}
```

- [ ] **Step 4: Run the browser smoke check**

Run:

```bash
python -m http.server 8080
```

Verify in browser:
- open state still renders the full sidebar
- collapsed state shows a slim rail instead of a blank column
- clicking any rail button re-expands the sidebar
- the map receives more horizontal space while collapsed

- [ ] **Step 5: Commit the rail behavior**

```bash
git add src/components/Dashboard.jsx src/components/Sidebar.jsx src/styles.css
git commit -m "feat: add collapsed sidebar rail"
```

## Task 3: Add Machine Types Accordion and Reorder Sidebar Content

**Files:**
- Modify: `src/data/machines.js`
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/styles.css`
- Test: browser smoke check via `python -m http.server 8080`

- [ ] **Step 1: Add machine-type reference data to `src/data/machines.js`**

Keep the labels close to existing machine categories so the sidebar does not hardcode them.

```js
const MACHINE_TYPE_REFERENCE = [
  { key: 'compression', name: 'Compression',    label: 'Forming Press',   kind: 'forming',   color: CAT_META.compression.color },
  { key: 'vacuum',      name: 'Vacuum Forming', label: 'Vacuum Press',    kind: 'forming',   color: CAT_META.vacuum.color },
  { key: 'injection',   name: 'Injection',      label: 'Injection Press', kind: 'injection', color: CAT_META.injection.color },
  { key: 'transfer',    name: 'Transfer',       label: 'Transfer Line',   kind: 'transfer',  color: CAT_META.transfer.color },
  { key: 'desma',       name: 'DESMA',          label: 'DESMA Press',     kind: 'desma',     color: CAT_META.desma.color },
];
```

- [ ] **Step 2: Add local accordion state and the approved section order in `Sidebar.jsx`**

Inside `Sidebar`, add:

```jsx
const [typesOpen, setTypesOpen] = React.useState(true);
```

Rebuild the open-state body so the sections render in this order:

```jsx
return (
  <div className="col left sidebar-open">
    <div className="panel-title">
      <span className="t">Production Summary</span>
      <button className="panel-collapse-link" onClick={onToggleCollapsed}>Collapse</button>
    </div>

    {/* summary */}
    ...

    {/* status legend */}
    ...

    <div className="panel-title tight sidebar-subsection">
      <span className="t">Machine Types</span>
      <button className="accordion-toggle" onClick={() => setTypesOpen(v => !v)}>
        {typesOpen ? 'Hide' : 'Show'}
      </button>
    </div>

    {typesOpen && (
      <div className="machine-type-list">
        {MACHINE_TYPE_REFERENCE.map(item => (
          <div className="machine-type-card" key={item.key}>
            <div className="machine-type-preview">
              <svg viewBox={item.kind === 'transfer' ? '0 0 120 80' : '0 0 60 80'} preserveAspectRatio="xMidYMid meet">
                {React.createElement(KIND_SVG[item.kind])}
              </svg>
            </div>
            <div className="machine-type-copy">
              <div className="machine-type-name">{item.name}</div>
              <div className="machine-type-kind">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* actions */}
    ...
  </div>
);
```

- [ ] **Step 3: Replace the overly dense bottom notes with action-first layout**

Move Excel actions below `Machine Types` and keep notes compact:

```jsx
<div className="excel-section sidebar-actions">
  <div className="excel-head">
    <span className="lbl">Data · Excel</span>
  </div>
  ...
</div>

<div className="legend-foot sidebar-notes">
  <div className="ttl">Operations notes</div>
  <div className="ln">Cycle target <span className="v">{(plan/24/60).toFixed(0)} pcs/min</span></div>
  <div className="ln">OEE rolling 7d <span className="v">86.4%</span></div>
</div>
```

- [ ] **Step 4: Add accordion/reference styles in `src/styles.css`**

```css
.panel-collapse-link,
.accordion-toggle {
  border: none;
  background: transparent;
  color: var(--gold);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
}

.machine-type-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.machine-type-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--rule);
  border-radius: 5px;
  background: var(--surface);
}

.machine-type-preview {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #fff, #faf6e8);
  border: 1px solid var(--rule);
  flex: none;
}

.machine-type-preview svg {
  width: 34px;
  height: 34px;
}

.machine-type-preview .core {
  fill: var(--gold);
}

.machine-type-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
}

.machine-type-kind {
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--muted);
}
```

- [ ] **Step 5: Run the browser smoke check**

Run:

```bash
python -m http.server 8080
```

Verify in browser:
- `Machine Types` appears below `Status Legend`
- the accordion opens/closes without shifting the map unexpectedly
- machine type meaning is discoverable in the sidebar without adding text to map tiles
- import/export still works visually and remains reachable at the bottom

- [ ] **Step 6: Commit the sidebar content refactor**

```bash
git add src/data/machines.js src/components/Sidebar.jsx src/styles.css
git commit -m "feat: add machine type reference accordion"
```

## Task 4: Clean Up Typography and Desktop Readability

**Files:**
- Modify: `src/styles.css`
- Test: browser smoke check via `python -m http.server 8080`

- [ ] **Step 1: Raise key text sizes in `src/styles.css`**

Update the smallest operational text values so the laptop experience is readable.

```css
.brand h1 { font-size: 26px; }
.brand .sub { font-size: 11px; }
.meta-block .k { font-size: 10px; }
.panel-title .t { font-size: 20px; }
.panel-title .n { font-size: 10px; }
.kpi .lbl { font-size: 10px; }
.prod-bar .row .lbl { font-size: 10px; }
.legend-card .name { font-size: 12px; }
.legend-card .desc { font-size: 10px; line-height: 1.4; }
.excel-btn { font-size: 10px; }
.excel-feedback { font-size: 10px; }
.vac-tile .id { font-size: 12px; }
```

- [ ] **Step 2: Increase spacing where the larger text needs breathing room**

```css
.col { padding: 24px 24px 20px; }
.panel-title { margin-bottom: 12px; padding-bottom: 10px; }
.hero-kpis { gap: 10px; margin-bottom: 12px; }
.legend { gap: 6px; }
.legend-card { padding: 8px 10px; }
.excel-row { gap: 8px; }
```

- [ ] **Step 3: Run the browser smoke check**

Run:

```bash
python -m http.server 8080
```

Verify in browser:
- sidebar text is readable on laptop without zooming
- the cream/gold theme still looks like the same product
- no text overlaps in the sidebar or topbar
- machine IDs remain clear and stronger than secondary metadata

- [ ] **Step 4: Commit the typography pass**

```bash
git add src/styles.css
git commit -m "style: improve dashboard readability"
```

## Task 5: Final Integrated Verification

**Files:**
- Verify only: `src/components/Dashboard.jsx`, `src/components/Sidebar.jsx`, `src/data/machines.js`, `src/styles.css`

- [ ] **Step 1: Start the app for integrated verification**

Run:

```bash
python -m http.server 8080
```

Expected:
- terminal prints `Serving HTTP on ... port 8080`

- [ ] **Step 2: Verify the approved desktop/laptop behaviors**

Check these in the browser:

- sidebar starts open
- clicking `Hide Panel` collapses to a slim rail
- clicking a rail anchor re-expands the panel
- map width increases while collapsed
- `Status Legend` stays permanently visible in open state
- `Machine Types` is a collapsible section below the status legend
- machine tiles still show only picture + ID + status
- edit mode still works and machine drag behavior is unchanged
- modal still opens for a selected machine outside edit mode

- [ ] **Step 3: Verify non-goals were preserved**

Check these explicitly:

- machine placement coordinates are unchanged
- no machine type label is rendered on every tile
- the theme still reads as cream/gold industrial
- no new blue-accent SaaS styling was introduced

- [ ] **Step 4: Create the final feature commit**

```bash
git add src/components/Dashboard.jsx src/components/Sidebar.jsx src/data/machines.js src/styles.css
git commit -m "feat: add collapsible enterprise sidebar"
```
