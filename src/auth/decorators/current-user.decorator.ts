import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadType } from '../strategies/types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayloadType => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
