// ─────────────────────────────────────────────
//  src/components/MachineSvgs.jsx
//  Inline SVG illustrations for each machine kind
// ─────────────────────────────────────────────

function FormingSvg() {
  return (
    <>
      <rect x="15" y="7"  width="30" height="9"  rx="1" fill="#1B2433"/>
      <rect x="15" y="7"  width="30" height="1.5" fill="#C8A96B"/>
      <rect x="19" y="3"  width="3"  height="4"  fill="#C8A96B"/>
      <rect x="29" y="3"  width="3"  height="4"  fill="#C8A96B"/>
      <rect x="38" y="3"  width="3"  height="4"  fill="#C8A96B"/>
      <rect x="9"  y="16" width="3"  height="32" fill="#D7D1BF"/>
      <rect x="48" y="16" width="3"  height="32" fill="#D7D1BF"/>
      <rect x="13" y="19" width="34" height="26" rx="2" fill="#1B2433"/>
      <rect x="17" y="21" width="4"  height="2"  fill="#E2B86C" opacity="0.85"/>
      <rect x="28" y="21" width="4"  height="2"  fill="#E2B86C" opacity="0.85"/>
      <rect x="39" y="21" width="4"  height="2"  fill="#E2B86C" opacity="0.85"/>
      <rect className="core" x="16" y="24" width="28" height="18" rx="1.5"/>
      <rect x="16" y="24" width="28" height="3"  fill="#fff" opacity="0.18"/>
      <rect x="3"  y="22" width="5"  height="8"  fill="#C8A96B" rx="1"/>
      <rect x="52" y="22" width="5"  height="8"  fill="#C8A96B" rx="1"/>
      <rect x="4"  y="48" width="52" height="6"  fill="#3A4356" rx="1"/>
      <rect x="4"  y="54" width="52" height="2"  fill="#1B2433"/>
      <circle cx="30" cy="66" r="7" fill="#1B2433"/>
      <circle cx="30" cy="66" r="5" fill="none" stroke="#C8A96B" strokeWidth="0.6"/>
      <rect x="29" y="61" width="2" height="10" fill="#C8A96B" opacity="0.6" transform="rotate(30 30 66)"/>
      <rect x="29" y="61" width="2" height="10" fill="#C8A96B" opacity="0.6" transform="rotate(150 30 66)"/>
      <rect x="29" y="61" width="2" height="10" fill="#C8A96B" opacity="0.6" transform="rotate(270 30 66)"/>
      <circle cx="30" cy="66" r="1.5" fill="#C8A96B"/>
      <path d="M14 66 L19 66 M16 64 L19 66 L16 68" stroke="#C8A96B" strokeWidth="0.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M46 66 L41 66 M44 64 L41 66 L44 68" stroke="#C8A96B" strokeWidth="0.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  );
}

function DesmaSvg() {
  return (
    <>
      <path d="M6 24 Q 10 4 30 4 Q 50 4 54 24" stroke="#1B2433" strokeWidth="2.5" fill="none"/>
      <circle cx="6"  cy="24" r="3.5" fill="#C8A96B"/>
      <circle cx="54" cy="24" r="3.5" fill="#C8A96B"/>
      <circle cx="30" cy="4"  r="2.5" fill="#1B2433"/>
      <rect x="28" y="4"  width="4" height="6"  fill="#1B2433"/>
      <rect x="27" y="10" width="6" height="2"  fill="#C8A96B"/>
      <rect x="17" y="20" width="26" height="42" fill="#fff" stroke="#1B2433" strokeWidth="1.2"/>
      <rect x="20" y="23" width="20" height="12" fill="#1B2433"/>
      <rect x="22" y="25" width="16" height="1"   fill="#C8A96B"/>
      <rect x="22" y="27" width="10" height="0.8" fill="#fff" opacity="0.5"/>
      <rect x="22" y="29" width="12" height="0.8" fill="#fff" opacity="0.5"/>
      <rect x="22" y="31" width="8"  height="0.8" fill="#fff" opacity="0.5"/>
      <rect className="core" x="20" y="38" width="20" height="20" rx="1"/>
      <rect x="20" y="38" width="20" height="3"  fill="#fff" opacity="0.15"/>
      <rect x="10" y="40" width="6"  height="18" fill="#2A3447"/>
      <rect x="44" y="40" width="6"  height="18" fill="#2A3447"/>
      <rect x="11" y="43" width="4"  height="3"  fill="#C8A96B"/>
      <rect x="45" y="43" width="4"  height="3"  fill="#C8A96B"/>
      <rect x="8"  y="62" width="44" height="8"  fill="#3A4356" rx="1"/>
      <rect x="8"  y="70" width="44" height="3"  fill="#1B2433"/>
    </>
  );
}

function InjectionSvg() {
  return (
    <>
      <path d="M24 4 L36 4 L34 12 L26 12 Z" fill="#1B2433"/>
      <rect x="27" y="12" width="6"  height="4"  fill="#1B2433"/>
      <rect x="18" y="16" width="24" height="34" fill="#fff" stroke="#1B2433" strokeWidth="1"/>
      <rect x="21" y="19" width="4"  height="1.5" fill="#E2B86C"/>
      <rect x="35" y="19" width="4"  height="1.5" fill="#E2B86C"/>
      <rect x="21" y="22" width="4"  height="1.5" fill="#E2B86C"/>
      <rect x="35" y="22" width="4"  height="1.5" fill="#E2B86C"/>
      <rect className="core" x="21" y="27" width="18" height="18" rx="1"/>
      <rect x="21" y="27" width="18" height="3"  fill="#fff" opacity="0.18"/>
      <rect x="6"  y="24" width="5"  height="10" fill="#C8A96B" rx="1"/>
      <rect x="49" y="24" width="5"  height="10" fill="#C8A96B" rx="1"/>
      <rect x="6"  y="50" width="48" height="6"  fill="#3A4356" rx="1"/>
      <rect x="6"  y="56" width="48" height="2"  fill="#1B2433"/>
      <circle cx="30" cy="67" r="6"   fill="#1B2433"/>
      <circle cx="30" cy="67" r="4"   fill="none" stroke="#C8A96B" strokeWidth="0.5"/>
      <circle cx="30" cy="67" r="1.5" fill="#C8A96B"/>
    </>
  );
}

function TransferSvg() {
  return (
    <>
      <rect x="15" y="7"  width="30" height="9"  rx="1" fill="#1B2433"/>
      <rect x="15" y="7"  width="30" height="1.5" fill="#C8A96B"/>
      <rect x="19" y="3"  width="3"  height="4"  fill="#C8A96B"/>
      <rect x="38" y="3"  width="3"  height="4"  fill="#C8A96B"/>
      <rect x="13" y="19" width="34" height="22" rx="2" fill="#1B2433"/>
      <rect className="core" x="16" y="22" width="28" height="16" rx="1"/>
      <rect x="16" y="22" width="28" height="2.5" fill="#fff" opacity="0.18"/>
      <rect x="3"  y="22" width="5"  height="8"  fill="#C8A96B" rx="1"/>
      <rect x="4"  y="42" width="52" height="6"  fill="#3A4356" rx="1"/>
      <rect x="4"  y="48" width="52" height="2"  fill="#1B2433"/>
      <circle cx="22" cy="60" r="5"   fill="#1B2433"/>
      <circle cx="22" cy="60" r="1.3" fill="#C8A96B"/>
      <circle cx="38" cy="60" r="5"   fill="#1B2433"/>
      <circle cx="38" cy="60" r="1.3" fill="#C8A96B"/>
      <rect x="56" y="34" width="56" height="14" fill="#2A3447" rx="1"/>
      <rect x="56" y="34" width="56" height="2"  fill="#C8A96B" opacity="0.6"/>
      <rect x="56" y="46" width="56" height="2"  fill="#1B2433"/>
      <circle cx="62"  cy="41" r="1.6" fill="#C8A96B"/>
      <circle cx="75"  cy="41" r="1.6" fill="#C8A96B"/>
      <circle cx="88"  cy="41" r="1.6" fill="#C8A96B"/>
      <circle cx="101" cy="41" r="1.6" fill="#C8A96B"/>
      <path d="M62 28 L108 28 M102 24 L108 28 L102 32" stroke="#C8A96B" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="96" y="48" width="18" height="14" fill="#3A4356" rx="1"/>
      <rect x="96" y="62" width="18" height="3"  fill="#1B2433"/>
      <rect x="99" y="51" width="12" height="7"  fill="#1B2433"/>
      <rect x="101" y="53" width="8" height="1"  fill="#C8A96B"/>
    </>
  );
}

function VacuumSvg() {
  return (
    <>
      {/* Overhead vacuum manifold (horizontal pipe with drop legs) */}
      <rect x="6"  y="2"  width="48" height="2.5" rx="0.5" fill="#1B2433"/>
      <rect x="6"  y="2"  width="48" height="0.8" fill="#C8A96B"/>
      <circle cx="6"  cy="3.2" r="1.6" fill="#C8A96B"/>
      <circle cx="54" cy="3.2" r="1.6" fill="#C8A96B"/>
      <rect x="18" y="4.5" width="2"  height="3" fill="#1B2433"/>
      <rect x="29" y="4.5" width="2"  height="3" fill="#1B2433"/>
      <rect x="40" y="4.5" width="2"  height="3" fill="#1B2433"/>

      {/* Press head (no exhaust vents — replaced by manifold above) */}
      <rect x="15" y="7"  width="30" height="9"  rx="1" fill="#1B2433"/>
      <rect x="15" y="7"  width="30" height="1.5" fill="#C8A96B"/>

      {/* Frame columns */}
      <rect x="9"  y="16" width="3"  height="32" fill="#D7D1BF"/>
      <rect x="48" y="16" width="3"  height="32" fill="#D7D1BF"/>

      {/* Machine body */}
      <rect x="13" y="19" width="34" height="26" rx="2" fill="#1B2433"/>
      <rect x="17" y="21" width="4"  height="2"  fill="#E2B86C" opacity="0.85"/>
      <rect x="28" y="21" width="4"  height="2"  fill="#E2B86C" opacity="0.85"/>
      <rect x="39" y="21" width="4"  height="2"  fill="#E2B86C" opacity="0.85"/>

      {/* Core (status colour) */}
      <rect className="core" x="16" y="24" width="28" height="18" rx="1.5"/>
      <rect x="16" y="24" width="28" height="3"  fill="#fff" opacity="0.18"/>

      {/* Right-side vacuum cylinder/tank with banding */}
      <rect x="52" y="22" width="6"  height="20" rx="2"   fill="#1B2433"/>
      <rect x="52" y="22" width="6"  height="2"  fill="#C8A96B"/>
      <rect x="52" y="40" width="6"  height="2"  fill="#C8A96B"/>
      <rect x="53" y="27" width="4"  height="0.8" fill="#C8A96B" opacity="0.6"/>
      <rect x="53" y="30" width="4"  height="0.8" fill="#C8A96B" opacity="0.6"/>
      <rect x="53" y="33" width="4"  height="0.8" fill="#C8A96B" opacity="0.6"/>
      <rect x="47" y="30" width="5"  height="2.5" fill="#1B2433"/>

      {/* Left-side auxiliary vacuum duct with elbow */}
      <rect x="2"  y="26" width="2"  height="14" fill="#1B2433"/>
      <rect x="2"  y="26" width="2"  height="0.8" fill="#C8A96B"/>
      <rect x="4"  y="32" width="5"  height="2"  fill="#1B2433"/>

      {/* Base */}
      <rect x="4"  y="48" width="52" height="6"  fill="#3A4356" rx="1"/>
      <rect x="4"  y="54" width="52" height="2"  fill="#1B2433"/>

      {/* Vacuum gauge wheel — needle angled, indicating suction */}
      <circle cx="30" cy="66" r="7" fill="#1B2433"/>
      <circle cx="30" cy="66" r="5" fill="none" stroke="#C8A96B" strokeWidth="0.6"/>
      <rect x="29.4" y="60.5" width="1.2" height="6" fill="#C8A96B" transform="rotate(-55 30 66)"/>
      <circle cx="30" cy="66" r="1.5" fill="#C8A96B"/>
      <path d="M14 66 L19 66 M16 64 L19 66 L16 68" stroke="#C8A96B" strokeWidth="0.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  );
}

const KIND_SVG = {
  forming:   FormingSvg,
  vacuum:    VacuumSvg,
  desma:     DesmaSvg,
  injection: InjectionSvg,
  transfer:  TransferSvg,
};
