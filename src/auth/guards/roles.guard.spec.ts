import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../common/enums/role.enum';

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  function mockContext(userRole?: Role, requiredRoles?: Role[]) {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: userRole ? { role: userRole } : null }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  it("laisse passer si aucun role n'est requis", () => {
    const ctx = mockContext(Role.CLIENT, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('laisse passer un admin sur une route ADMIN', () => {
    const ctx = mockContext(Role.ADMIN, [Role.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('bloque un client sur une route ADMIN', () => {
    const ctx = mockContext(Role.CLIENT, [Role.ADMIN]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
