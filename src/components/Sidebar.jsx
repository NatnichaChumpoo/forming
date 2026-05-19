// ─────────────────────────────────────────────
//  src/components/Sidebar.jsx
//  Left column: KPIs, legend, Excel import/export
// ─────────────────────────────────────────────


function Sidebar({ counts, total, statuses, partNos, setStatuses, setPartNos }) {
  const plan     = 5060752;
  const actual   = 2197508;
  const ng       = 0;
  const diff     = plan - actual;
  const productivity = (actual / plan * 100);

  const fileInputRef = useRef(null);
  const [importFeedback, setImportFeedback]   = React.useState('');
  const [importIsErr,    setImportIsErr]      = React.useState(false);

  // ── Import ──
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const { newStatuses, newPartNos, updatedCount } =
          parseImportFile(evt.target.result, statuses, partNos);
        setStatuses(newStatuses);
        setPartNos(newPartNos);
        setImportFeedback(`✓ ${updatedCount} machines updated from "${file.name}"`);
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
    exportStatusFile(statuses, partNos, counts, total, plan, actual);
  }

  return (
    <div className="col left">
      {/* I · Production Summary */}
      <div className="panel-title">
        <span className="t">Production Summary</span>
        <span className="n">I</span>
      </div>

      <div className="hero-kpis">
        <div className="kpi accent"><div className="lbl">Plan</div>   <div className="val num">{fmtNum(plan)}<span className="unit">PCS</span></div></div>
        <div className="kpi">       <div className="lbl">Actual</div> <div className="val num">{fmtNum(actual)}<span className="unit">PCS</span></div></div>
        <div className="kpi">       <div className="lbl">NG</div>     <div className="val num">{ng}<span className="unit">PCS</span></div></div>
        <div className="kpi">       <div className="lbl">Diff</div>   <div className="val num">{fmtNum(diff)}<span className="unit">PCS</span></div></div>
      </div>

      <div className="prod-bar">
        <div className="row">
          <span className="lbl">Productivity</span>
          <span className="val">{productivity.toFixed(2)}%</span>
        </div>
        <div className="bar"><div className="fill" style={{ width: productivity + '%' }}/></div>
        <div className="tickrow"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
        <div className="row" style={{ marginTop:10, marginBottom:0 }}>
          <span className="lbl">Man Power</span>
          <span className="val">21 / 24 Assigned</span>
        </div>
      </div>

      {/* II · Machine Status Legend */}
      <div className="panel-title tight">
        <span className="t">FormingMachine Status</span>
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

      {/* Excel Import / Export */}
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

      {/* Operations notes */}
      <div className="legend-foot" style={{ marginTop:6 }}>
        <div className="ttl">Operations notes</div>
        <div className="ln">Cycle target <span className="v">{(plan/24/60).toFixed(0)} pcs/min</span></div>
        <div className="ln">OEE rolling 7d <span className="v">86.4%</span></div>
        <div className="ln">Next mold change <span className="v">B11 · 14:20</span></div>
      </div>
    </div>
  );
}
