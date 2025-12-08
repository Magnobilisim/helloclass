import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  userId: string;
  email?: string;
  claims: Record<string, any>;
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as RequestUser;
});
