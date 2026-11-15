import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TichDiemDto } from './dto/tich-diem.dto';
import { DoiQuaDto } from './dto/doi-qua.dto';
import { DieuChinhDiemDto } from './dto/dieu-chinh-diem.dto';
import { CreateQuaTangDto } from './dto/create-qua-tang.dto';
import { UpdateQuaTangDto } from './dto/update-qua-tang.dto';
import { CreateKhieuNaiDto } from './dto/create-khieu-nai.dto';
import { XuLyKhieuNaiDto } from './dto/xu-ly-khieu-nai.dto';
import { Role } from '../common/enums/role.enum';
import { CreateQuyTacDto } from './dto/create-quy-tac.dto';
import { CreatePhienBanQuyTacDto } from './dto/create-phien-ban-quy-tac.dto';
import { CreateHangThanhVienDto } from './dto/create-hang-thanh-vien.dto';

@Injectable()
export class LoyaltyService {
  constructor(private readonly dataSource: DataSource) {}

  // 1. Lấy danh sách tổng quan khách hàng (Admin/Staff)
  async getKhachHangTongQuan() {
    return this.dataSource.query('SELECT * FROM KhachHang');
  }

  // 2. Lấy thống kê lịch sử đổi quà tổng quan (Admin/Staff)
  async getThongKeDoiQua() {
    return this.dataSource.query('SELECT * FROM DoiQua ORDER BY ngayDoi DESC');
  }

  // 3. Tích điểm khách hàng
  async tichDiem(maKH: number, dto: TichDiemDto) {
    if (!maKH) {
      throw new BadRequestException('Không tìm thấy mã khách hàng từ JWT Token!');
    }
    try {
      const result = await this.dataSource.query(
        'CALL sp_TichDiemVatThangHang(?, ?, ?)',
        [maKH, dto.soDiem, dto.moTa || 'Tích điểm'],
      );
      return result[0][0];
    } catch (error: any) {
      throw new BadRequestException(
        error?.sqlMessage || error?.message || 'Lỗi xử lý tích điểm',
      );
    }
  }

  // 4. Đổi quà bằng điểm -> Trừ điểm via Stored Procedure -> Tạo lượt Đổi Quà -> Phát hành E-Voucher
  async doiQua(maKH: number, dto: DoiQuaDto) {
    if (!maKH) {
      throw new BadRequestException('Không tìm thấy mã khách hàng từ JWT Token!');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Kiểm tra quà tặng
      const quaList = await queryRunner.query(
        'SELECT * FROM QuaTang WHERE maQua = ? AND trangThai != "KHONG_HOAT_DONG"',
        [dto.maQua],
      );
      if (quaList.length === 0) {
        throw new BadRequestException('Món quà không tồn tại hoặc đã ngưng áp dụng!');
      }

      const qua = quaList[0];

      if (qua.soLuongTon <= 0) {
        throw new BadRequestException('Món quà này đã hết số lượng tồn kho!');
      }

      // 2. Gọi Stored Procedure trừ điểm khách hàng (Số điểm âm)
      const lyDoDoiQua = `Đổi quà: ${qua.tenQua}`;
      await queryRunner.query(
        'CALL sp_DieuChinhDiemKhachHang(?, ?, ?, ?)',
        [1, maKH, -qua.diemDoi, lyDoDoiQua],
      );

      // 3. Trừ số lượng tồn quà tặng
      await queryRunner.query(
        'UPDATE QuaTang SET soLuongTon = soLuongTon - 1 WHERE maQua = ?',
        [dto.maQua],
      );

      // 4. Lưu lượt đổi quà
      const resDoiQua = await queryRunner.query(
        `INSERT INTO DoiQua (ngayDoi, diemSuDung, trangThai, maKH, maQua)
         VALUES (CURDATE(), ?, 'THANH_CONG', ?, ?)`,
        [qua.diemDoi, maKH, dto.maQua],
      );

      const maDoiQua = resDoiQua.insertId;

      // 5. Sinh mã Voucher
      const maCode = 'EV' + Date.now() + Math.floor(Math.random() * 1000);

      // 6. Phát hành E-Voucher
      await queryRunner.query(
        `INSERT INTO EVoucher (maCode, ngayPhatHanh, hanSuDung, trangThai, maDoiQua)
         VALUES (?, CURDATE(), ?, 'CHUA_SU_DUNG', ?)`,
        [maCode, qua.hanDung, maDoiQua],
      );

      // 7. Ghi AuditLog đúng tên cột: maNhanVien, hanhDong, chiTiet
      await queryRunner.query(
        `INSERT INTO AuditLog (maNhanVien, hanhDong, chiTiet)
         VALUES (?, 'DOI_QUA_EVOUCHER', ?)`,
        [1, `Khách hàng #${maKH} đổi quà #${dto.maQua} thành công. Mã Voucher: ${maCode}`],
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Đổi quà thành công!',
        maDoiQua,
        maCode,
        hanSuDung: qua.hanDung,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error?.sqlMessage || error?.message || 'Không thể thực hiện đổi quà',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // =========================================================================
  // BỔ SUNG LUỒNG PHÊ DUYỆT ĐIỂM 2 BƯỚC (HD15 & HD16) - BẢNG YeuCauDieuChinhDiem
  // =========================================================================

  // HD15: Tạo phiếu yêu cầu điều chỉnh điểm
  async taoYeuCauDieuChinhDiem(maNV_Tao: number, dto: any) {
    const maKH = dto.maKH;
    const soDiem = dto.soDiem ?? dto.soDiemThayDoi ?? dto.soDiemDieuChinh;
    const lyDo = dto.lyDo;

    if (!maKH || !soDiem || !lyDo) {
      throw new BadRequestException('Vui lòng nhập đầy đủ maKH, soDiem và lyDo!');
    }

    // Kiểm tra Khách hàng có tồn tại không
    const khList = await this.dataSource.query(
      'SELECT * FROM KhachHang WHERE maKH = ?',
      [maKH],
    );
    if (khList.length === 0) {
      throw new BadRequestException(`Khách hàng #${maKH} không tồn tại!`);
    }

    try {
      const result = await this.dataSource.query(
        `INSERT INTO YeuCauDieuChinhDiem (soDiem, lyDo, ngayTao, trangThai, maKH, maNV_Tao)
         VALUES (?, ?, CURDATE(), 'CHO_DUYET', ?, ?)`,
        [soDiem, lyDo, maKH, maNV_Tao || 1],
      );

      return {
        message: 'Tạo phiếu yêu cầu điều chỉnh điểm thành công!',
        maYC: result.insertId,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.sqlMessage || error?.message || 'Không thể tạo yêu cầu điều chỉnh điểm',
      );
    }
  }

  // HD16: Lấy danh sách phiếu chờ duyệt
  async getDanhSachYeuCauDieuChinh() {
    try {
      return await this.dataSource.query(
        'SELECT * FROM YeuCauDieuChinhDiem ORDER BY maYC DESC',
      );
    } catch (error: any) {
      throw new BadRequestException(
        error?.sqlMessage || error?.message || 'Lỗi truy vấn danh sách yêu cầu',
      );
    }
  }

  // HD16: Admin Phê duyệt hoặc Từ chối yêu cầu
  async pheDuyetYeuCauDieuChinh(
    maYC: number,
    dto: { trangThai: 'DA_DUYET' | 'TU_CHOI'; lyDoTuChoi?: string },
    maNV_Duyet: number,
  ) {
    const ycList = await this.dataSource.query(
      'SELECT * FROM YeuCauDieuChinhDiem WHERE maYC = ?',
      [maYC],
    );

    if (ycList.length === 0) {
      throw new BadRequestException(`Yêu cầu #${maYC} không tồn tại!`);
    }

    const yeuCau = ycList[0];

    if (yeuCau.trangThai !== 'CHO_DUYET') {
      throw new BadRequestException('Yêu cầu này đã được xử lý trước đó!');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Nếu ĐỒNG Ý -> Gọi Stored Procedure điều chỉnh điểm khách hàng
      if (dto.trangThai === 'DA_DUYET') {
        const lyDoDieuChinh = `Duyệt yêu cầu #${maYC}: ${yeuCau.lyDo}`;
        await queryRunner.query(
          'CALL sp_DieuChinhDiemKhachHang(?, ?, ?, ?)',
          [maNV_Duyet || 1, yeuCau.maKH, yeuCau.soDiem, lyDoDieuChinh],
        );
      }

      // Cập nhật trạng thái phiếu trong bảng YeuCauDieuChinhDiem
      await queryRunner.query(
        `UPDATE YeuCauDieuChinhDiem
         SET trangThai = ?, maNV_Duyet = ?, lyDoTuChoi = ?
         WHERE maYC = ?`,
        [dto.trangThai, maNV_Duyet || 1, dto.lyDoTuChoi || null, maYC],
      );

      await queryRunner.commitTransaction();

      return {
        message: `Đã ${dto.trangThai === 'DA_DUYET' ? 'phê duyệt' : 'từ chối'} yêu cầu #${maYC} thành công!`,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error?.sqlMessage || error?.message || 'Lỗi khi xử lý phê duyệt yêu cầu',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // 5. Điều chỉnh điểm thủ công trực tiếp (Legacy)
  async dieuChinhDiem(maNV: number, dto: DieuChinhDiemDto) {
    if (!maNV) {
      throw new BadRequestException('Không xác định được mã nhân viên thực hiện thao tác!');
    }
    try {
      const result = await this.dataSource.query(
        'CALL sp_DieuChinhDiemKhachHang(?, ?, ?, ?)',
        [maNV, dto.maKH, dto.soDiemThayDoi, dto.lyDo],
      );
      return result[0][0];
    } catch (error: any) {
      throw new BadRequestException(
        error?.sqlMessage || error?.message || 'Lỗi xử lý điều chỉnh điểm',
      );
    }
  }

  // 6. Tra cứu lịch sử thao tác Audit Log (Admin)
  async getAuditLogs() {
    try {
      return await this.dataSource.query('SELECT * FROM AuditLog ORDER BY thoiGian DESC');
    } catch (error: any) {
      throw new BadRequestException(
        error?.sqlMessage || error?.message || 'Lỗi truy vấn lịch sử Audit Log',
      );
    }
  }

  // 7. Lấy danh sách quà tặng
  async getDanhSachQuaTang() {
    return this.dataSource.query('SELECT * FROM QuaTang');
  }

  // 8. Thêm quà tặng mới
  async createQuaTang(dto: CreateQuaTangDto) {
    try {
      const result = await this.dataSource.query(
        `INSERT INTO QuaTang (tenQua, diemDoi, soLuongTon, hanDung, trangThai)
         VALUES (?, ?, ?, ?, ?)`,
        [
          dto.tenQua,
          dto.diemDoi,
          dto.soLuongTon,
          dto.hanDung || null,
          dto.trangThai || 'HOAT_DONG',
        ],
      );
      return {
        message: 'Thêm quà tặng mới thành công!',
        maQua: result.insertId,
      };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể thêm quà tặng');
    }
  }

  // 9. Cập nhật thông tin quà tặng
  async updateQuaTang(id: number, dto: UpdateQuaTangDto) {
    try {
      const quaExist = await this.dataSource.query(
        'SELECT * FROM QuaTang WHERE maQua = ?',
        [id],
      );

      if (quaExist.length === 0) {
        throw new BadRequestException('Món quà không tồn tại!');
      }

      const current = quaExist[0];
      const tenQua = dto.tenQua ?? current.tenQua;
      const diemDoi = dto.diemDoi ?? current.diemDoi;
      const soLuongTon = dto.soLuongTon ?? current.soLuongTon;
      const hanDung = dto.hanDung ?? current.hanDung;
      const trangThai = dto.trangThai ?? current.trangThai;

      await this.dataSource.query(
        `UPDATE QuaTang
         SET tenQua = ?, diemDoi = ?, soLuongTon = ?, hanDung = ?, trangThai = ?
         WHERE maQua = ?`,
        [tenQua, diemDoi, soLuongTon, hanDung, trangThai, id],
      );

      return { message: 'Cập nhật quà tặng thành công!' };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể cập nhật quà tặng');
    }
  }

  // 10. Ngừng áp dụng quà tặng
  async deleteQuaTang(id: number) {
    try {
      const quaExist = await this.dataSource.query(
        'SELECT * FROM QuaTang WHERE maQua = ?',
        [id],
      );

      if (quaExist.length === 0) {
        throw new BadRequestException('Món quà không tồn tại!');
      }

      await this.dataSource.query(
        'UPDATE QuaTang SET trangThai = "KHONG_HOAT_DONG" WHERE maQua = ?',
        [id],
      );

      return { message: 'Đã ngừng áp dụng quà tặng thành công!' };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể xóa quà tặng');
    }
  }

  // 11. Khách hàng gửi khiếu nại
  async createKhieuNai(maKH: number, dto: CreateKhieuNaiDto) {
    try {
      const result = await this.dataSource.query(
        `INSERT INTO KhieuNai (tieuDe, noiDung, ngayGui, mucUuTien, trangThai, maKH, maGD)
         VALUES (?, ?, CURDATE(), ?, 'CHO_XU_LY', ?, ?)`,
        [
          dto.tieuDe,
          dto.noiDung,
          dto.mucUuTien || 'TRUNG_BINH',
          maKH,
          dto.maGD || null,
        ],
      );
      return {
        message: 'Gửi khiếu nại thành công! Bộ phận hỗ trợ sẽ xử lý sớm nhất.',
        maKN: result.insertId,
      };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể gửi khiếu nại');
    }
  }

  // 12. Lấy danh sách khiếu nại
  async getDanhSachKhieuNai(maKH?: number, role?: string) {
    if (role === Role.CUSTOMER && maKH) {
      return this.dataSource.query(
        'SELECT * FROM KhieuNai WHERE maKH = ? ORDER BY maKN DESC',
        [maKH],
      );
    }
    return this.dataSource.query('SELECT * FROM KhieuNai ORDER BY maKN DESC');
  }

  // 13. Phê duyệt / Từ chối khiếu nại (Admin/Staff)
  async xuLyKhieuNai(id: number, dto: XuLyKhieuNaiDto, adminId: number) {
    try {
      const knExist = await this.dataSource.query(
        'SELECT * FROM KhieuNai WHERE maKN = ?',
        [id],
      );

      if (knExist.length === 0) {
        throw new BadRequestException('Khiếu nại không tồn tại!');
      }

      const khieuNai = knExist[0];

      if (khieuNai.trangThai !== 'CHO_XU_LY') {
        throw new BadRequestException('Khiếu nại này đã được xử lý trước đó!');
      }

      const lyDoDieuChinh = dto.lyDo || `Đền bù khiếu nại #${id}: ${khieuNai.tieuDe}`;

      // 1. Gọi Stored Procedure cộng điểm nếu phê duyệt và có nhập số điểm đền bù
      if (dto.trangThai === 'DA_DUYET' && dto.soDiemCong && dto.soDiemCong > 0) {
        await this.dataSource.query(
          'CALL sp_DieuChinhDiemKhachHang(?, ?, ?, ?)',
          [adminId, khieuNai.maKH, dto.soDiemCong, lyDoDieuChinh],
        );
      }

      // 2. Ghi AuditLog đúng tên cột trong CSDL: (maNhanVien, hanhDong, chiTiet)
      await this.dataSource.query(
        `INSERT INTO AuditLog (maNhanVien, hanhDong, chiTiet)
         VALUES (?, ?, ?)`,
        [
          adminId,
          `XU_LY_KHIEU_NAI_${dto.trangThai}`,
          `Xử lý khiếu nại #${id} cho KH #${khieuNai.maKH}. Lý do: ${lyDoDieuChinh}`,
        ],
      );

      // 3. Cập nhật trạng thái khiếu nại
      await this.dataSource.query(
        'UPDATE KhieuNai SET trangThai = ? WHERE maKN = ?',
        [dto.trangThai, id],
      );

      return { message: `Đã xử lý thành công khiếu nại #${id}` };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể xử lý khiếu nại');
    }
  }

  // 14. Tạo quy tắc tích điểm
  async createQuyTac(dto: CreateQuyTacDto) {
    try {
      const result = await this.dataSource.query(
        'INSERT INTO QuyTacTichDiem (tenQuyTac, moTa) VALUES (?, ?)',
        [dto.tenQuyTac, dto.moTa || null],
      );
      return {
        message: 'Tạo quy tắc tích điểm thành công!',
        maQuyTac: result.insertId,
      };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể tạo quy tắc tích điểm');
    }
  }

  // 15. Lấy danh sách quy tắc kèm phiên bản
  async getDanhSachQuyTac() {
    return this.dataSource.query(`
      SELECT 
        q.maQuyTac, q.tenQuyTac, q.moTa,
        p.maPhienBan, p.soPhienBan, p.tyLe, p.dieuKien, p.ngayHieuLuc, p.trangThai
      FROM QuyTacTichDiem q
      LEFT JOIN PhienBanQuyTac p ON q.maQuyTac = p.maQuyTac
      ORDER BY q.maQuyTac DESC, p.soPhienBan DESC
    `);
  }

  // 16. Tạo phiên bản cho quy tắc tích điểm
  async createPhienBanQuyTac(dto: CreatePhienBanQuyTacDto) {
    try {
      const qtExist = await this.dataSource.query(
        'SELECT * FROM QuyTacTichDiem WHERE maQuyTac = ?',
        [dto.maQuyTac],
      );

      if (qtExist.length === 0) {
        throw new BadRequestException('Quy tắc tích điểm không tồn tại!');
      }

      const result = await this.dataSource.query(
        `INSERT INTO PhienBanQuyTac (soPhienBan, tyLe, dieuKien, ngayHieuLuc, trangThai, maQuyTac)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          dto.soPhienBan,
          dto.tyLe,
          dto.dieuKien || null,
          dto.ngayHieuLuc,
          dto.trangThai || 'HOAT_DONG',
          dto.maQuyTac,
        ],
      );

      return {
        message: 'Tạo phiên bản quy tắc thành công!',
        maPhienBan: result.insertId,
      };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể tạo phiên bản quy tắc');
    }
  }

  // 17. Xem lịch sử đổi quà kèm E-Voucher
  async getLichSuDoiQua(maKH?: number, role?: string) {
    if (role === Role.CUSTOMER && maKH) {
      return this.dataSource.query(
        `SELECT d.maDoiQua, d.ngayDoi, d.diemSuDung, d.trangThai AS trangThaiDoiQua,
                q.tenQua, e.maVoucher, e.maCode, e.ngayPhatHanh, e.hanSuDung, e.trangThai AS trangThaiVoucher, e.ngaySuDung
         FROM DoiQua d
         JOIN QuaTang q ON d.maQua = q.maQua
         LEFT JOIN EVoucher e ON d.maDoiQua = e.maDoiQua
         WHERE d.maKH = ?
         ORDER BY d.maDoiQua DESC`,
        [maKH],
      );
    }

    return this.dataSource.query(
      `SELECT d.maDoiQua, d.ngayDoi, d.diemSuDung, d.trangThai AS trangThaiDoiQua, d.maKH,
              q.tenQua, e.maVoucher, e.maCode, e.ngayPhatHanh, e.hanSuDung, e.trangThai AS trangThaiVoucher, e.ngaySuDung
       FROM DoiQua d
       JOIN QuaTang q ON d.maQua = q.maQua
       LEFT JOIN EVoucher e ON d.maDoiQua = e.maDoiQua
       ORDER BY d.maDoiQua DESC`,
    );
  }

  // 18. Sử dụng E-Voucher (Cửa hàng / Thu ngân)
  async suDungEVoucher(maCode: string, adminId: number) {
    const voucherExist = await this.dataSource.query(
      'SELECT * FROM EVoucher WHERE maCode = ?',
      [maCode],
    );

    if (voucherExist.length === 0) {
      throw new BadRequestException('Mã E-Voucher không tồn tại!');
    }

    const voucher = voucherExist[0];

    if (voucher.trangThai === 'DA_SU_DUNG') {
      throw new BadRequestException('E-Voucher này đã được sử dụng trước đó!');
    }

    if (new Date(voucher.hanSuDung) < new Date()) {
      throw new BadRequestException('E-Voucher này đã hết hạn sử dụng!');
    }

    await this.dataSource.query(
      `UPDATE EVoucher 
       SET trangThai = 'DA_SU_DUNG', ngaySuDung = CURDATE() 
       WHERE maCode = ?`,
      [maCode],
    );

    await this.dataSource.query(
      `INSERT INTO AuditLog (maNhanVien, hanhDong, chiTiet)
       VALUES (?, 'SU_DUNG_EVOUCHER', ?)`,
      [adminId, `Sử dụng E-Voucher mã ${maCode} thành công`],
    );

    return { message: `Sử dụng E-Voucher ${maCode} thành công!` };
  }

  // 19. Xem lịch sử giao dịch điểm (Khách hàng xem của mình, Admin/Staff xem toàn bộ)
  async getLichSuGiaoDichDiem(maKH?: number, role?: string) {
    if (role === Role.CUSTOMER && maKH) {
      return this.dataSource.query(
        `SELECT g.maGD, g.loaiGD, g.soDiem, g.thoiGian, g.moTa, g.maKH
         FROM GiaoDichDiem g
         WHERE g.maKH = ?
         ORDER BY g.thoiGian DESC, g.maGD DESC`,
        [maKH],
      );
    }

    return this.dataSource.query(
      `SELECT g.maGD, g.loaiGD, g.soDiem, g.thoiGian, g.moTa, g.maKH
       FROM GiaoDichDiem g
       ORDER BY g.thoiGian DESC, g.maGD DESC`,
    );
  }

  // 20. Lấy danh sách tất cả các hạng thành viên
  async getDanhSachHangThanhVien() {
    return this.dataSource.query(
      'SELECT * FROM HangThanhVien ORDER BY diemToiThieu ASC',
    );
  }

  // 21. Tạo hạng thành viên mới (Admin/Staff)
  async createHangThanhVien(dto: CreateHangThanhVienDto) {
    try {
      const result = await this.dataSource.query(
        `INSERT INTO HangThanhVien (tenHang, diemToiThieu, diemToiDa, quyenLoi)
         VALUES (?, ?, ?, ?)`,
        [dto.tenHang, dto.diemToiThieu, dto.diemToiDa, dto.quyenLoi || null],
      );
      return {
        message: 'Tạo hạng thành viên thành công!',
        maHang: result.insertId,
      };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể tạo hạng thành viên');
    }
  }

  // 22. Cập nhật thông tin hạng thành viên (Admin/Staff)
  async updateHangThanhVien(id: number, dto: Partial<CreateHangThanhVienDto>) {
    try {
      const exist = await this.dataSource.query(
        'SELECT * FROM HangThanhVien WHERE maHang = ?',
        [id],
      );

      if (exist.length === 0) {
        throw new BadRequestException('Hạng thành viên không tồn tại!');
      }

      const cur = exist[0];
      await this.dataSource.query(
        `UPDATE HangThanhVien 
         SET tenHang = ?, diemToiThieu = ?, diemToiDa = ?, quyenLoi = ?
         WHERE maHang = ?`,
        [
          dto.tenHang ?? cur.tenHang,
          dto.diemToiThieu ?? cur.diemToiThieu,
          dto.diemToiDa ?? cur.diemToiDa,
          dto.quyenLoi ?? cur.quyenLoi,
          id,
        ],
      );

      return { message: 'Cập nhật hạng thành viên thành công!' };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Không thể cập nhật hạng thành viên');
    }
  }
}