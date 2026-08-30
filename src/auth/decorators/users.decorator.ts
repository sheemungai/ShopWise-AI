import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRequest } from '../guards';

export const UserD = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data ? request.user?.[data] : request.user;
  },
);
