// ─────────────────────────────────────────────
//  src/utils/helpers.js
//  Date formatting, number formatting, seeded RNG
// ─────────────────────────────────────────────

export function fmtNum(n) {
  return n.toLocaleString('en-US');
}

export function fmtTime(d) {
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function shortTime(d) {
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Deterministic seeded RNG — used so initial machine statuses are consistent on reload */
export function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

/** CSS variable name for a given status key */
export function stVar(k) {
  const map = {running:'run',down:'down',setup:'setup',damage:'damage',qa:'qa',material:'mat',manpower:'man',plan:'plan'};
  return `var(--st-${map[k] || k})`;
}
