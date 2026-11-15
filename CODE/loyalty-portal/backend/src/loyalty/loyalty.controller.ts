import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Put,
  Delete,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { TichDiemDto } from './dto/tich-diem.dto';
import { DoiQuaDto } from './dto/doi-qua.dto';
import { DieuChinhDiemDto } from './dto/dieu-chinh-diem.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateQuaTangDto } from './dto/create-qua-tang.dto';
import { UpdateQuaTangDto } from './dto/update-qua-tang.dto';
import { CreateKhieuNaiDto } from './dto/create-khieu-nai.dto';
import { XuLyKhieuNaiDto } from './dto/xu-ly-khieu-nai.dto';
import { CreateQuyTacDto } from './dto/create-quy-tac.dto';
import { CreatePhienBanQuyTacDto } from './dto/create-phien-ban-quy-tac.dto';
import { CreateHangThanhVienDto } from './dto/create-hang-thanh-vien.dto';

@ApiTags('Loyalty Management')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  // Helper trích xuất maKH/maNV an toàn từ JWT Request Payload
  private extractMaKH(req: any): number {
    const maKH =
      req.user?.maKH || req.user?.userId || req.user?.sub || req.user?.id;
    return Number(maKH);
  }

  // 1. API Quản trị - Xem tổng quan khách hàng & hạng thẻ
  @Get('khach-hang-tong-quan')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách tổng quan khách hàng và hạng thẻ (Admin/Staff)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách khách hàng thành công' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc JWT Token không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Không có quyền truy cập' })
  getKhachHangTongQuan() {
    return this.loyaltyService.getKhachHangTongQuan();
  }

  // API Lấy thông tin cá nhân khách hàng đang đăng nhập
  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin tài khoản & điểm của khách hàng đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin cá nhân thành công' })
  async getProfile(@Req() req: any) {
    const maKH = this.extractMaKH(req);
    const danhSach = await this.loyaltyService.getKhachHangTongQuan();
    const khachHang = danhSach.find((item: any) => item.maKH == maKH || item.id == maKH);

    if (!khachHang) {
      throw new NotFoundException(`Không tìm thấy thông tin cho khách hàng mã #${maKH}`);
    }
    return khachHang;
  }

  // API Lấy chi tiết 1 khách hàng theo ID
  @Get('khach-hang/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết thông tin 1 khách hàng theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin khách hàng thành công' })
  async getKhachHangChiTiet(@Param('id') id: string) {
    const danhSach = await this.loyaltyService.getKhachHangTongQuan();
    const khachHang = danhSach.find((item: any) => item.maKH == id || item.id == id);

    if (!khachHang) {
      throw new NotFoundException(`Không tìm thấy khách hàng mã #${id}`);
    }
    return khachHang;
  }

  // 2. API Quản trị - Xem thống kê đổi quà
  @Get('thong-ke-doi-qua')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Lấy lịch sử đổi quà tổng quan (Admin/Staff)' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công' })
  getThongKeDoiQua() {
    return this.loyaltyService.getThongKeDoiQua();
  }

  // 3. API Khách hàng - Tích điểm & Thăng hạng
  @Post('tich-diem')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thực hiện tích điểm và tự động xét thăng hạng' })
  @ApiResponse({ status: 201, description: 'Tích điểm thành công' })
  tichDiem(@Req() req: any, @Body() dto: TichDiemDto) {
    const maKH = this.extractMaKH(req);
    return this.loyaltyService.tichDiem(maKH, dto);
  }

  // 4. API Khách hàng - Đổi quà & Cấp EVoucher
  @Post('doi-qua')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thực hiện đổi quà, trừ điểm và cấp EVoucher' })
  @ApiResponse({ status: 201, description: 'Đổi quà thành công và đã sinh mã EVoucher' })
  doiQua(@Req() req: any, @Body() dto: DoiQuaDto) {
    const maKH = this.extractMaKH(req);
    return this.loyaltyService.doiQua(maKH, dto);
  }

  // 5. API Xem lịch sử đổi quà kèm E-Voucher
  @Get('doi-qua/lich-su')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem lịch sử đổi quà & danh sách E-Voucher' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách E-Voucher thành công' })
  getLichSuDoiQua(@Req() req: any) {
    const maKH = this.extractMaKH(req);
    return this.loyaltyService.getLichSuDoiQua(maKH, req.user?.role);
  }

  // 6. API Sử dụng / Gạch nợ E-Voucher tại cửa hàng (HD07)
  @Patch('evoucher/:maCode/su-dung')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Sử dụng / Gạch nợ E-Voucher tại cửa hàng' })
  @ApiResponse({ status: 200, description: 'Sử dụng E-Voucher thành công' })
  suDungEVoucher(@Param('maCode') maCode: string, @Req() req: any) {
    const maNV = this.extractMaKH(req);
    return this.loyaltyService.suDungEVoucher(maCode, maNV || 1);
  }

  // =========================================================================
  // LUỒNG PHÊ DUYỆT ĐIỂM 2 BƯỚC (HD15 & HD16) - BẢNG YeuCauDieuChinhDiem
  // =========================================================================

  // HD15: Nhân viên/Admin tạo phiếu yêu cầu điều chỉnh điểm
  @Post('dieu-chinh-diem/yeu-cau')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Tạo phiếu yêu cầu điều chỉnh điểm (HD15)' })
  @ApiResponse({ status: 201, description: 'Tạo phiếu yêu cầu thành công, chờ phê duyệt' })
  taoYeuCauDieuChinhDiem(@Req() req: any, @Body() dto: any) {
    const maNV_Tao = this.extractMaKH(req);
    return this.loyaltyService.taoYeuCauDieuChinhDiem(maNV_Tao, dto);
  }

  // HD16: Xem danh sách các yêu cầu điều chỉnh điểm
  @Get('dieu-chinh-diem/danh-sach')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu điều chỉnh điểm (HD16)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách yêu cầu thành công' })
  getDanhSachYeuCauDieuChinh() {
    return this.loyaltyService.getDanhSachYeuCauDieuChinh();
  }

  // HD16: Admin phê duyệt hoặc từ chối yêu cầu
  @Patch('dieu-chinh-diem/:id/phe-duyet')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Phê duyệt hoặc Từ chối yêu cầu điều chỉnh điểm (HD16)' })
  @ApiResponse({ status: 200, description: 'Xử lý phê duyệt thành công' })
  pheDuyetYeuCauDieuChinh(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: { trangThai: 'DA_DUYET' | 'TU_CHOI'; lyDoTuChoi?: string },
  ) {
    const maNV_Duyet = this.extractMaKH(req);
    return this.loyaltyService.pheDuyetYeuCauDieuChinh(+id, dto, maNV_Duyet);
  }

  // API Điều chỉnh điểm trực tiếp (Legacy)
  @Post('dieu-chinh-diem')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Điều chỉnh điểm trực tiếp (Legacy)' })
  dieuChinhDiem(@Req() req: any, @Body() dto: DieuChinhDiemDto) {
    const maNV = this.extractMaKH(req);
    return this.loyaltyService.dieuChinhDiem(maNV, dto);
  }

  // =========================================================================
  // AUDIT LOG & BÁO CÁO (HD17)
  // =========================================================================

  @Get(['audit-logs', 'audit-log'])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tra cứu nhật ký thao tác Audit Log (HD17)' })
  @ApiResponse({ status: 200, description: 'Lấy nhật ký thao tác thành công' })
  getAuditLogs() {
    return this.loyaltyService.getAuditLogs();
  }

  // 9. Quản lý danh mục Quà tặng
  @Get('danh-muc-qua')
  @ApiOperation({ summary: 'Lấy danh sách quà tặng khả dụng' })
  getDanhSachQuaTang() {
    return this.loyaltyService.getDanhSachQuaTang();
  }

  @Post('danh-muc-qua')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Thêm quà tặng mới vào kho (Admin/Staff)' })
  createQuaTang(@Body() dto: CreateQuaTangDto) {
    return this.loyaltyService.createQuaTang(dto);
  }

  @Put('danh-muc-qua/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Cập nhật thông tin món quà (Admin/Staff)' })
  updateQuaTang(@Param('id') id: string, @Body() dto: UpdateQuaTangDto) {
    return this.loyaltyService.updateQuaTang(+id, dto);
  }

  @Delete('danh-muc-qua/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Ngừng áp dụng món quà (Admin/Staff)' })
  deleteQuaTang(@Param('id') id: string) {
    return this.loyaltyService.deleteQuaTang(+id);
  }

  // 10. Quản lý Khiếu nại
  @Post('khieu-nai')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gửi yêu cầu khiếu nại (Khách hàng)' })
  createKhieuNai(@Req() req: any, @Body() dto: CreateKhieuNaiDto) {
    const maKH = this.extractMaKH(req);
    return this.loyaltyService.createKhieuNai(maKH, dto);
  }

  @Get('khieu-nai')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem danh sách khiếu nại' })
  getDanhSachKhieuNai(@Req() req: any) {
    const maKH = this.extractMaKH(req);
    return this.loyaltyService.getDanhSachKhieuNai(maKH, req.user?.role);
  }

  @Patch('khieu-nai/:id/xu-ly')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Phê duyệt / Từ chối khiếu nại (Admin/Staff)' })
  xuLyKhieuNai(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: XuLyKhieuNaiDto,
  ) {
    const maNV = this.extractMaKH(req);
    return this.loyaltyService.xuLyKhieuNai(+id, dto, maNV);
  }

  // 11. Quản lý Quy tắc Tích điểm & Phiên bản
  @Post('quy-tac')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Tạo quy tắc tích điểm (Admin/Staff)' })
  createQuyTac(@Body() dto: CreateQuyTacDto) {
    return this.loyaltyService.createQuyTac(dto);
  }

  @Get('quy-tac')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách quy tắc tích điểm & phiên bản' })
  getDanhSachQuyTac() {
    return this.loyaltyService.getDanhSachQuyTac();
  }

  @Post('phien-ban-quy-tac')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Tạo phiên bản quy tắc tích điểm (Admin/Staff)' })
  createPhienBanQuyTac(@Body() dto: CreatePhienBanQuyTacDto) {
    return this.loyaltyService.createPhienBanQuyTac(dto);
  }

  @Get('giao-dich-diem/lich-su')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem lịch sử giao dịch điểm (Khách hàng/Admin)' })
  getLichSuGiaoDichDiem(@Req() req: any) {
    const maKH = this.extractMaKH(req);
    return this.loyaltyService.getLichSuGiaoDichDiem(maKH, req.user?.role);
  }

  @Get('hang-thanh-vien')
  @ApiOperation({ summary: 'Lấy danh sách các hạng thành viên & quyền lợi' })
  getDanhSachHangThanhVien() {
    return this.loyaltyService.getDanhSachHangThanhVien();
  }

  @Post('hang-thanh-vien')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Tạo hạng thành viên mới (Admin/Staff)' })
  createHangThanhVien(@Body() dto: CreateHangThanhVienDto) {
    return this.loyaltyService.createHangThanhVien(dto);
  }

  @Put('hang-thanh-vien/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Cập nhật hạng thành viên (Admin/Staff)' })
  updateHangThanhVien(
    @Param('id') id: string,
    @Body() dto: Partial<CreateHangThanhVienDto>,
  ) {
    return this.loyaltyService.updateHangThanhVien(+id, dto);
  }
}