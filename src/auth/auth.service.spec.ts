import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = { findByEmail: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: () => 'fake-jwt-token' } },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('connecte un utilisateur avec des identifiants valides', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      id: '1', email: 'admin@phoneshop.sn', password: hashedPassword,
      role: 'ADMIN', fullName: 'Admin PhoneShop',
    });

    const result = await authService.login('admin@phoneshop.sn', 'password123');

    expect(result.access_token).toBe('fake-jwt-token');
    expect(result.user.role).toBe('ADMIN');
  });

  it('rejette un mot de passe invalide', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      id: '1', email: 'admin@phoneshop.sn', password: hashedPassword, role: 'ADMIN',
    });

    await expect(
      authService.login('admin@phoneshop.sn', 'mauvais-mdp'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("rejette un email qui n'existe pas", async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.login('inconnu@phoneshop.sn', 'password123'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
