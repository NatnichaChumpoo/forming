CREATE DATABASE IF NOT EXISTS forming_monitor;
USE forming_monitor;

-- ตารางเครื่องจักร
CREATE TABLE IF NOT EXISTS machines (
  id          VARCHAR(10)  PRIMARY KEY,
  display_id  VARCHAR(10),
  category    VARCHAR(20)  NOT NULL,
  cap         INT          NOT NULL,
  zone        VARCHAR(5),
  x           INT          DEFAULT 0,
  y           INT          DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ตารางสถานะปัจจุบัน (1 row ต่อเครื่อง)
CREATE TABLE IF NOT EXISTS machine_status (
  machine_id  VARCHAR(10)  PRIMARY KEY,
  status      VARCHAR(30)  NOT NULL DEFAULT 'running',
  part_no     VARCHAR(50),
  remark      TEXT,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by  VARCHAR(50),
  FOREIGN KEY (machine_id) REFERENCES machines(id)
);

-- ตาราง log การเปลี่ยนแปลง (ใช้ Step 3)
CREATE TABLE IF NOT EXISTS status_logs (
  id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
  machine_id  VARCHAR(10)  NOT NULL,
  old_status  VARCHAR(30),
  new_status  VARCHAR(30)  NOT NULL,
  remark      TEXT,
  changed_by  VARCHAR(50),
  changed_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (machine_id) REFERENCES machines(id)
);

-- Seed ข้อมูลเครื่องจักรจาก machines.js
INSERT IGNORE INTO machines (id, display_id, category, cap, zone, x, y) VALUES
('D08','D08','desma',250,'D',760,40),
('D07','D07','desma',400,'D',860,40),
('D09','D09','desma',400,'D',960,40),
('D10','D10','desma',250,'D',1060,40),
('D11','D11','desma',250,'D',1160,40),
('C16','C16','vacuum',200,'C',40,200),
('C15','C15','vacuum',200,'C',140,200),
('C14','C14','vacuum',200,'C',240,200),
('C13','C13','vacuum',200,'C',340,200),
('C17','C17','transfer',500,'C',460,200),
('C10','C10','injection',150,'C',580,200),
('C09','C09','injection',150,'C',680,200),
('C08','C08','injection',150,'C',780,200),
('C07','C07','injection',150,'C',880,200),
('C05','C05','vacuum',500,'C',1080,200),
('C02','C02','vacuum',500,'C',1180,200),
('C01','C01','vacuum',500,'C',1280,200),
('B19','B19','compression',200,'B',40,420),
('B18','B18','compression',200,'B',140,420),
('B17','B17','compression',200,'B',240,420),
('B16','B16','compression',200,'B',340,420),
('B15','B15','compression',200,'B',440,420),
('B14','B14','compression',200,'B',540,420),
('B13','B13','vacuum',200,'B',660,420),
('B12','B12','vacuum',200,'B',760,420),
('B11','B11','vacuum',200,'B',860,420),
('B10','B10','vacuum',200,'B',960,420),
('B09','B09','vacuum',200,'B',1060,420),
('B08','B08','vacuum',200,'B',1160,420),
('B07','B07','compression',200,'B',1280,420),
('B06','B06','compression',200,'B',1380,420),
('A11','A11','compression',500,'A',40,640),
('A12','A12','compression',500,'A',140,640),
('D05','D05','compression',300,'D',260,640),
('D01','D01','vacuum',200,'D',380,640),
('D02','D02','vacuum',200,'D',480,640),
('D03','D03','vacuum',200,'D',580,640),
('D04','D04','vacuum',200,'D',680,640),
('A07','A07','compression',200,'A',800,640),
('A06','A06','compression',200,'A',900,640),
('A05','A05','compression',200,'A',1000,640),
('A04','A04','compression',200,'A',1100,640),
('A03','A03','compression',250,'A',1200,640),
('A02','A02','compression',250,'A',1300,640),
('A01','A01','compression',250,'A',1400,640);

-- Seed สถานะเริ่มต้นทุกเครื่องเป็น running
INSERT IGNORE INTO machine_status (machine_id, status)
SELECT id, 'running' FROM machines;