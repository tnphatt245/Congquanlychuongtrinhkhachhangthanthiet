USE loyalty_db;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_DoiQuaTang //

CREATE PROCEDURE sp_DoiQuaTang(
    IN p_MaKH INT,
    IN p_MaQua INT
)
BEGIN
    DECLARE v_DiemHienTai INT DEFAULT 0;
    DECLARE v_DiemSuDung INT DEFAULT 0;

    -- 1. Kiểm tra sự tồn tại của Khách hàng
    IF NOT EXISTS (SELECT 1 FROM KhachHang WHERE maKH = p_MaKH) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Khách hàng không tồn tại trong hệ thống!';
    END IF;

    -- 2. Lấy số điểm quy đổi từ cột diemSuDung trong bảng DoiQua
    SELECT diemSuDung INTO v_DiemSuDung
    FROM DoiQua
    WHERE maQua = p_MaQua
    LIMIT 1;

    -- Nếu chưa có bản ghi mẫu, gán mặc định số điểm đổi quà (ví dụ: 500 điểm)
    IF v_DiemSuDung IS NULL OR v_DiemSuDung = 0 THEN
        SET v_DiemSuDung = 500;
    END IF;

    -- 3. Lấy điểm hiện tại của Khách hàng
    SELECT COALESCE(diemHienTai, 0) INTO v_DiemHienTai 
    FROM KhachHang 
    WHERE maKH = p_MaKH;

    -- 4. Kiểm tra điều kiện đủ điểm
    IF v_DiemHienTai < v_DiemSuDung THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Khách hàng không đủ điểm để đổi quà!';
    END IF;

    -- 5. Trừ điểm của Khách hàng
    UPDATE KhachHang 
    SET diemHienTai = v_DiemHienTai - v_DiemSuDung
    WHERE maKH = p_MaKH;

    -- 6. Ghi nhận giao dịch đổi quà mới vào bảng DoiQua
    INSERT INTO DoiQua (ngayDoi, diemSuDung, trangThai, maKH, maQua)
    VALUES (CURDATE(), v_DiemSuDung, 'Thành công', p_MaKH, p_MaQua);

    -- 7. Trả về kết quả cho Backend
    SELECT 
        'Đổi quà thành công' AS status,
        (v_DiemHienTai - v_DiemSuDung) AS diemConLai,
        CONCAT('EVOUCHER-', UPPER(SUBSTRING(MD5(RAND()), 1, 8))) AS maEVoucher;
END //

DELIMITER ;