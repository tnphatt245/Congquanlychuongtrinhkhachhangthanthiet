import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../auth.module';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // Trích xuất thông tin người dùng từ JWT Payload gán vào Request Object (req.user)
    return {
      userId: payload.sub,
      maKH: payload.maKH || payload.sub,
      email: payload.email,
      role: payload.role || Role.CUSTOMER, // Đảm bảo RolesGuard đọc được req.user.role
    };
  }
}