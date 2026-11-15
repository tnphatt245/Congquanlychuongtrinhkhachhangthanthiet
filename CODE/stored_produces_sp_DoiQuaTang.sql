DELIMITER //

CREATE PROCEDURE sp_DoiQuaTang(
    IN p_maKH INT,
    IN p_maQua INT
)
BEGIN
    DECLARE v_diemDoi INT;
    DECLARE v_soLuongTon INT;
    DECLARE v_diemHienTai INT;
    DECLARE v_maDoiQua INT;
    DECLARE v_maCode VARCHAR(20);

    -- 1. Lấy thông tin quà
    SELECT diemDoi, soLuongTon INTO v_diemDoi, v_soLuongTon FROM QuaTang WHERE maQua = p_maQua;
    -- 2. Lấy điểm hiện tại của khách
    SELECT diemHienTai INTO v_diemHienTai FROM KhachHang WHERE maKH = p_maKH;

    -- Kiểm tra điều kiện đổi
    IF v_soLuongTon <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quà tặng đã hết hàng trong kho!';
    ELSEIF v_diemHienTai < v_diemDoi THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Khách hàng không đủ điểm để đổi quà!';
    ELSE
        -- Trừ điểm khách hàng
        UPDATE KhachHang SET diemHienTai = diemHienTai - v_diemDoi WHERE maKH = p_maKH;
        
        -- Giảm số lượng quà trong kho
        UPDATE QuaTang SET soLuongTon = soLuongTon - 1 WHERE maQua = p_maQua;

        -- Ghi giao dịch trừ điểm
        INSERT INTO GiaoDichDiem (loaiGD, soDiem, thoiGian, moTa, maKH)
        VALUES ('Trừ điểm đổi quà', -v_diemDoi, NOW(), CONCAT('Đổi quà ID: ', p_maQua), p_maKH);

        -- Tạo lượt Đổi Quà
        INSERT INTO DoiQua (ngayDoi, diemSuDung, trangThai, maKH, maQua)
        VALUES (CURDATE(), v_diemDoi, 'Thành công', p_maKH, p_maQua);
        
        SET v_maDoiQua = LAST_INSERT_ID();

        -- Sinh mã EVoucher ngẫu nhiên (Ví dụ: EV-XXXXX)
        SET v_maCode = CONCAT('EV-', LPAD(FLOOR(RAND() * 100000), 5, '0'));

        -- Cấp EVoucher
        INSERT INTO EVoucher (maCode, ngayPhatHanh, hanSuDung, trangThai, maDoiQua)
        VALUES (v_maCode, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Chưa sử dụng', v_maDoiQua);

        SELECT 'Thành công' AS status, v_maCode AS maEVoucher;
    END IF;
END //

DELIMITER ;