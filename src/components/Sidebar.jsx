// ─────────────────────────────────────────────
//  src/components/Sidebar.jsx
//  Left column: KPIs, legend, Excel import/export
// ─────────────────────────────────────────────

// ── Rail icon SVGs (inline, no external deps) ──
function RailIconExpand() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="3" height="12" rx="1.2" fill="currentColor" opacity=".55"/>
      <path d="M8 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".4"/>
    </svg>
  );
}
function RailIconSummary() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1.4" fill="currentColor" opacity=".9"/>
      <rect x="11" y="3" width="6" height="6" rx="1.4" fill="currentColor" opacity=".4"/>
      <rect x="3" y="11" width="6" height="6" rx="1.4" fill="currentColor" opacity=".4"/>
      <rect x="11" y="11" width="6" height="6" rx="1.4" fill="currentColor" opacity=".4"/>
    </svg>
  );
}
function RailIconStatus() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5"  cy="5.5"  r="2.2" fill="currentColor" opacity=".9"/>
      <rect x="9" y="4.2" width="8" height="2.4" rx="1.2" fill="currentColor" opacity=".55"/>
      <circle cx="5"  cy="10"  r="2.2" fill="currentColor" opacity=".55"/>
      <rect x="9" y="8.8" width="8" height="2.4" rx="1.2" fill="currentColor" opacity=".4"/>
      <circle cx="5"  cy="14.5" r="2.2" fill="currentColor" opacity=".3"/>
      <rect x="9" y="13.3" width="8" height="2.4" rx="1.2" fill="currentColor" opacity=".25"/>
    </svg>
  );
}
function RailIconTypes() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="5" height="9" rx="1" fill="currentColor" opacity=".85"/>
      <rect x="3" y="4" width="5" height="2" rx=".7" fill="currentColor" opacity=".4"/>
      <rect x="10" y="7" width="5" height="9" rx="1" fill="currentColor" opacity=".5"/>
      <rect x="10" y="4" width="5" height="2" rx=".7" fill="currentColor" opacity=".25"/>
      <rect x="17" y="9" width="1.5" height="5" rx=".5" fill="currentColor" opacity=".3"/>
    </svg>
  );
}
function RailIconData() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="2.5" rx="1" fill="currentColor" opacity=".85"/>
      <path d="M5 10.5h3m0 0v-2m0 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      <path d="M12 8.5v4m-1.5-1.5 1.5 1.5 1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".55"/>
      <rect x="3" y="15" width="14" height="2" rx="1" fill="currentColor" opacity=".3"/>
    </svg>
  );
}

function Sidebar({ counts, total, statuses, partNos, setStatuses, setPartNos, collapsed, onToggleCollapsed, lastSaved, machines }) {
  const plan       = 5416750;
  const actual     = 3486451;
  const ng         = 0;
  const diff       = plan - actual;
  const productivity = (actual / plan) * 100;
  const manPower   = 21;
  const fileInputRef = useRef(null);
  const [importFeedback, setImportFeedback]   = React.useState('');
  const [importIsErr,    setImportIsErr]      = React.useState(false);
  const [typesOpen,      setTypesOpen]        = React.useState(true);

  // Section refs for scroll-to behavior
  const colRef     = useRef(null);
  const summaryRef = useRef(null);
  const statusRef  = useRef(null);
  const typesRef   = useRef(null);
  const actionsRef = useRef(null);

  // Rail click: expand then scroll to section
  const [pendingSection, setPendingSection] = React.useState(null);

  function railClick(section) {
    if (section === 'types') setTypesOpen(true);
    setPendingSection(section);
    onToggleCollapsed();
  }

  useEffect(() => {
    if (!pendingSection || collapsed) return;
    const refMap = { summary: summaryRef, status: statusRef, types: typesRef, actions: actionsRef };
    const target = refMap[pendingSection];
    if (!target || !target.current) return;
    const tid = setTimeout(() => {
      target.current.scrollIntoView({ behavior:'smooth', block:'start' });
      setPendingSection(null);
    }, 260);
    return () => clearTimeout(tid);
  }, [pendingSection, collapsed]);

  // ── Import ──
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const { newStatuses, newPartNos, summary } =
          await parseImportFile(evt.target.result, statuses, partNos, lastSaved);
        setStatuses(newStatuses);
        setPartNos(newPartNos);
        setImportFeedback(summary);
        setImportIsErr(false);
      } catch (err) {
        setImportFeedback(`✗ Error: ${err.message}`);
        setImportIsErr(true);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  // ── Export ──
  function handleExport() {
    exportStatusFile(statuses, partNos, counts, total, plan, actual, machines);
  }

  if (collapsed) {
    return (
      <div className="col left sidebar-rail">
        {/* Expand toggle */}
        <button
          className="rail-nav-card rail-expand"
          onClick={onToggleCollapsed}
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <span className="rail-icon"><RailIconExpand /></span>
          <span className="rail-label">Menu</span>
        </button>

        <div className="rail-divider" />

        {/* Summary */}
        <button
          className="rail-nav-card"
          onClick={() => railClick('summary')}
          title="Summary — machine counts &amp; production KPIs"
          aria-label="Go to Summary"
        >
          <span className="rail-icon"><RailIconSummary /></span>
          <span className="rail-label">Sum</span>
        </button>

        {/* Status Legend */}
        <button
          className="rail-nav-card"
          onClick={() => railClick('status')}
          title="Status Legend — machine status breakdown"
          aria-label="Go to Status Legend"
        >
          <span className="rail-icon"><RailIconStatus /></span>
          <span className="rail-label">Status</span>
        </button>

        {/* Machine Types */}
        <button
          className="rail-nav-card"
          onClick={() => railClick('types')}
          title="Machine Types — press type reference"
          aria-label="Go to Machine Types"
        >
          <span className="rail-icon"><RailIconTypes /></span>
          <span className="rail-label">Types</span>
        </button>

        {/* Data / Actions — pinned to bottom */}
        <button
          className="rail-nav-card rail-bottom"
          onClick={() => railClick('actions')}
          title="Data — Excel import &amp; export"
          aria-label="Go to Data Actions"
        >
          <span className="rail-icon"><RailIconData /></span>
          <span className="rail-label">Data</span>
        </button>
      </div>
    );
  }

  return (
    <div className="col left" ref={colRef}>

      {/* Mobile close button — hidden on desktop via CSS */}
      <div className="sidebar-mobile-close">
        <span style={{ fontFamily:'IBM Plex Mono', fontSize:9, letterSpacing:'.22em',
          textTransform:'uppercase', color:'var(--muted)' }}>Operations Panel</span>
        <button
          onClick={onToggleCollapsed}
          style={{ background:'none', border:'1px solid var(--rule)', borderRadius:4,
            cursor:'pointer', color:'var(--ink-2)', fontSize:18, lineHeight:1,
            padding:'3px 9px', fontFamily:'Manrope', fontWeight:300 }}
          aria-label="Close panel"
        >×</button>
      </div>

      {/* I · Summary */}
      <div className="panel-title" ref={summaryRef}>
        <span className="t">Summary</span>
        <span className="n">I</span>
      </div>

      <div className="hero-kpis">
        <div className="kpi accent">
          <div className="lbl">Running</div>
          <div className="val num">{counts.running || 0}<span className="unit">MC</span></div>
        </div>
        <div className="kpi">
          <div className="lbl">Total</div>
          <div className="val num">{total}<span className="unit">MC</span></div>
        </div>
        <div className="kpi">
          <div className="lbl">Down</div>
          <div className="val num">{counts.down || 0}<span className="unit">MC</span></div>
        </div>
        <div className="kpi">
          <div className="lbl">No Plan</div>
          <div className="val num">{counts.plan || 0}<span className="unit">MC</span></div>
        </div>
      </div>

      {/* I·b · Production Details */}
      <div className="panel-title tight">
        <span className="t">Production Details</span>
        <span className="n">I·b</span>
      </div>

      <div className="ops-snapshot">
        <div className="ops-row">
          <span className="k">Plan</span>
          <span className="v">{fmtNum(plan)}<span className="u">pcs</span></span>
        </div>
        <div className="ops-row">
          <span className="k">Actual</span>
          <span className="v">{fmtNum(actual)}<span className="u">pcs</span></span>
        </div>
        <div className="ops-row emphasis">
          <span className="k">Diff</span>
          <span className="v">{fmtNum(diff)}<span className="u">pcs</span></span>
        </div>
        <div className="ops-row">
          <span className="k">NG</span>
          <span className="v">{ng > 0 ? fmtNum(ng) : '—'}</span>
        </div>
        <div className="ops-row emphasis">
          <span className="k">Productivity</span>
          <span className="v">{productivity.toFixed(2)}<span className="u">%</span></span>
        </div>
        <div className="ops-row">
          <span className="k">Man Power</span>
          <span className="v">{manPower}</span>
        </div>
      </div>

      {/* II · Machine Status Legend */}
      <div className="panel-title tight" ref={statusRef}>
        <span className="t">Status Legend</span>
        <span className="n">II</span>
      </div>

      <div className="legend">
        {STATUSES.map(s => (
          <div className="legend-card" key={s.key}>
            <div className={`chip ${s.key}`}>{counts[s.key] || 0}</div>
            <div className="body">
              <div className="name">{s.name}</div>
              <div className="desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="total-row">
        <span className="k">Total Machine</span>
        <span className="v">{total}</span>
      </div>

      {/* III · Machine Types */}
      <div className="panel-title tight" ref={typesRef}>
        <span className="t">Machine Types</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button
            type="button"
            className="panel-collapse-link accordion-toggle"
            onClick={() => setTypesOpen(open => !open)}
            aria-expanded={typesOpen}
          >
            {typesOpen ? 'Hide' : 'Show'}
          </button>
          <span className="n">III</span>
        </div>
      </div>

      {typesOpen && (
        <div className="machine-type-list">
          {MACHINE_TYPE_REFERENCE.map(item => (
            <div className="machine-type-card" key={item.key}>
              <div className="machine-type-preview" style={{ '--machine-type-accent': item.color }}>
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

      {/* IV · Actions */}
      <div className="panel-title tight" ref={actionsRef}>
        <span className="t">Actions</span>
        <span className="n">IV</span>
      </div>

      <div className="excel-section">
        <div className="excel-head">
          <span className="lbl">Data · Excel</span>
        </div>
        <div className="excel-row">
          <label className="excel-btn import-btn" title="Import MC Daily (.xlsx)">
            ↑ Import MC Daily
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={handleImport}/>
          </label>
          <button className="excel-btn export-btn" onClick={handleExport} title="Export M_C Status Data (.xlsx)">
            ↓ Export Status
          </button>
        </div>
        {importFeedback && (
          <div className={`excel-feedback ${importIsErr ? 'err' : 'ok'}`}>{importFeedback}</div>
        )}
      </div>

      <div className="legend-foot" style={{ marginTop:6 }}>
        <div className="ttl">Operations notes</div>
        <div className="ln">Cycle target <span className="v">{(plan / 24 / 60).toFixed(0)} pcs/min</span></div>
        <div className="ln">Next mold change <span className="v">B11 · 14:20</span></div>
      </div>
    </div>
  );
}
