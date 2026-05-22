// src/components/Dashboard.jsx

const SNAP_GRID = 20;
const snapGrid  = v => Math.round(v / SNAP_GRID) * SNAP_GRID;

function initialStatuses() {
  const r    = seededRand(7);
  const dist = [
    ...Array(36).fill('running'),
    ...Array(1).fill('down'),
    ...Array(1).fill('manpower'),
    ...Array(7).fill('plan'),
  ];
  const all = MACHINES.map(m => m.id);
  while (dist.length < all.length) dist.push('running');
  for (let i = dist.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [dist[i], dist[j]] = [dist[j], dist[i]];
  }
  const out = {};
  all.forEach((id, i) => { out[id] = dist[i] || 'running'; });
  return out;
}

/* ── Edit-mode left sidebar ── */
function EditSidebar({ machines, selectedId, catCounts, onSetCategory, onCapChange, onDelete, onAdd, onReSnap, snapOn, onSnapToggle, onRename }) {
  const m   = selectedId ? machines.find(mm => mm.id === selectedId) : null;
  const cat = m ? (CAT_META[m.category] || { name: m.category, color: '#B8965A' }) : null;
  const [renameVal,  setRenameVal]  = useState(m ? (m.displayId || m.id) : '');
  const [renameWarn, setRenameWarn] = useState('');
  useEffect(() => {
    setRenameVal(m ? (m.displayId || m.id) : '');
    setRenameWarn('');
  }, [selectedId]);
  function applyRename() {
    if (!m) return;
    const trimmed = renameVal.trim();
    if (!trimmed) { setRenameWarn('ID cannot be empty.'); setRenameVal(m.displayId || m.id); return; }
    const dup = machines.some(mm => mm.id !== m.id && (mm.displayId || mm.id) === trimmed);
    if (dup) { setRenameWarn(`"${trimmed}" already used.`); setRenameVal(m.displayId || m.id); return; }
    setRenameWarn('');
    onRename(trimmed);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* header */}
      <div className="panel-title" style={{ marginBottom:0, paddingBottom:10 }}>
        <span className="t" style={{ fontFamily:'Manrope', fontSize:16 }}>Edit Mode</span>
        <span style={{ fontFamily:'IBM Plex Mono', fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--st-down)', fontWeight:700 }}>LIVE</span>
      </div>

      {/* inspector */}
      <div style={{ borderTop:'1px solid var(--rule)', paddingTop:12, paddingBottom:12, borderBottom:'1px solid var(--rule)', flexShrink:0 }}>
        {m ? (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, padding:'8px 10px', background:'var(--surface)', border:`1px solid ${cat.color}44`, borderRadius:6 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'IBM Plex Mono', fontSize:18, fontWeight:600, color:'var(--ink)' }}>{m.displayId || m.id}</div>
                <div style={{ fontFamily:'IBM Plex Mono', fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:cat.color }}>{cat.name} · {m.cap}T</div>
              </div>
              <button onClick={onDelete} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--st-down)', fontSize:20, lineHeight:1, padding:'2px 5px', borderRadius:3 }} title="Delete">×</button>
            </div>

            <div style={{ marginBottom:8 }}>
              <div style={{ fontFamily:'IBM Plex Mono', fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:3 }}>Machine ID</div>
              <input
                key={m.id + '_name'}
                value={renameVal}
                onChange={e => { setRenameVal(e.target.value); if (renameWarn) setRenameWarn(''); }}
                onBlur={applyRename}
                onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setRenameVal(m.displayId || m.id); setRenameWarn(''); } }}
                style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--rule-2)', borderRadius:4, padding:'5px 8px', fontFamily:'IBM Plex Mono', fontSize:11, color:'var(--ink)', outline:'none', boxSizing:'border-box' }}
              />
              {renameWarn && <div style={{ fontFamily:'IBM Plex Mono', fontSize:9, color:'var(--st-down)', marginTop:3 }}>{renameWarn}</div>}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:'IBM Plex Mono', fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:3 }}>Capacity</div>
                <input
                  key={m.id + '_cap'}
                  type="number"
                  defaultValue={m.cap}
                  onBlur={e => onCapChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                  style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--rule-2)', borderRadius:4, padding:'5px 8px', fontFamily:'IBM Plex Mono', fontSize:11, color:'var(--ink)', outline:'none' }}
                />
              </div>
              <div>
                <div style={{ fontFamily:'IBM Plex Mono', fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:3 }}>Position</div>
                <div style={{ fontFamily:'IBM Plex Mono', fontSize:10, color:'var(--ink)', background:'var(--surface)', border:'1px solid var(--rule)', borderRadius:4, padding:'6px 8px', fontVariantNumeric:'tabular-nums' }}>
                  {m.x}, {m.y}
                </div>
              </div>
            </div>

            <div style={{ fontFamily:'IBM Plex Mono', fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:5 }}>Category</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              {Object.entries(CAT_META).map(([key, cm]) => (
                <button key={key}
                  onClick={() => onSetCategory(key)}
                  style={{
                    display:'flex', alignItems:'center', gap:5, padding:'5px 7px',
                    borderRadius:4, border:`1px solid ${m.category === key ? cm.color : 'var(--rule)'}`,
                    background: m.category === key ? 'var(--bg)' : 'var(--surface)',
                    cursor:'pointer', fontSize:10, fontFamily:'Manrope', color:'var(--ink-2)',
                  }}
                >
                  <span style={{ width:7, height:7, borderRadius:'50%', background:cm.color, display:'inline-block', flexShrink:0 }}/>
                  {cm.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'14px 0', color:'var(--muted)', fontSize:11, fontFamily:'Manrope', lineHeight:1.6 }}>
            <div style={{ fontFamily:'IBM Plex Mono', fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', marginBottom:4 }}>No selection</div>
            Click a machine to inspect · drag to reposition
          </div>
        )}
      </div>

      {/* category counts */}
      <div style={{ flexShrink:0 }}>
        <div className="panel-title tight" style={{ paddingTop:10, paddingBottom:8, marginBottom:0 }}>
          <span className="t" style={{ fontSize:14 }}>Machine Types</span>
          <span className="n">{machines.length} total</span>
        </div>
        {Object.entries(CAT_META).map(([key, cm]) => (
          <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderTop:'1px solid var(--rule)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:3, height:18, borderRadius:2, background:cm.color, display:'inline-block' }}/>
              <span style={{ fontSize:11, color:'var(--ink)', fontFamily:'Manrope' }}>{cm.name}</span>
            </div>
            <span style={{ fontFamily:'IBM Plex Mono', fontSize:13, fontWeight:600, color:'var(--ink)', fontVariantNumeric:'tabular-nums' }}>
              {String(catCounts[key] || 0).padStart(2,'0')}
            </span>
          </div>
        ))}
      </div>

      {/* controls */}
      <div style={{ marginTop:'auto', paddingTop:14, borderTop:'1px solid var(--rule)', display:'flex', flexDirection:'column', gap:7, flexShrink:0 }}>
        <button onClick={onAdd} className="btn primary" style={{ textAlign:'center' }}>+ Add Machine</button>
        <button onClick={onReSnap} className="btn" style={{ textAlign:'center' }}>Re-snap to Grid</button>
        <label style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--ink-2)' }}>
          <input type="checkbox" checked={snapOn} onChange={onSnapToggle} style={{ accentColor:'var(--gold)', width:13, height:13 }}/>
          Snap to Grid (20px)
        </label>
        <div style={{ fontFamily:'IBM Plex Mono', fontSize:9, letterSpacing:'.06em', color:'var(--muted)', lineHeight:1.8, paddingTop:4, borderTop:'1px solid var(--rule)' }}>
          ↑↓←→ — nudge 20px &nbsp;|&nbsp; ⇧+↑↓ — 100px<br/>
          DEL — remove selected &nbsp;|&nbsp; ESC — deselect
        </div>
      </div>

    </div>
  );
}

/* ── Main Dashboard ── */
function Dashboard() {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [partNos,  setPartNos]  = useState({});
  const [remarks,  setRemarks]  = useState({});
  const [selected, setSelected] = useState(null);
  const [now,      setNow]      = useState(new Date());
  const [editMode, setEditMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1024);
  const [machines, setMachines] = useState(() => MACHINES.map(m => ({ ...m })));
  const [drag,     setDrag]     = useState(null);
  const [snapOn,   setSnapOn]   = useState(true);

  const mapWrapRef   = useRef(null);
  const mapCanvasRef = useRef(null);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Drag — pointer-based, scale-aware
  const onPointerDownMachine = useCallback((e, m) => {
    e.preventDefault();
    setSelected(m.id);
    const rect  = mapCanvasRef.current.getBoundingClientRect();
    const scale = parseFloat(document.getElementById('stage').dataset.scale) || 1;
    const px = (e.clientX - rect.left) / scale;
    const py = (e.clientY - rect.top)  / scale;
    setDrag({ id: m.id, ox: px - m.x, oy: py - m.y });
  }, []);

  useEffect(() => {
    if (!drag) return;
    function move(e) {
      const rect  = mapCanvasRef.current.getBoundingClientRect();
      const scale = parseFloat(document.getElementById('stage').dataset.scale) || 1;
      const px = (e.clientX - rect.left) / scale;
      const py = (e.clientY - rect.top)  / scale;
      let nx = px - drag.ox, ny = py - drag.oy;
      if (snapOn) { nx = snapGrid(nx); ny = snapGrid(ny); }
      nx = Math.max(0, nx); ny = Math.max(0, ny);
      setMachines(ms => ms.map(m => m.id === drag.id ? { ...m, x: nx, y: ny } : m));
    }
    function up() { setDrag(null); }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup',   up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup',   up);
    };
  }, [drag, snapOn]);

  // Keyboard shortcuts (edit mode only)
  useEffect(() => {
    function onKey(e) {
      if (!editMode || e.target.tagName === 'INPUT') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        deleteMachine(selected);
        return;
      }
      if (e.key === 'Escape') { setSelected(null); return; }
      if (selected && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const d = e.shiftKey ? 100 : 20;
        setMachines(ms => ms.map(m => {
          if (m.id !== selected) return m;
          let nx = m.x, ny = m.y;
          if (e.key === 'ArrowUp')    ny -= d;
          if (e.key === 'ArrowDown')  ny += d;
          if (e.key === 'ArrowLeft')  nx -= d;
          if (e.key === 'ArrowRight') nx += d;
          return { ...m, x: Math.max(0, nx), y: Math.max(0, ny) };
        }));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editMode, selected]);

  // Machine operations
  function addMachine() {
    const ids = new Set(machines.map(m => m.id));
    let n = 1, id;
    do { id = `M${String(n).padStart(2,'0')}`; n++; } while (ids.has(id));
    const x = snapGrid(200 + (machines.length % 9) * 100);
    const y = snapGrid(60  + Math.floor(machines.length / 9) * 120);
    setMachines(ms => [...ms, { id, category:'compression', cap:200, x, y }]);
    setStatuses(prev => ({ ...prev, [id]: 'running' }));
    setSelected(id);
  }

  function deleteMachine(id) {
    setMachines(ms => ms.filter(m => m.id !== id));
    setStatuses(prev => { const next = { ...prev }; delete next[id]; return next; });
    if (selected === id) setSelected(null);
  }

  function reSnapAll() {
    setMachines(ms => ms.map(m => ({ ...m, x: snapGrid(m.x), y: snapGrid(m.y) })));
  }

  // Status counts
  const counts = useMemo(() => {
    const c = { running:0, down:0, setup:0, damage:0, qa:0, material:0, manpower:0, plan:0 };
    Object.values(statuses).forEach(s => { c[s] = (c[s] || 0) + 1; });
    return c;
  }, [statuses]);

  const total = Object.keys(statuses).length;

  const catCounts = useMemo(() => {
    const c = {};
    machines.forEach(m => { c[m.category] = (c[m.category] || 0) + 1; });
    return c;
  }, [machines]);

  // Selected machine for modal (normal mode)
  const selectedMachine = useMemo(() => {
    if (!selected || editMode) return null;
    const m = machines.find(mm => mm.id === selected);
    if (!m) return null;
    const cat = CAT_META[m.category] || { name: m.category };
    return { ...m, kind: CAT_KIND[m.category] || 'forming', zone: cat.name.toUpperCase() };
  }, [selected, machines, editMode]);

  function toggleEditMode() {
    setEditMode(p => {
      const next = !p;
      if (next) setSidebarCollapsed(false);
      return next;
    });
    setSelected(null);
    setDrag(null);
  }

  return (
    <>
      {/* ── Top bar ── */}
      <div className="topbar">
        <div className="brand">
          <div className="crest">F</div>
          <div>
            <h1>Forming Operations · Plant 04</h1>
            <div className="sub">Status Forming Machine · Shift A · Day 1</div>
          </div>
        </div>
        <div className="top-right">
          {editMode ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'IBM Plex Mono', fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--muted)' }}>
                {machines.length} machines · drag to reposition
              </span>
            </div>
          ) : (
            <>
              <button
                className="sidebar-toggle-btn"
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
          )}
          <button
            className={`edit-mode-btn${editMode ? ' active' : ''}`}
            onClick={toggleEditMode}
          >
            {editMode ? '✓ Done' : 'Edit Layout'}
          </button>
        </div>
      </div>

      {/* ── Main ── */}
        <div className={`main${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>

        {/* Left column */}
        {editMode ? (
          <div className="col left">
            <EditSidebar
              machines={machines}
              selectedId={selected}
              catCounts={catCounts}
              onSetCategory={cat => selected && setMachines(ms => ms.map(m => m.id === selected ? { ...m, category: cat } : m))}
              onCapChange={cap => selected && setMachines(ms => ms.map(m => m.id === selected ? { ...m, cap: Math.max(0, Number(cap) || 0) } : m))}
              onRename={name => selected && setMachines(ms => ms.map(m => m.id === selected ? { ...m, displayId: name } : m))}
              onDelete={() => selected && deleteMachine(selected)}
              onAdd={addMachine}
              onReSnap={reSnapAll}
              snapOn={snapOn}
              onSnapToggle={() => setSnapOn(p => !p)}
            />
          </div>
        ) : (
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
        )}

        {/* Center column */}
        <div className="col center">
          <div className="panel-title" style={{ marginBottom:14 }}>
            <span className="t">Forming Floor · Live Map</span>
            {editMode
              ? <span className="n" style={{ color:'var(--st-down)' }}>EDIT MODE</span>
              : <span className="n">II</span>
            }
          </div>
          <FloorMap
            machines={machines}
            statuses={statuses}
            onSelect={m => setSelected(m.id)}
            selectedId={selected}
            editMode={editMode}
            drag={drag}
            onPointerDownMachine={onPointerDownMachine}
            onDeleteMachine={deleteMachine}
            onDeselect={() => setSelected(null)}
            mapWrapRef={mapWrapRef}
            mapCanvasRef={mapCanvasRef}
          />
        </div>

      </div>

      {/* Mobile backdrop — closes sidebar when tapped; CSS hides on desktop */}
      <div
        className={`mobile-backdrop${!sidebarCollapsed ? ' open' : ''}`}
        onClick={() => setSidebarCollapsed(true)}
        aria-hidden="true"
      />

      {/* Modal — normal mode only */}
      {selectedMachine && (
        <MachineModal
          machine={selectedMachine}
          status={statuses[selectedMachine.id]}
          partNo={partNos[selectedMachine.id] || '—'}
          remark={remarks[selectedMachine.id] || ''}
          onClose={() => setSelected(null)}
          onChange={ns => setStatuses(prev => ({ ...prev, [selectedMachine.id]: ns }))}
          onRemarkChange={text => setRemarks(prev => ({ ...prev, [selectedMachine.id]: text }))}
          now={now}
        />
      )}
    </>
  );
}
