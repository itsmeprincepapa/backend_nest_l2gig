import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn((data) => Promise.resolve({ id: 'u1', ...data })),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('hache le mot de passe a la creation', async () => {
    await service.create({
      email: 'client@phoneshop.sn',
      password: 'Client123!',
      fullName: 'Client Demo',
    });

    const savedArg = mockRepo.create.mock.calls[0][0];
    expect(savedArg.password).not.toBe('Client123!');
    expect(await bcrypt.compare('Client123!', savedArg.password)).toBe(true);
  });

  it('leve une NotFoundException si l\'utilisateur n\'existe pas', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('inconnu')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('filtre findClients sur le role CLIENT', async () => {
    mockRepo.find.mockResolvedValue([]);
    await service.findClients();
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { role: Role.CLIENT },
    });
  });

  it('re-hache le mot de passe uniquement s\'il est modifie', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 'u1',
      email: 'client@phoneshop.sn',
      password: 'ancienHash',
      fullName: 'Client Demo',
      role: Role.CLIENT,
    });

    await service.update('u1', { password: 'NouveauMdp123' });

    const savedArg = mockRepo.save.mock.calls[0][0];
    expect(savedArg.password).not.toBe('NouveauMdp123');
    expect(await bcrypt.compare('NouveauMdp123', savedArg.password)).toBe(
      true,
    );
  });

  it('ne touche pas au mot de passe si non fourni dans l\'update', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 'u1',
      email: 'client@phoneshop.sn',
      password: 'ancienHash',
      fullName: 'Client Demo',
      role: Role.CLIENT,
    });

    await service.update('u1', { fullName: 'Nouveau Nom' });

    const savedArg = mockRepo.save.mock.calls[0][0];
    expect(savedArg.password).toBe('ancienHash');
    expect(savedArg.fullName).toBe('Nouveau Nom');
  });
});
