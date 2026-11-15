USE loyalty_db;

-- 1. Thêm Vai trò hệ thống
INSERT INTO VaiTro (tenVaiTro, moTa) VALUES 
('Admin', 'Quản trị viên toàn quyền hệ thống'),
('Staff', 'Nhân viên vận hành và chăm sóc khách hàng'),
('Customer', 'Khách hàng thành viên');

-- 2. Thêm Hạng thành viên
INSERT INTO HangThanhVien (tenHang, diemToiThieu, diemToiDa, quyenLoi) VALUES 
('Bạc', 0, 999, 'Tích điểm cơ bản 1%'),
('Vàng', 1000, 4999, 'Tích điểm x1.2, quà sinh nhật'),
('Kim Cương', 5000, 999999, 'Tích điểm x1.5, quà sinh nhật, ưu tiên hỗ trợ');

-- 3. Thêm Quy tắc tích điểm & Phân bản
INSERT INTO QuyTacTichDiem (tenQuyTac, moTa) VALUES 
('Tích điểm hóa đơn standard', 'Quy tắc tích điểm theo giá trị mua hàng');

INSERT INTO PhienBanQuyTac (soPhienBan, tyLe, dieuKien, ngayHieuLuc, trangThai, maQuyTac) VALUES 
(1, 0.01, '10,000 VND = 1 điểm', '2026-01-01', 'Đang áp dụng', 1);

-- 4. Thêm Quà tặng trong kho
INSERT INTO QuaTang (tenQua, diemDoi, soLuongTon, hanDung, trangThai) VALUES 
('Voucher 50k', 500, 100, '2026-12-31', 'Hoạt động'),
('Voucher 100k', 900, 50, '2026-12-31', 'Hoạt động'),
('Ly giữ nhiệt Loyalty', 1500, 20, '2026-12-31', 'Hoạt động');

-- 5. Thêm Khách hàng mẫu (Gắn hạng Bạc - ID: 1)
INSERT INTO KhachHang (hoTen, email, soDienThoai, diemHienTai, ngayThamGia, maHang) VALUES 
('Nguyen Van A', 'nguyenvana@gmail.com', '0901234567', 1200, '2026-01-15', 2),
('Tran Thi B', 'tranthib@gmail.com', '0912345678', 300, '2026-02-01', 1);