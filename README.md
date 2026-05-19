# Forming Machine — Operations Monitor

Real-time production floor dashboard for Plant 04.  
Built with **React 18**, **Babel Standalone**, and **SheetJS** — no bundler required.

---

## 📁 Project Structure

```
forming-monitor/
│
├── index.html                  ← Entry point (open this in browser)
│
└── src/
    │
    ├── main.jsx                ← Mounts React root → <Dashboard/>
    │
    ├── styles.css              ← All design tokens + component styles
    │
    ├── data/
    │   ├── machines.js         ← MC_META, LAYOUT, EXPORT_ORDER
    │   └── statuses.js         ← STATUSES, statusByKey, REMARKS, import/export maps
    │
    ├── utils/
    │   ├── helpers.js          ← fmtNum, fmtTime, shortTime, seededRand, stVar
    │   └── excel.js            ← parseImportFile(), exportStatusFile()
    │
    └── components/
        ├── MachineSvgs.jsx     ← SVG illustrations: Forming, Desma, Injection, Transfer
        ├── FloorMap.jsx        ← MachineCard, Group, FloorMap (floor layout grid)
        ├── Sidebar.jsx         ← Left panel: KPIs, legend, Excel import/export
        ├── MachineModal.jsx    ← Machine detail + status reassign modal
        └── Dashboard.jsx       ← Root component (state, clock, layout)
```

---

## ▶️ วิธีรัน (How to Run)

### วิธีที่ 1 — VS Code Live Server (แนะนำ)
1. ติดตั้ง extension **"Live Server"** ใน VS Code
2. คลิกขวาที่ `index.html` → **"Open with Live Server"**
3. เปิด browser ไปที่ `http://127.0.0.1:5500`

### วิธีที่ 2 — Python HTTP Server
```bash
# Python 3
cd forming-monitor
python -m http.server 8080

# เปิด browser ไปที่:
# http://localhost:8080
```

### วิธีที่ 3 — Node.js serve
```bash
cd forming-monitor
npx serve .

# เปิด browser ไปที่ URL ที่แสดงใน terminal
```

> ⚠️ **สำคัญ:** ต้องรันผ่าน HTTP server เท่านั้น  
> ไม่สามารถเปิดไฟล์ `index.html` ตรงๆ (`file://`) ได้  
> เพราะ browser จะ block ES module imports จาก local file system

---

## 🖥️ Resolution

Dashboard ออกแบบสำหรับหน้าจอ **1920×1080**  
แต่จะ auto-scale ให้พอดีกับทุก viewport โดยอัตโนมัติ

---

## 📊 Excel Import Format

ไฟล์ `.xlsx` ที่ import ต้องมีคอลัมน์ดังนี้:

| คอลัมน์ A (Status)   | คอลัมน์ B (MC ID) | คอลัมน์ C (Part No.) |
|----------------------|-------------------|----------------------|
| Running              | A01               | PRT-001              |
| Machine Down         | B08               |                      |
| Mold Setup           | C13               | PRT-002              |

**Status ที่รองรับ:**
- `Running`
- `Machine Down`
- `Mold Setup`
- `Mold Damage`
- `Quality Problem`
- `NO Material`
- `NO Manpower`
- `NO Plan`

---

## 🔧 Dependencies (CDN — ไม่ต้อง install)

| Library              | Version  | หน้าที่                        |
|----------------------|----------|-------------------------------|
| React                | 18.3.1   | UI framework                  |
| ReactDOM             | 18.3.1   | DOM rendering                 |
| Babel Standalone     | 7.29.0   | Transpile JSX ใน browser      |
| SheetJS (xlsx)       | 0.18.5   | Import/Export Excel files     |
| Google Fonts         | —        | Cormorant Garamond, Manrope, IBM Plex Mono |

---

## 🗂️ แต่ละไฟล์ทำอะไร

| ไฟล์ | หน้าที่ |
|------|---------|
| `index.html` | โหลด CDN scripts, CSS, mount stage scaling, โหลด main.jsx |
| `src/main.jsx` | จุดเริ่มต้น — render `<Dashboard/>` เข้า `#root` |
| `src/styles.css` | Design tokens (CSS vars) + ทุก component style |
| `src/data/machines.js` | ข้อมูล machine meta, layout map, export order |
| `src/data/statuses.js` | ชื่อ status, remarks, map สำหรับ import/export |
| `src/utils/helpers.js` | ฟังก์ชัน format วันที่/ตัวเลข, seeded RNG, CSS var helper |
| `src/utils/excel.js` | Logic นำเข้า/ส่งออกไฟล์ Excel |
| `src/components/MachineSvgs.jsx` | SVG รูป machine แต่ละประเภท |
| `src/components/FloorMap.jsx` | Grid แผนผังพื้นโรงงาน + machine tiles |
| `src/components/Sidebar.jsx` | Panel ซ้าย: KPIs, legend, Excel buttons |
| `src/components/MachineModal.jsx` | Modal รายละเอียด + เปลี่ยน status |
| `src/components/Dashboard.jsx` | Root component — state management หลัก |
