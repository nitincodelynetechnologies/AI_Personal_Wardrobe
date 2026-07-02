import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublicUser } from '../users/interfaces/user.interface';
import { isAdminEmail, parseAdminEmailAllowlist } from '../auth/utils/admin-role.util';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: PublicUser }>();
    const user = request.user;
    const allowlist = parseAdminEmailAllowlist(
      this.configService.get<string>('auth.adminEmails'),
    );

    if (user?.role === 'admin' || isAdminEmail(user?.email, allowlist)) {
      return true;
    }

    throw new ForbiddenException('Admin access required');
  }
}
