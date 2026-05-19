// src/components/EditPage.jsx
// Free-form canvas layout editor — light cream/gold theme

const EP_CATEGORIES = [
  { key:'compression', name:'Compression', color:'#4ADE80' },
  { key:'vacuum',      name:'Vacuum',      color:'#7CD4FF' },
  { key:'injection',   name:'Injection',   color:'#B07CFF' },
  { key:'transfer',    name:'Transfer',    color:'#F5C451' },
  { key:'desma',       name:'DESMA',       color:'#F08A4B' },
  { key:'aux',         name:'Aux',         color:'#5A6478' },
];
const EP_CAT   = Object.fromEntries(EP_CATEGORIES.map(c => [c.key, c]));
const EP_COLOR = Object.fromEntries(EP_CATEGORIES.map(c => [c.key, c.color]));

const EP_GRID = 20;
const epSnap  = v => Math.round(v / EP_GRID) * EP_GRID;

const EP_SEED = [
  {id:'D08',category:'desma',      x:760, y:40,  cap:250},
  {id:'D07',category:'desma',      x:860, y:40,  cap:400},
  {id:'D09',category:'desma',      x:960, y:40,  cap:400},
  {id:'D10',category:'desma',      x:1060,y:40,  cap:250},
  {id:'D11',category:'desma',      x:1160,y:40,  cap:250},
  {id:'C16',category:'vacuum',     x:40,  y:200, cap:200},
  {id:'C15',category:'vacuum',     x:140, y:200, cap:200},
  {id:'C14',category:'vacuum',     x:240, y:200, cap:200},
  {id:'C13',category:'vacuum',     x:340, y:200, cap:200},
  {id:'C17',category:'transfer',   x:460, y:200, cap:500},
  {id:'C10',category:'injection',  x:580, y:200, cap:150},
  {id:'C09',category:'injection',  x:680, y:200, cap:150},
  {id:'C08',category:'injection',  x:780, y:200, cap:150},
  {id:'C07',category:'injection',  x:880, y:200, cap:150},
  {id:'C05',category:'vacuum',     x:1080,y:200, cap:500},
  {id:'C02',category:'vacuum',     x:1180,y:200, cap:500},
  {id:'C01',category:'vacuum',     x:1280,y:200, cap:500},
  {id:'B19',category:'compression',x:40,  y:420, cap:200},
  {id:'B18',category:'compression',x:140, y:420, cap:200},
  {id:'B17',category:'compression',x:240, y:420, cap:200},
  {id:'B16',category:'compression',x:340, y:420, cap:200},
  {id:'B15',category:'compression',x:440, y:420, cap:200},
  {id:'B14',category:'compression',x:540, y:420, cap:200},
  {id:'B13',category:'vacuum',     x:660, y:420, cap:200},
  {id:'B12',category:'vacuum',     x:760, y:420, cap:200},
  {id:'B11',category:'vacuum',     x:860, y:420, cap:200},
  {id:'B10',category:'vacuum',     x:960, y:420, cap:200},
  {id:'B09',category:'vacuum',     x:1060,y:420, cap:200},
  {id:'B08',category:'vacuum',     x:1160,y:420, cap:200},
  {id:'B07',category:'compression',x:1280,y:420, cap:200},
  {id:'B06',category:'compression',x:1380,y:420, cap:200},
  {id:'A11',category:'compression',x:40,  y:640, cap:500},
  {id:'A12',category:'compression',x:140, y:640, cap:500},
  {id:'D05',category:'compression',x:260, y:640, cap:300},
  {id:'D01',category:'vacuum',     x:380, y:640, cap:200},
  {id:'D02',category:'vacuum',     x:480, y:640, cap:200},
  {id:'D03',category:'vacuum',     x:580, y:640, cap:200},
  {id:'D04',category:'vacuum',     x:680, y:640, cap:200},
  {id:'A07',category:'compression',x:800, y:640, cap:200},
  {id:'A06',category:'compression',x:900, y:640, cap:200},
  {id:'A05',category:'compression',x:1000,y:640, cap:200},
  {id:'A04',category:'compression',x:1100,y:640, cap:200},
  {id:'A03',category:'compression',x:1200,y:640, cap:250},
  {id:'A02',category:'compression',x:1300,y:640, cap:250},
  {id:'A01',category:'compression',x:1400,y:640, cap:250},
];

/* ── SVG Icons (light palette) ── */
function EpFormingIcon({ color }) {
  return (
    <svg viewBox="0 0 60 56" preserveAspectRatio="xMidYMid meet" style={{width:'100%',height:'100%'}}>
      <rect x="15" y="6"  width="30" height="8"  rx="1" fill="#E2DCCC"/>
      <rect x="9"  y="14" width="3"  height="22"        fill="#D7D1BF"/>
      <rect x="48" y="14" width="3"  height="22"        fill="#D7D1BF"/>
      <rect x="13" y="16" width="34" height="20" rx="2" fill="#E2DCCC"/>
      <rect x="16" y="20" width="28" height="14" rx="1" fill={color}/>
      <rect x="16" y="20" width="28" height="2.5"       fill="#fff" opacity="0.35"/>
      <rect x="4"  y="36" width="52" height="6"  rx="1" fill="#D7D1BF"/>
      <circle cx="30" cy="48" r="5"   fill="#E2DCCC"/>
      <circle cx="30" cy="48" r="1.5" fill={color}/>
    </svg>
  );
}
function EpInjectionIcon({ color }) {
  return (
    <svg viewBox="0 0 60 56" preserveAspectRatio="xMidYMid meet" style={{width:'100%',height:'100%'}}>
      <path d="M24 4 L36 4 L34 11 L26 11 Z" fill="#E2DCCC"/>
      <rect x="18" y="12" width="24" height="32" fill="#EDE8DA" stroke="#D7D1BF" strokeWidth="1"/>
      <rect x="21" y="15" width="18" height="2"  fill={color} opacity="0.4"/>
      <rect x="21" y="18" width="18" height="2"  fill={color} opacity="0.4"/>
      <rect x="21" y="22" width="18" height="16" rx="1" fill={color}/>
      <rect x="21" y="22" width="18" height="2.5"       fill="#fff" opacity="0.3"/>
      <circle cx="30" cy="50" r="4"   fill="#E2DCCC"/>
      <circle cx="30" cy="50" r="1.2" fill={color}/>
    </svg>
  );
}
function EpTransferIcon({ color }) {
  return (
    <svg viewBox="0 0 60 56" preserveAspectRatio="xMidYMid meet" style={{width:'100%',height:'100%'}}>
      <rect x="13" y="8"  width="34" height="22" rx="2" fill="#E2DCCC"/>
      <rect x="16" y="11" width="28" height="14" rx="1" fill={color}/>
      <rect x="16" y="11" width="28" height="2.5"       fill="#fff" opacity="0.3"/>
      <rect x="4"  y="30" width="52" height="6"  rx="1" fill="#D7D1BF"/>
      <circle cx="20" cy="44" r="4"   fill="#E2DCCC"/>
      <circle cx="40" cy="44" r="4"   fill="#E2DCCC"/>
      <circle cx="20" cy="44" r="1.2" fill={color}/>
      <circle cx="40" cy="44" r="1.2" fill={color}/>
    </svg>
  );
}
function EpDesmaIcon({ color }) {
  return (
    <svg viewBox="0 0 60 56" preserveAspectRatio="xMidYMid meet" style={{width:'100%',height:'100%'}}>
      <path d="M6 18 Q 10 4 30 4 Q 50 4 54 18" stroke="#D7D1BF" strokeWidth="2" fill="none"/>
      <circle cx="6"  cy="18" r="3" fill="#C8C0AC"/>
      <circle cx="54" cy="18" r="3" fill="#C8C0AC"/>
      <rect x="17" y="14" width="26" height="34" fill="#EDE8DA" stroke="#D7D1BF" strokeWidth="1"/>
      <rect x="20" y="17" width="20" height="9"  fill="#E2DCCC"/>
      <rect x="22" y="19" width="14" height="1"  fill={color} opacity="0.5"/>
      <rect x="20" y="28" width="20" height="16" rx="1" fill={color}/>
      <rect x="20" y="28" width="20" height="2.5"       fill="#fff" opacity="0.25"/>
    </svg>
  );
}
function EpAuxIcon({ color }) {
  return (
    <svg viewBox="0 0 60 56" preserveAspectRatio="xMidYMid meet" style={{width:'100%',height:'100%'}}>
      <rect x="10" y="10" width="40" height="36" rx="3" fill="#EDE8DA" stroke="#D7D1BF" strokeWidth="1"/>
      <rect x="14" y="14" width="32" height="14" rx="1" fill={color}/>
      <rect x="14" y="14" width="32" height="2.5"       fill="#fff" opacity="0.25"/>
      <circle cx="20" cy="38" r="2.5" fill={color}/>
      <circle cx="30" cy="38" r="2.5" fill="#C8C0AC"/>
      <circle cx="40" cy="38" r="2.5" fill="#C8C0AC"/>
    </svg>
  );
}
const EP_ICONS = {
  compression: EpFormingIcon,
  vacuum:      EpFormingIcon,
  injection:   EpInjectionIcon,
  transfer:    EpTransferIcon,
  desma:       EpDesmaIcon,
  aux:         EpAuxIcon,
};

/* ── MachineNode ── */
function EpMachineNode({ m, selected, dragging, onPointerDown, onDelete, onRename, onSetCategory, catMenuOpen, onToggleCatMenu }) {
  const cat   = EP_CAT[m.category]   || EP_CATEGORIES[0];
  const color = EP_COLOR[m.category] || '#B8965A';
  const Icon  = EP_ICONS[m.category] || EpFormingIcon;
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);

  return (
    <div
      className={`ep-mcard${selected ? ' selected' : ''}${dragging ? ' dragging' : ''}`}
      style={{ left: m.x, top: m.y }}
      onPointerDown={onPointerDown}
      onClick={e => e.stopPropagation()}
    >
      <span className="ep-stripe" style={{ background: color }}/>
      <button className="ep-del-btn" onClick={e => { e.stopPropagation(); onDelete(); }}>×</button>

      <div className="ep-mcard-hdr" style={{ position:'relative' }}>
        <span className="ep-mcard-cap">{m.cap}T</span>
        <button className="ep-cat-pill" style={{ color }} onClick={e => { e.stopPropagation(); onToggleCatMenu(); }}>
          <span className="ep-cat-dot" style={{ background: color }}/>
          {cat.name.slice(0, 4)}
        </button>
        {catMenuOpen && (
          <div className="ep-cat-menu" onClick={e => e.stopPropagation()} style={{ right:0, left:'auto' }}>
            {EP_CATEGORIES.map(c => (
              <div key={c.key} className="ep-cat-menu-item" onClick={() => onSetCategory(c.key)}>
                <span className="ep-cat-swatch" style={{ background: c.color }}/>
                {c.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ep-mcard-icon" style={{ filter: dragging ? 'brightness(0.96)' : 'none' }}>
        <Icon color={color}/>
      </div>

      <div className="ep-mcard-foot">
        {editing ? (
          <input ref={inputRef} className="ep-id-input" defaultValue={m.id}
            onBlur={e => { onRename(e.target.value); setEditing(false); }}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditing(false); }}
          />
        ) : (
          <div className="ep-mcard-id" onClick={e => { e.stopPropagation(); setEditing(true); }} title="Click to rename">{m.id}</div>
        )}
        <div className="ep-mcard-cat" style={{ color }}>{cat.name}</div>
      </div>
    </div>
  );
}

/* ── Inspector ── */
function EpInspector({ m, onRename, onSetCategory, onCapChange, onDelete }) {
  const color = EP_COLOR[m.category] || '#B8965A';
  const Icon  = EP_ICONS[m.category] || EpFormingIcon;
  const cat   = EP_CAT[m.category]   || EP_CATEGORIES[0];
  return (
    <div>
      <div className="ep-insp-card" style={{ borderColor: color + '55' }}>
        <div className="ep-insp-icon" style={{ background: color + '18', border: `1px solid ${color}44` }}>
          <Icon color={color}/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="ep-insp-id">{m.id}</div>
          <div className="ep-insp-sub" style={{ color }}>{cat.name} · {m.cap}T</div>
        </div>
        <button className="ep-insp-del" onClick={onDelete} title="Delete">×</button>
      </div>

      <div className="ep-field">
        <span className="lbl">Machine ID</span>
        <input className="ep-input" defaultValue={m.id}
          onBlur={e => onRename(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
        />
      </div>

      <div className="ep-field">
        <span className="lbl">Category</span>
        <div className="ep-cat-grid">
          {EP_CATEGORIES.map(c => (
            <button key={c.key}
              className={`ep-cat-btn${m.category === c.key ? ' active' : ''}`}
              style={m.category === c.key ? { borderColor: c.color } : {}}
              onClick={() => onSetCategory(c.key)}
            >
              <span style={{ width:8, height:8, borderRadius:'50%', background: c.color, display:'inline-block', flexShrink:0 }}/>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="ep-field">
        <span className="lbl">Capacity (Tonnage)</span>
        <input className="ep-input" type="number" defaultValue={m.cap}
          onBlur={e => onCapChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
        />
      </div>

      <div className="ep-xy">
        <div className="ep-field" style={{ marginBottom:0 }}>
          <span className="lbl">X</span>
          <div className="ep-xy-val">{m.x}px</div>
        </div>
        <div className="ep-field" style={{ marginBottom:0 }}>
          <span className="lbl">Y</span>
          <div className="ep-xy-val">{m.y}px</div>
        </div>
      </div>
    </div>
  );
}

function EpEmptyInspector({ total }) {
  return (
    <div className="ep-inspector-empty">
      <div className="icon-box">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9CA3AF" strokeWidth="1.4">
          <rect x="3" y="3" width="6" height="6" rx="1"/>
          <rect x="11" y="3" width="6" height="6" rx="1"/>
          <rect x="3" y="11" width="6" height="6" rx="1"/>
          <rect x="11" y="11" width="6" height="6" rx="1"/>
        </svg>
      </div>
      <div className="hint">No selection</div>
      <p>Click a machine on the canvas to inspect, rename, or recategorize it.<br/>
        <span style={{ color:'var(--muted)' }}>{total} machines on floor.</span>
      </p>
    </div>
  );
}

/* ── Main EditPage ── */
function EditPage({ layout, onSave, onCancel }) {
  const [machines,  setMachines]  = useState(() => EP_SEED.map(m => ({ ...m })));
  const [selected,  setSelected]  = useState(null);
  const [drag,      setDrag]      = useState(null);
  const [showGrid,  setShowGrid]  = useState(true);
  const [snapOn,    setSnapOn]    = useState(true);
  const [toast,     setToast]     = useState(null);
  const [catMenu,   setCatMenu]   = useState(null);
  const canvasRef    = useRef(null);
  const fileInputRef = useRef(null);

  function onCanvasDown(e) {
    if (e.target === canvasRef.current) { setSelected(null); setCatMenu(null); }
  }

  const onPointerDownMachine = useCallback((e, m) => {
    if (e.target.closest('.ep-id-input,.ep-cat-menu,.ep-del-btn,.ep-cat-pill')) return;
    e.preventDefault();
    setSelected(m.id);
    setCatMenu(null);
    const rect  = canvasRef.current.getBoundingClientRect();
    const scale = parseFloat(document.getElementById('stage').dataset.scale) || 1;
    const px = (e.clientX - rect.left) / scale;
    const py = (e.clientY - rect.top)  / scale;
    setDrag({ id: m.id, ox: px - m.x, oy: py - m.y });
  }, []);

  useEffect(() => {
    if (!drag) return;
    function move(e) {
      const rect  = canvasRef.current.getBoundingClientRect();
      const scale = parseFloat(document.getElementById('stage').dataset.scale) || 1;
      const px = (e.clientX - rect.left) / scale;
      const py = (e.clientY - rect.top)  / scale;
      let nx = px - drag.ox, ny = py - drag.oy;
      if (snapOn) { nx = epSnap(nx); ny = epSnap(ny); }
      const cw = canvasRef.current.clientWidth, ch = canvasRef.current.clientHeight;
      nx = Math.max(0, Math.min(nx, cw - 92));
      ny = Math.max(0, Math.min(ny, ch - 112));
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

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        setMachines(ms => ms.filter(m => m.id !== selected));
        setSelected(null);
      }
      if (e.key === 'Escape') { setSelected(null); setCatMenu(null); }
      if (selected && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const d = e.shiftKey ? EP_GRID * 5 : EP_GRID;
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
  }, [selected]);

  function addMachine() {
    const ids = new Set(machines.map(m => m.id));
    let n = 1, id;
    do { id = `M${String(n).padStart(2,'0')}`; n++; } while (ids.has(id));
    const x = epSnap(60 + (machines.length % 12) * 100);
    const y = epSnap(40 + Math.floor(machines.length / 12) * 160);
    setMachines(ms => [...ms, { id, category:'compression', x, y, cap:200 }]);
    setSelected(id);
  }

  function deleteMachine(id) {
    setMachines(ms => ms.filter(m => m.id !== id));
    if (selected === id) setSelected(null);
  }

  function renameMachine(id, next) {
    next = next.toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0, 8);
    if (!next) return;
    if (next !== id && machines.some(m => m.id === next)) { flash('Duplicate ID — skipped', true); return; }
    setMachines(ms => ms.map(m => m.id === id ? { ...m, id: next } : m));
    if (selected === id) setSelected(next);
  }

  function setCategory(id, cat) {
    setMachines(ms => ms.map(m => m.id === id ? { ...m, category: cat } : m));
    setCatMenu(null);
  }

  function setCapacity(id, cap) {
    setMachines(ms => ms.map(m => m.id === id ? { ...m, cap: Math.max(0, Number(cap) || 0) } : m));
  }

  function flash(msg, err) {
    setToast({ msg, err: !!err });
    setTimeout(() => setToast(null), 2200);
  }

  function reSnapAll() {
    setMachines(ms => ms.map(m => ({ ...m, x: epSnap(m.x), y: epSnap(m.y) })));
    flash('All positions re-snapped to grid');
  }

  function loadJson(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.machines)) throw new Error('Missing machines array');
        const norm = data.machines.map(m => ({
          id:       String(m.id || '').toUpperCase().slice(0, 8) || 'M??',
          category: EP_CAT[m.category] ? m.category : 'compression',
          cap:      Number(m.cap) || 200,
          x:        Number(m.x)  || 0,
          y:        Number(m.y)  || 0,
        }));
        setMachines(norm); setSelected(null);
        flash(`${norm.length} machines imported`);
      } catch (err) { flash(`Import failed: ${err.message}`, true); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function saveJson() {
    const data = {
      version:1, exported: new Date().toISOString(), grid: EP_GRID,
      machines: machines.map(m => ({ id:m.id, category:m.category, cap:m.cap, x:m.x, y:m.y })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'machine-layout.json'; a.click();
    URL.revokeObjectURL(url);
    flash(`${machines.length} machines exported`);
  }

  const groupCounts = useMemo(() => {
    const c = {};
    machines.forEach(m => { c[m.category] = (c[m.category] || 0) + 1; });
    return c;
  }, [machines]);

  const selectedMachine = selected ? machines.find(m => m.id === selected) : null;

  return (
    <div className="ep-wrap">

      {/* ── Toolbar ── */}
      <div className="ep-toolbar">
        <div className="ep-toolbar-left">
          <span className="ep-badge">Layout Editor</span>
          <button className="ep-tb-btn" onClick={addMachine}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5.5 1.5v8M1.5 5.5h8" strokeLinecap="round"/></svg>
            Add Machine
          </button>
          <button className="ep-tb-btn" onClick={reSnapAll}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="9" height="9" rx=".5"/><path d="M4 1v9M7 1v9M1 4h9M1 7h9"/></svg>
            Re-snap
          </button>
          <button className="ep-tb-btn danger" onClick={() => {
            if (!machines.length) return;
            if (!confirm(`Remove all ${machines.length} machines?`)) return;
            setMachines([]); setSelected(null);
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 3h7M4.5 5v3M6.5 5v3M3 3l.5 6.5h4L8 3"/></svg>
            Clear
          </button>
          <div className="ep-divider"/>
          <label className="ep-tb-btn" style={{ cursor:'pointer' }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5.5 7.5V1.5M3 4l2.5-2.5L8 4M2 9.5h7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Load JSON
            <input ref={fileInputRef} type="file" accept=".json" style={{ display:'none' }} onChange={loadJson}/>
          </label>
          <button className="ep-tb-btn" onClick={saveJson}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5.5 1.5v6M3 5l2.5 2.5L8 5M2 9.5h7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Save JSON
          </button>
        </div>

        <div className="ep-toolbar-mid">
          <label className="ep-check-label">
            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)}/>
            Grid
          </label>
          <label className="ep-check-label">
            <input type="checkbox" checked={snapOn} onChange={e => setSnapOn(e.target.checked)}/>
            Snap
          </label>
        </div>

        <div className="ep-toolbar-right">
          <button className="ep-tb-btn primary" onClick={() => onSave(machines)}>
            Apply to Dashboard
          </button>
          <button className="ep-tb-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ep-body">

        {/* Canvas */}
        <div className="ep-canvas-wrap">
          <div className="ep-canvas-hdr">
            <span>Floor Canvas · Plant 04</span>
            <span>Grid {EP_GRID}px · {machines.length} machines</span>
          </div>
          <div
            ref={canvasRef}
            className={`ep-canvas${showGrid ? ' grid-on' : ''}`}
            onMouseDown={onCanvasDown}
          >
            {machines.map(m => (
              <EpMachineNode
                key={m.id}
                m={m}
                selected={selected === m.id}
                dragging={drag && drag.id === m.id}
                onPointerDown={e => onPointerDownMachine(e, m)}
                onDelete={() => deleteMachine(m.id)}
                onRename={id => renameMachine(m.id, id)}
                onSetCategory={cat => setCategory(m.id, cat)}
                catMenuOpen={catMenu === m.id}
                onToggleCatMenu={() => setCatMenu(catMenu === m.id ? null : m.id)}
              />
            ))}
            {drag && (() => {
              const m = machines.find(mm => mm.id === drag.id);
              if (!m) return null;
              return <div className="ep-coord" style={{ left: m.x + 94, top: m.y - 4 }}>x: {m.x}  y: {m.y}</div>;
            })()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="ep-sidebar">

          <div className="ep-sidebar-section">
            <div className="ep-sidebar-hdr">
              <span className="ttl">Inspector</span>
              <span className="num">[01]</span>
            </div>
            <div className="ep-inspector-body">
              {selectedMachine
                ? <EpInspector
                    m={selectedMachine}
                    onRename={id => renameMachine(selected, id)}
                    onSetCategory={cat => setCategory(selected, cat)}
                    onCapChange={cap => setCapacity(selected, cap)}
                    onDelete={() => deleteMachine(selected)}
                  />
                : <EpEmptyInspector total={machines.length}/>
              }
            </div>
          </div>

          <div className="ep-sidebar-section">
            <div className="ep-sidebar-hdr">
              <span className="ttl">Categories</span>
              <span className="num">{machines.length} TOTAL</span>
            </div>
            <div>
              {EP_CATEGORIES.map(c => (
                <div key={c.key} className="ep-cat-row">
                  <div className="ep-cat-row-left">
                    <div className="ep-cat-bar" style={{ background: c.color }}/>
                    <span className="ep-cat-name">{c.name}</span>
                  </div>
                  <span className="ep-cat-count">{String(groupCounts[c.key] || 0).padStart(2,'0')}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
            <div className="ep-sidebar-hdr" style={{ borderBottom:'1px solid var(--rule)' }}>
              <span className="ttl">Shortcuts</span>
              <span className="num">[02]</span>
            </div>
            <div className="ep-shortcuts">
              {[
                ['DRAG',           'Reposition machine'],
                ['CLICK',          'Select / inspect'],
                ['↑ ↓ ← →',       'Nudge 20px'],
                ['⇧ + ↑ ↓ ← →',  'Nudge 100px'],
                ['DEL / ⌫',        'Remove selected'],
                ['ESC',            'Deselect'],
              ].map(([k, v]) => (
                <div key={k} className="ep-shortcut">
                  <span className="ep-shortcut-key">{k}</span>
                  <span className="ep-shortcut-val">{v}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {toast && <div className={`ep-toast${toast.err ? ' err' : ''}`}>{toast.msg}</div>}
    </div>
  );
}
