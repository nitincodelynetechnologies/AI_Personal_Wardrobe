import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PublicUser } from '../../users/interfaces/user.interface';
import { UsersService } from '../../users/users.service';
import { parseAdminEmailAllowlist, withAdminRole } from '../utils/admin-role.util';

export interface JwtPayload {
  sub: string;
  email?: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<PublicUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.findById(payload.sub);

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    const allowlist = parseAdminEmailAllowlist(
      this.configService.get<string>('auth.adminEmails'),
    );

    return withAdminRole(user, allowlist);
  }
}
