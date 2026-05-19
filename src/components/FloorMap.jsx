// src/components/FloorMap.jsx — canvas-based, inline edit mode

function CanvasCard({ m, status, selected, editMode, dragging, onClick, onPointerDown, onDelete }) {
  const cat   = CAT_META[m.category] || { name: m.category, color: '#B8965A' };
  const kind  = CAT_KIND[m.category] || 'forming';
  const Inner = KIND_SVG[kind] || KIND_SVG.forming;
  const vb    = kind === 'transfer' ? '0 0 120 80' : '0 0 60 80';

  return (
    <div
      className={`canvas-card vac-tile ${status}${selected ? ' selected' : ''}${editMode ? ' edit-mode' : ''}${dragging ? ' dragging' : ''}`}
      style={{ left: m.x, top: m.y }}
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      <span className="canvas-stripe" style={{ background: cat.color }}/>
      {editMode && (
        <button className="canvas-del-btn" onClick={e => { e.stopPropagation(); onDelete(); }}>×</button>
      )}
      <div className="cap">{m.cap}T</div>
      <svg className="machine" viewBox={vb} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Inner/>
      </svg>
      <div className="id">{m.id}</div>
      <span className="corner"/>
    </div>
  );
}

function FloorMap({ machines, statuses, onSelect, selectedId, editMode, drag, onPointerDownMachine, onDeleteMachine, mapWrapRef, mapCanvasRef }) {
  return (
    <div className="map-wrap" ref={mapWrapRef}>
      <span className="ornament tl"/><span className="ornament tr"/>
      <span className="ornament bl"/><span className="ornament br"/>
      <div className="map-canvas-scroll">
        <div className="map-canvas" ref={mapCanvasRef}>
          {machines.map(m => (
            <CanvasCard
              key={m.id}
              m={m}
              status={statuses[m.id] || 'running'}
              selected={selectedId === m.id}
              editMode={editMode}
              dragging={drag ? drag.id === m.id : false}
              onClick={!editMode ? () => onSelect(m) : undefined}
              onPointerDown={editMode ? e => onPointerDownMachine(e, m) : undefined}
              onDelete={() => onDeleteMachine(m.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
