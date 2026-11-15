import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  // 1. Đăng ký Tài khoản Khách hàng
  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.dataSource.query(
        'SELECT * FROM KhachHang WHERE email = ?',
        [dto.email],
      );

      if (existingUser.length > 0) {
        throw new BadRequestException('Email này đã được sử dụng!');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(dto.matKhau, saltRounds);

      await this.dataSource.query(
        `INSERT INTO KhachHang (hoTen, email, soDienThoai, matKhau, diemHienTai, ngayThamGia, maHang) 
         VALUES (?, ?, ?, ?, 0, CURDATE(), 1)`,
        [dto.hoTen, dto.email, dto.soDienThoai, hashedPassword],
      );

      return { message: 'Đăng ký tài khoản thành công!' };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(error?.message || 'Không thể đăng ký tài khoản');
    }
  }

  // 2. Đăng nhập & Cấp JWT Token tích hợp Phân quyền (RBAC)
  async login(dto: LoginDto) {
    try {
      const users = await this.dataSource.query(
        'SELECT * FROM KhachHang WHERE email = ?',
        [dto.email],
      );

      if (users.length === 0) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
      }

      const user = users[0];

      if (!user.matKhau) {
        throw new UnauthorizedException('Tài khoản này chưa thiết lập mật khẩu!');
      }

      const isPasswordValid = await bcrypt.compare(dto.matKhau, user.matKhau);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
      }

      // Lấy role từ DB (nếu có cột vaiTro/role) hoặc gán mặc định ADMIN để test các API Quản trị
      const userRole = user.vaiTro || user.role || Role.ADMIN;

      // Đóng gói thông tin vào JWT Payload
      const payload = { 
        sub: user.maKH, 
        maKH: user.maKH, 
        email: user.email, 
        role: userRole,
      };

      const token = this.jwtService.sign(payload);

      return {
        access_token: token,
        user: {
          maKH: user.maKH,
          hoTen: user.hoTen,
          email: user.email,
          diemHienTai: user.diemHienTai,
          role: userRole,
        },
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error?.message || 'Lỗi đăng nhập');
    }
  }
}