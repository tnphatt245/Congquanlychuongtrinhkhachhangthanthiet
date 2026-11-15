USE loyalty_db;

-- 1. Trigger kiểm tra điều kiện trước khi đổi quà (HD06)
DROP TRIGGER IF EXISTS trg_BeforeDoiQua_Validate;
DELIMITER //
CREATE TRIGGER trg_BeforeDoiQua_Validate
BEFORE INSERT ON DoiQua
FOR EACH ROW
BEGIN
    DECLARE v_diemHienTai INT DEFAULT 0;
    DECLARE v_soLuongTon INT DEFAULT 0;
    DECLARE v_diemDoi INT DEFAULT 0;
    DECLARE v_trangThaiQua VARCHAR(50);

    SELECT diemHienTai INTO v_diemHienTai FROM KhachHang WHERE maKH = NEW.maKH;
    SELECT soLuongTon, diemDoi, trangThai INTO v_soLuongTon, v_diemDoi, v_trangThaiQua FROM QuaTang WHERE maQua = NEW.maQua;

    IF v_trangThaiQua <> 'HOAT_DONG' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi CSDL: Món quà này đang ngưng áp dụng!';
    END IF;

    IF v_soLuongTon <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi CSDL: Món quà này đã hết số lượng tồn kho!';
    END IF;

    IF v_diemHienTai < v_diemDoi THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi CSDL: Khách hàng không đủ số điểm để đổi quà!';
    END IF;
END //
DELIMITER ;

-- 2. Trigger tự động trừ điểm và giảm tồn kho (HD06)
DROP TRIGGER IF EXISTS trg_AfterDoiQua_UpdatePointAndStock;
DELIMITER //
CREATE TRIGGER trg_AfterDoiQua_UpdatePointAndStock
AFTER INSERT ON DoiQua
FOR EACH ROW
BEGIN
    DECLARE v_diemDoi INT DEFAULT 0;
    SELECT diemDoi INTO v_diemDoi FROM QuaTang WHERE maQua = NEW.maQua;

    UPDATE KhachHang SET diemHienTai = diemHienTai - v_diemDoi WHERE maKH = NEW.maKH;
    UPDATE QuaTang SET soLuongTon = soLuongTon - 1 WHERE maQua = NEW.maQua;
END //
DELIMITER ;

-- 3. Trigger tự động ghi nhật ký Audit Log (HD02)
DROP TRIGGER IF EXISTS trg_AfterKhachHang_AuditLog;
DELIMITER //
CREATE TRIGGER trg_AfterKhachHang_AuditLog
AFTER UPDATE ON KhachHang
FOR EACH ROW
BEGIN
    IF OLD.diemHienTai <> NEW.diemHienTai THEN
        INSERT INTO AuditLog (
            maKH, hanhDong, duLieuCu, duLieuMoi, thoiGian
        ) VALUES (
            NEW.maKH, 'BIEN_DONG_DIEM', CONCAT('Điểm cũ: ', OLD.diemHienTai), CONCAT('Điểm mới: ', NEW.diemHienTai), NOW()
        );
    END IF;
END //
DELIMITER ;