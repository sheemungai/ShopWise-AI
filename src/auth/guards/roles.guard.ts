import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JWTPayLoad } from '../strategies';
import { InjectRepository } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/users/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

export interface UserRequest extends Request {
  user: JWTPayLoad;
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const dbUser = await this.userRepository.findOne({
      where: { user_id: user.sub },
    });
    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }
    return requiredRoles.includes(dbUser.role);
  }
}
