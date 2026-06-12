# Forming Monitor — Workflow

เอกสารนี้สรุปขั้นตอนการทำงาน (workflow) ของระบบ Forming Operations Monitor
ตั้งแต่สถาปัตยกรรมโดยรวม ไปจนถึง flow การใช้งานหลักแต่ละจุด

---

## 1. ภาพรวมสถาปัตยกรรม (Architecture Overview)

```mermaid
flowchart LR
    subgraph Browser["Browser (Client)"]
        UI["React App (Babel Standalone, no bundler)\nindex.html → src/main.jsx → Dashboard.jsx"]
        XLSX["SheetJS / ExcelJS\n(Import-Export .xlsx)"]
        UI <--> XLSX
    end

    subgraph Server["Backend — Node.js / Express (port 4000)"]
        API["/api/auth\n/api/machines\n/api/health"]
        MW["adminAuth middleware\n(ตรวจ header X-Admin-Pin)"]
        API --> MW
    end

    subgraph DB["MySQL — forming_monitor"]
        T1[(machines)]
        T2[(machine_status)]
        T3[(status_logs)]
    end

    UI <-- "fetch() ทุก 5 วิ\nGET /api/machines" --> API
    UI -- "PATCH/POST/DELETE\n(แก้ status, layout, CRUD)" --> API
    API --> T1
    API --> T2
    API --> T3

    subgraph Deploy["Deployment"]
        DC["docker-compose.yml\n(frontend + backend + mysql)"]
        SCR["scripts/update-server.ps1\n(git pull → build → up)"]
    end
    Server -.-> DC
    Browser -.-> DC
```

**ส่วนประกอบหลัก**
- **Frontend** — Static site (`index.html`, `src/**`) โหลดผ่าน HTTP server, ไม่มี build step (Babel แปลง JSX ใน browser)
- **Backend** — Express API คุยกับ MySQL ผ่าน `mysql2/promise` connection pool
- **Database** — ตาราง `machines` (ข้อมูลเครื่องจักร/ตำแหน่ง), `machine_status` (สถานะปัจจุบัน), `status_logs` (ประวัติการเปลี่ยนสถานะ)
- **Auth** — ใช้ PIN เดียว (`ADMIN_PIN` ใน `.env`) ตรวจผ่าน `/api/auth/verify` และ header `X-Admin-Pin`

---

## 2. โหลดหน้า Dashboard + Live Polling

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend (Dashboard.jsx)
    participant API as Backend (/api/machines)
    participant DB as MySQL

    User->>FE: เปิดเว็บ index.html
    FE->>FE: mount Dashboard, useState(statuses, machines, ...)
    loop ทุก 5 วินาที
        FE->>API: GET /api/machines
        API->>DB: SELECT m.*, s.status, s.part_no, s.remark ... LEFT JOIN
        DB-->>API: rows
        API-->>FE: { ok:true, data:[...] }
        FE->>FE: setStatuses / setPartNos / setRemarks / setMachines
        FE->>User: re-render FloorMap + Sidebar
    end
    Note over FE: ถ้า fetch ล่าสุด < 10 วิ\nหลัง user save เอง → ข้าม poll รอบนั้น\n(กัน UI กระพริบทับค่าที่เพิ่ง save)
```

---

## 3. Operator เปลี่ยนสถานะเครื่องจักร

```mermaid
sequenceDiagram
    participant User as Operator
    participant FE as Dashboard / MachineModal
    participant API as Backend
    participant DB as MySQL

    User->>FE: คลิก machine บน FloorMap
    FE->>FE: setSelected(id) → เปิด MachineModal
    User->>FE: เลือก status ใหม่ + กรอก remark / part no
    User->>FE: กด "Apply"
    FE->>FE: lastSaved = now (กัน poll ทับ)
    FE->>FE: setStatuses/setRemarks (อัปเดตทันทีบนจอ)
    FE->>API: PATCH /api/machines/:id/status\n{status, remark, part_no, updated_by:"operator"}
    API->>DB: SELECT old status
    API->>DB: INSERT ... ON DUPLICATE KEY UPDATE machine_status
    API->>DB: INSERT INTO status_logs (old→new)
    DB-->>API: ok
    API-->>FE: { ok:true }
    FE-->>User: ปิด modal, KPI/legend อัปเดตตาม counts ใหม่
```

---

## 4. Edit Layout Mode (Admin)

```mermaid
sequenceDiagram
    participant User as Admin
    participant FE as Dashboard
    participant API as Backend
    participant DB as MySQL

    User->>FE: กดปุ่ม "Edit Layout"
    alt ยังไม่มี PIN ใน session
        FE->>FE: เปิด PIN modal
        User->>FE: กรอก PIN 4 หลัก
        FE->>API: POST /api/auth/verify {pin}
        API->>API: เทียบกับ process.env.ADMIN_PIN
        API-->>FE: ok / 401 "PIN ไม่ถูกต้อง"
    end
    FE->>FE: เก็บ adminPin.current, setEditMode(true)
    FE->>User: แสดง EditSidebar + FloorMap (โหมดแก้ไข)

    par ลากย้ายตำแหน่ง
        User->>FE: drag machine card
        FE->>FE: snap-to-grid (20px), อัปเดตตำแหน่งบนจอทันที
        FE->>API: PATCH /api/machines/:id {x, y}\nheader X-Admin-Pin
    and เปลี่ยน category / capacity
        User->>FE: เลือก category ใหม่ / แก้ tonnage
        FE->>API: PATCH /api/machines/:id {category|cap}\nheader X-Admin-Pin
    and เปลี่ยน Machine ID (rename)
        User->>FE: แก้ id field, blur/Enter
        FE->>API: PATCH /api/machines/:id/rename-id {new_id}\nheader X-Admin-Pin
        API->>DB: BEGIN TRANSACTION\nตรวจ id ใหม่ไม่ซ้ำ\nUPDATE status_logs/machine_status/machines\nCOMMIT
        API-->>FE: { ok, old_id, new_id }
        FE->>FE: sync state ทุก map (statuses, partNos, remarks) ไปใช้ id ใหม่
    and เพิ่มเครื่องใหม่
        User->>FE: "+ Add Machine" → กรอก id/category/cap → ยืนยัน
        FE->>API: POST /api/machines {id, category, cap}\nheader X-Admin-Pin
        API->>DB: INSERT machines + INSERT machine_status (status='running')
    and ลบเครื่อง
        User->>FE: เลือกเครื่อง → Delete (หรือกด DEL key) → ยืนยัน
        FE->>API: DELETE /api/machines/:id\nheader X-Admin-Pin
        API->>DB: DELETE FROM status_logs/machine_status/machines WHERE id=?
    end

    API-->>FE: ok ทุกคำสั่ง (มี adminAuth middleware เช็ค X-Admin-Pin)
    User->>FE: กด "✓ Done" → setEditMode(false), กลับสู่ normal view
```

---

## 5. Import / Export ข้อมูลผ่าน Excel

```mermaid
sequenceDiagram
    participant User
    participant FE as Sidebar
    participant XLSX as SheetJS / ExcelJS (browser)
    participant API as Backend
    participant DB as MySQL

    rect rgb(230,245,255)
    Note over User,DB: Import "MC Daily" (.xlsx)
    User->>FE: เลือกไฟล์ .xlsx (Import MC Daily)
    FE->>XLSX: parseImportFile(arrayBuffer)
    XLSX->>XLSX: หา header row อัตโนมัติ\n(MC No. / Status / Part No.)
    XLSX->>XLSX: map status text → status key\n(ผ่าน IMPORT_STATUS_MAP)
    loop แต่ละแถวที่ map สำเร็จ
        XLSX->>API: PATCH /api/machines/:id/status\n{status, part_no, updated_by:"import"}
        API->>DB: UPSERT machine_status + INSERT status_logs
    end
    XLSX-->>FE: summary (อัปเดต/ข้าม/ผิดพลาด กี่เครื่อง)
    FE-->>User: แสดงผลสรุปใต้ปุ่ม import
    end

    rect rgb(255,245,230)
    Note over User,XLSX: Export "M_C Status Data.xlsx"
    User->>FE: กด "Export Status"
    FE->>XLSX: exportStatusFile(statuses, partNos, counts, ...)
    XLSX->>XLSX: โหลดโลโก้ assets/CARLOGO.png (ถ้ามี)
    XLSX->>XLSX: สร้าง workbook: header band, KPI, ตาราง MC ทุกเครื่อง
    XLSX-->>User: ดาวน์โหลดไฟล์ .xlsx
    end
```

---

## 6. Deploy / Update Server

```mermaid
flowchart TD
    A["รัน scripts/update-server.ps1"] --> B{docker-compose.yml\nมีการแก้ไข local?}
    B -- "ใช่" --> C["สำรองไฟล์ .local-backup-*\nแล้ว git restore เป็นเวอร์ชัน tracked"]
    B -- "ไม่" --> D
    C --> D["git pull --ff-only (main)"]
    D --> E{มี .env?}
    E -- "ไม่มี" --> F["copy .env.example → .env"]
    E -- "มี" --> G
    F --> G["ตั้งค่า PORT / CORS_ORIGIN ตาม parameter"]
    G --> H["docker compose config --services"]
    H --> I{-SkipBuild?}
    I -- "ไม่" --> J["docker compose build --no-cache"]
    I -- "ใช่" --> K
    J --> K["docker compose up -d"]
    K --> L["docker compose ps\n(แสดงสถานะ container)"]
```

---

## สรุปไฟล์สำคัญที่เกี่ยวข้องกับแต่ละ workflow

| Workflow | ไฟล์หลัก |
|---|---|
| Live polling / state | `src/components/Dashboard.jsx` |
| แก้ไขสถานะเครื่อง | `src/components/MachineModal.jsx`, `src/utils/api.js`, `backend/src/routes/machines.js` |
| Edit Layout / Admin | `src/components/Dashboard.jsx` (`EditSidebar`), `src/components/EditPage.jsx`, `backend/src/middleware/adminAuth.js`, `backend/src/routes/auth.js` |
| Import/Export Excel | `src/components/Sidebar.jsx`, `src/utils/parseImportFile.js`, `src/utils/excel.js` |
| Database schema/seed | `scripts/sync_server_db.sql` (local-only, gitignored) |
| Deploy | `docker-compose.yml`, `scripts/update-server.ps1`, `.env.example` |
