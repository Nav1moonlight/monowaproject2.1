-- ==============================================================================
-- SQL INSERT DATA REAL: LOG BOOK SAMPAH MASUK & KELUAR (JUNI 2026)
-- LOKASI: Office - Mess (PT United Tractors)
-- PIC: KHAIRUL RAFI'IE
-- STATUS: VERIFIED
-- ==============================================================================

-- Bersihkan data Juni 2026 terdahulu jika ada agar idempotent
DELETE FROM `domestic_transactions` WHERE `date` >= '2026-06-01' AND `date` <= '2026-06-30';

-- ------------------------------------------------------------------------------
-- 1. DATA SAMPAH MASUK (INFLOW) - BULAN JUNI 2026
-- ------------------------------------------------------------------------------

INSERT INTO `domestic_transactions` (
    `date`, `movement_type`, `session`, `processing_method`,
    `domestic_residue_kg`, `leaf_waste_kg`, `paper_waste_kg`, `wood_scrap_kg`,
    `metal_kg`, `cardboard_kg`, `plant_waste_kg`, `plastic_bottle_kg`,
    `plastic_packaging_kg`, `food_container_kg`, `wood_cutting_kg`, `brick_kg`,
    `concrete_block_kg`, `cement_packaging_kg`, `ceiling_waste_kg`,
    `organic_weight_kg`, `inorganic_weight_kg`, `total_weight_kg`,
    `status`, `pic_name`, `notes`, `created_at`, `updated_at`
) VALUES
-- Tanggal 02 Juni 2026
('2026-06-02', 'IN', 'MORNING', NULL, 0, 0.86, 0.22, 0, 0, 13.42, 0, 0.88, 0.18, 0, 0, 0, 0, 0, 0, 0.86, 14.70, 15.56, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-02', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 03 Juni 2026
('2026-06-03', 'IN', 'MORNING', NULL, 0, 0.52, 0.20, 0, 0, 11.98, 0, 0.38, 0.12, 0, 0, 0, 0, 0, 0, 0.52, 12.68, 13.20, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-03', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 04 Juni 2026
('2026-06-04', 'IN', 'MORNING', NULL, 0, 0.64, 0.32, 2.0, 0, 3.38, 0, 0.28, 0.12, 0, 0, 0, 0, 0, 0, 0.64, 6.10, 6.74, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-04', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 05 Juni 2026
('2026-06-05', 'IN', 'MORNING', NULL, 0, 0.82, 0.34, 1.0, 0, 3.24, 0, 0.68, 0.24, 0, 0, 0, 0, 0, 0, 0.82, 5.50, 6.32, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-05', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 06 Juni 2026
('2026-06-06', 'IN', 'MORNING', NULL, 0, 0.32, 0.18, 0, 0, 6.24, 0, 0.36, 0.12, 0, 0, 0, 0, 0, 0, 0.32, 6.90, 7.22, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-06', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 09 Juni 2026
('2026-06-09', 'IN', 'MORNING', NULL, 0, 0.54, 0.20, 3.0, 0, 24.02, 0, 0.26, 0.14, 0, 0, 0, 0, 0, 0, 0.54, 27.62, 28.16, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-09', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 10 Juni 2026
('2026-06-10', 'IN', 'MORNING', NULL, 0, 0.38, 0.26, 2.0, 1.5, 4.24, 0, 0.18, 0.08, 0, 0, 0, 0, 0, 0, 0.38, 8.26, 8.64, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-10', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 11 Juni 2026
('2026-06-11', 'IN', 'MORNING', NULL, 0, 0.76, 0.24, 0, 0, 1.88, 0, 0.36, 0.12, 0, 0, 0, 0, 0, 0, 0.76, 2.60, 3.36, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-11', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 12 Juni 2026
('2026-06-12', 'IN', 'MORNING', NULL, 0, 0.72, 0.32, 1.0, 0, 1.62, 0, 0.44, 0.16, 0, 0, 0, 0, 0, 0, 0.72, 3.54, 4.26, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-12', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 15 Juni 2026
('2026-06-15', 'IN', 'MORNING', NULL, 0, 0.96, 0.32, 0, 0, 2.22, 0, 0.40, 0.22, 0, 0, 0, 0, 0, 0, 0.96, 3.16, 4.12, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-15', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 16 Juni 2026
('2026-06-16', 'IN', 'MORNING', NULL, 0, 0.52, 0.26, 1.0, 0, 16.58, 0, 0.56, 0.12, 0, 0, 0, 0, 0, 0, 0.52, 18.52, 19.04, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-16', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 18 Juni 2026
('2026-06-18', 'IN', 'MORNING', NULL, 0, 1.26, 0.32, 2.0, 0, 15.56, 0, 0.32, 0.24, 0, 0, 0, 0, 0, 0, 1.26, 18.44, 19.70, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-18', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 19 Juni 2026
('2026-06-19', 'IN', 'MORNING', NULL, 0, 0.46, 0.32, 4.0, 0, 3.50, 0, 0.36, 0.12, 0, 0, 0, 0, 0, 0, 0.46, 8.30, 8.76, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-19', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 22 Juni 2026
('2026-06-22', 'IN', 'MORNING', NULL, 0, 0.64, 0.24, 1.0, 0, 2.90, 0, 0.46, 0.12, 0, 0, 0, 0, 0, 0, 0.64, 4.72, 5.36, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-22', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 23 Juni 2026
('2026-06-23', 'IN', 'MORNING', NULL, 0, 0.92, 0.46, 0, 0, 3.08, 0, 0.26, 0.08, 0, 0, 0, 0, 0, 0, 0.92, 3.88, 4.80, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-23', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 24 Juni 2026
('2026-06-24', 'IN', 'MORNING', NULL, 0, 0.64, 0.28, 3.0, 0, 17.42, 0, 0.38, 0.18, 0, 0, 0, 0, 0, 0, 0.64, 21.26, 21.90, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-24', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 25 Juni 2026
('2026-06-25', 'IN', 'MORNING', NULL, 0, 0.78, 0.22, 1.0, 0, 3.58, 0, 0.52, 0.12, 0, 0, 0, 0, 0, 0, 0.78, 5.44, 6.22, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-25', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 26 Juni 2026
('2026-06-26', 'IN', 'MORNING', NULL, 0, 1.04, 0.42, 3.0, 0, 4.12, 0, 0.78, 0.24, 0, 0, 0, 0, 0, 0, 1.04, 8.56, 9.60, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-26', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 29 Juni 2026
('2026-06-29', 'IN', 'MORNING', NULL, 0, 0.96, 0.34, 0, 0, 2.96, 0, 0.64, 0.24, 0, 0, 0, 0, 0, 0, 0.96, 4.18, 5.14, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-29', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW()),

-- Tanggal 30 Juni 2026
('2026-06-30', 'IN', 'MORNING', NULL, 0, 0.92, 0.28, 3.0, 0, 20.18, 0, 0.42, 0.18, 0, 0, 0, 0, 0, 0, 0.92, 24.06, 24.98, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Pagi)', NOW(), NOW()),
('2026-06-30', 'IN', 'AFTERNOON', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Office - Mess (Siang)', NOW(), NOW());


-- ------------------------------------------------------------------------------
-- 2. DATA SAMPAH KELUAR (OUTFLOW) - BULAN JUNI 2026
-- ------------------------------------------------------------------------------

INSERT INTO `domestic_transactions` (
    `date`, `movement_type`, `session`, `processing_method`,
    `domestic_residue_kg`, `leaf_waste_kg`, `paper_waste_kg`, `wood_scrap_kg`,
    `metal_kg`, `cardboard_kg`, `plant_waste_kg`, `plastic_bottle_kg`,
    `plastic_packaging_kg`, `food_container_kg`, `wood_cutting_kg`, `brick_kg`,
    `concrete_block_kg`, `cement_packaging_kg`, `ceiling_waste_kg`,
    `organic_weight_kg`, `inorganic_weight_kg`, `total_weight_kg`,
    `status`, `pic_name`, `notes`, `created_at`, `updated_at`
) VALUES
-- 02/06/2026 (Diolah)
('2026-06-02', 'OUT', 'MORNING', 'PROCESSED', 0, 0.86, 0, 0, 0, 13.42, 0, 0.88, 0, 0, 0, 0, 0, 0, 0, 0.86, 14.30, 15.16, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 03/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-03', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0.22, 0, 0, 0, 0, 0, 0, 0.18, 0, 0, 0, 0, 0, 0, 0.22, 0.18, 0.40, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-03', 'OUT', 'MORNING', 'PROCESSED', 0, 0.52, 0, 0, 0, 11.98, 0, 0.38, 0, 0, 0, 0, 0, 0, 0, 0.52, 12.36, 12.88, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 04/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-04', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.20, 0, 0, 0, 0, 0, 0.12, 0, 0, 0, 0, 0, 0, 0, 0.32, 0.32, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-04', 'OUT', 'MORNING', 'PROCESSED', 0, 0.64, 0, 2.0, 0, 3.38, 0, 0.28, 0, 0, 0, 0, 0, 0, 0, 0.64, 5.66, 6.30, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 05/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-05', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.32, 0, 0, 0, 0, 0, 0.12, 0, 0, 0, 0, 0, 0, 0, 0.44, 0.44, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-05', 'OUT', 'MORNING', 'PROCESSED', 0, 0.82, 0, 0, 0, 3.24, 0, 0.68, 0, 0, 0, 0, 0, 0, 0, 0.82, 3.92, 4.74, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 06/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-06', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.34, 0, 0, 0, 0, 0, 0.24, 0, 0, 0, 0, 0, 0, 0, 0.58, 0.58, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-06', 'OUT', 'MORNING', 'PROCESSED', 0, 0.32, 0, 0, 0, 6.24, 0, 0.36, 0, 0, 0, 0, 0, 0, 0, 0.32, 6.60, 6.92, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 09/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-09', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.18, 0, 0, 0, 0, 0, 0.12, 0, 0, 0, 0, 0, 0, 0, 0.30, 0.30, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-09', 'OUT', 'MORNING', 'PROCESSED', 0, 0.54, 0, 3.0, 0, 24.02, 0, 0.26, 0, 0, 0, 0, 0, 0, 0, 0.54, 27.28, 27.82, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 10/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-10', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.20, 0, 0, 0, 0, 0, 0.14, 0, 0, 0, 0, 0, 0, 0, 0.34, 0.34, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-10', 'OUT', 'MORNING', 'PROCESSED', 0, 0.38, 0, 2.0, 1.5, 4.24, 0, 0.18, 0, 0, 0, 0, 0, 0, 0, 0.38, 7.92, 8.30, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 11/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-11', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.26, 0, 0, 0, 0, 0, 0.08, 0, 0, 0, 0, 0, 0, 0, 0.34, 0.34, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-11', 'OUT', 'MORNING', 'PROCESSED', 0, 0.76, 0, 0, 0, 1.88, 0, 0.36, 0, 0, 0, 0, 0, 0, 0, 0.76, 2.24, 3.00, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 12/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-12', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.24, 0, 0, 0, 0, 0, 0.12, 0, 0, 0, 0, 0, 0, 0, 0.36, 0.36, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-12', 'OUT', 'MORNING', 'PROCESSED', 0, 0.72, 0, 1.0, 0, 1.62, 0, 0.44, 0, 0, 0, 0, 0, 0, 0, 0.72, 3.06, 3.78, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 15/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-15', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.32, 0, 0, 0, 0, 0, 0.16, 0, 0, 0, 0, 0, 0, 0, 0.48, 0.48, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-15', 'OUT', 'MORNING', 'PROCESSED', 0, 0.96, 0, 0, 0, 2.22, 0, 0.40, 0, 0, 0, 0, 0, 0, 0, 0.96, 2.62, 3.58, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 16/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-16', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.32, 0, 0, 0, 0, 0, 0.22, 0, 0, 0, 0, 0, 0, 0, 0.54, 0.54, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-16', 'OUT', 'MORNING', 'PROCESSED', 0, 0.52, 0, 1.0, 0, 16.58, 0, 0.56, 0, 0, 0, 0, 0, 0, 0, 0.52, 18.14, 18.66, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 17/06/2026 (Dibuang ke TPA)
('2026-06-17', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.26, 0, 0, 0, 0, 0, 0.12, 0, 0, 0, 0, 0, 0, 0, 0.38, 0.38, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),

-- 18/06/2026 (Diolah)
('2026-06-18', 'OUT', 'MORNING', 'PROCESSED', 0, 1.26, 0, 2.0, 0, 15.56, 0, 0.32, 0, 0, 0, 0, 0, 0, 0, 1.26, 17.88, 19.14, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 19/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-19', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.22, 0, 0, 0, 0, 0, 0.14, 0, 0, 0, 0, 0, 0, 0, 0.36, 0.36, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-19', 'OUT', 'MORNING', 'PROCESSED', 0, 0.46, 0, 4.0, 0, 3.50, 0, 0.36, 0, 0, 0, 0, 0, 0, 0, 0.46, 7.86, 8.32, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 22/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-22', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.32, 0, 0, 0, 0, 0, 0.12, 0, 0, 0, 0, 0, 0, 0, 0.44, 0.44, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-22', 'OUT', 'MORNING', 'PROCESSED', 0, 0.64, 0, 1.0, 0, 2.90, 0, 0.46, 0, 0, 0, 0, 0, 0, 0, 0.64, 4.36, 5.00, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 23/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-23', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.24, 0, 0, 0, 0, 0, 0.12, 0, 0, 0, 0, 0, 0, 0, 0.36, 0.36, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-23', 'OUT', 'MORNING', 'PROCESSED', 0, 0.92, 0, 0, 0, 3.08, 0, 0.26, 0, 0, 0, 0, 0, 0, 0, 0.92, 3.34, 4.26, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 24/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-24', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.46, 0, 0, 0, 0, 0, 0.08, 0, 0, 0, 0, 0, 0, 0, 0.54, 0.54, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-24', 'OUT', 'MORNING', 'PROCESSED', 0, 0.64, 0, 3.0, 0, 17.42, 0, 0.38, 0, 0, 0, 0, 0, 0, 0, 0.64, 20.80, 21.44, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 25/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-25', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.28, 0, 0, 0, 0, 0, 0.18, 0, 0, 0, 0, 0, 0, 0, 0.46, 0.46, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-25', 'OUT', 'MORNING', 'PROCESSED', 0, 0.78, 0, 1.0, 0, 3.58, 0, 0.52, 0, 0, 0, 0, 0, 0, 0, 0.78, 5.10, 5.88, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 26/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-26', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.22, 0, 0, 0, 0, 0, 0.12, 0, 0, 0, 0, 0, 0, 0, 0.34, 0.34, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-26', 'OUT', 'MORNING', 'PROCESSED', 0, 1.04, 0, 3.0, 0, 4.12, 0, 0.78, 0, 0, 0, 0, 0, 0, 0, 1.04, 7.90, 8.94, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 29/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-29', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.42, 0, 0, 0, 0, 0, 0.24, 0, 0, 0, 0, 0, 0, 0, 0.66, 0.66, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-29', 'OUT', 'MORNING', 'PROCESSED', 0, 0.96, 0, 0, 0, 2.96, 0, 0.64, 0, 0, 0, 0, 0, 0, 0, 0.96, 3.60, 4.56, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW()),

-- 30/06/2026 (Dibuang ke TPA & Diolah)
('2026-06-30', 'OUT', 'AFTERNOON', 'LANDFILL', 0, 0, 0.34, 0, 0, 0, 0, 0, 0.24, 0, 0, 0, 0, 0, 0, 0, 0.58, 0.58, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Dibuang ke TPA', NOW(), NOW()),
('2026-06-30', 'OUT', 'MORNING', 'PROCESSED', 0, 0.92, 0, 3.0, 0, 20.18, 0, 0.42, 0, 0, 0, 0, 0, 0, 0, 0.92, 23.60, 24.52, 'VERIFIED', 'KHAIRUL RAFI\'IE', 'Diolah Kompos & Daur Ulang', NOW(), NOW());
