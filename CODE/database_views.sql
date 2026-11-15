USE loyalty_db;

-- View 1: Thống kê tổng quan thông tin Khách hàng và Hạng hiện tại
CREATE OR REPLACE VIEW vw_KhachHangTongQuan AS
SELECT 
    kh.maKH,
    kh.hoTen,
    kh.email,
    kh.soDienThoai,
    kh.diemHienTai,
    h.tenHang AS hangThanhVien,
    h.quyenLoi,
    kh.ngayThamGia
FROM KhachHang kh
LEFT JOIN HangThanhVien h ON kh.maHang = h.maHang;

-- View 2: Thống kê Lịch sử Đổi quà và Trạng thái EVoucher
CREATE OR REPLACE VIEW vw_ThongKeDoiQua AS
SELECT 
    dq.maDoiQua,
    kh.hoTen AS tenKhachHang,
    kh.soDienThoai,
    qt.tenQua,
    dq.diemSuDung,
    dq.ngayDoi,
    ev.maCode AS maEVoucher,
    ev.trangThai AS trangThaiVoucher,
    ev.hanSuDung
FROM DoiQua dq
JOIN KhachHang kh ON dq.maKH = kh.maKH
JOIN QuaTang qt ON dq.maQua = qt.maQua
LEFT JOIN EVoucher ev ON dq.maDoiQua = ev.maDoiQua;