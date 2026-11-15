DELIMITER //

CREATE PROCEDURE sp_TichDiemGiaoDich(
    IN p_maKH INT,
    IN p_soDiem INT,
    IN p_moTa VARCHAR(255)
)
BEGIN
    DECLARE v_diemMoi INT;
    DECLARE v_maHangMoi INT;

    -- 1. Ghi giao dịch điểm
    INSERT INTO GiaoDichDiem (loaiGD, soDiem, thoiGian, moTa, maKH)
    VALUES ('Tích điểm', p_soDiem, NOW(), p_moTa, p_maKH);

    -- 2. Cập nhật điểm hiện tại của khách hàng
    UPDATE KhachHang 
    SET diemHienTai = diemHienTai + p_soDiem 
    WHERE maKH = p_maKH;

    -- 3. Lấy tổng điểm mới
    SELECT diemHienTai INTO v_diemMoi FROM KhachHang WHERE maKH = p_maKH;

    -- 4. Tìm hạng thành viên phù hợp nhất theo điểm mới
    SELECT maHang INTO v_maHangMoi 
    FROM HangThanhVien 
    WHERE v_diemMoi >= diemToiThieu 
    ORDER BY diemToiThieu DESC 
    LIMIT 1;

    -- 5. Cập nhật hạng thành viên nếu có thay đổi
    IF v_maHangMoi IS NOT NULL THEN
        UPDATE KhachHang SET maHang = v_maHangMoi WHERE maKH = p_maKH;
    END IF;

    SELECT 'Thành công' AS status, v_diemMoi AS diemHienTai;
END //

DELIMITER ;