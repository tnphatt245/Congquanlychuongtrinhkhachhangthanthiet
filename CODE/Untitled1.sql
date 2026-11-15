USE loyalty_db;

-- 1. Tạo bảng Audit Log ghi nhận lịch sử thao tác của Admin/Staff
CREATE TABLE IF NOT EXISTS AuditLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    maNhanVien INT NOT NULL,
    hanhDong VARCHAR(255) NOT NULL,
    chiTiet TEXT,
    thoiGian DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stored Procedure Điều chỉnh điểm thủ công & tự động ghi Audit Log
DELIMITER //

DROP PROCEDURE IF EXISTS sp_DieuChinhDiemKhachHang //

CREATE PROCEDURE sp_DieuChinhDiemKhachHang(
    IN p_MaNV INT,
    IN p_MaKH INT,
    IN p_SoDiemThayDoi INT, -- Dương: cộng điểm, Âm: trừ điểm
    IN p_LyDo VARCHAR(255)
)
BEGIN
    DECLARE v_DiemCu INT DEFAULT 0;
    DECLARE v_DiemMoi INT DEFAULT 0;

    -- Kiểm tra khách hàng
    IF NOT EXISTS (SELECT 1 FROM KhachHang WHERE maKH = p_MaKH) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Khách hàng không tồn tại!';
    END IF;

    SELECT COALESCE(diemHienTai, 0) INTO v_DiemCu FROM KhachHang WHERE maKH = p_MaKH;
    SET v_DiemMoi = v_DiemCu + p_SoDiemThayDoi;

    IF v_DiemMoi < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Số điểm trừ vượt quá số điểm hiện có của khách hàng!';
    END IF;

    -- Cập nhật điểm
    UPDATE KhachHang SET diemHienTai = v_DiemMoi WHERE maKH = p_MaKH;

    -- Ghi nhận lịch sử thao tác (Audit Log)
    INSERT INTO AuditLog (maNhanVien, hanhDong, chiTiet)
    VALUES (
        p_MaNV, 
        'ĐIỀU_CHỈNH_ĐIỂM', 
        CONCAT('Thay đổi điểm KH #', p_MaKH, ': ', v_DiemCu, ' -> ', v_DiemMoi, '. Lý do: ', p_LyDo)
    );

    SELECT 
        'Điều chỉnh điểm thành công' AS status,
        v_DiemMoi AS diemHienTai;
END //

DELIMITER ;