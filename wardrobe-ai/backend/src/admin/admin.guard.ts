import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PublicUser } from '../users/interfaces/user.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: PublicUser }>();
    const role = request.user?.role;

    if (role === 'admin') {
      return true;
    }

    throw new ForbiddenException('Admin access required');
  }
}
