import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // IMPORTANT : cette route doit rester déclarée AVANT "GET /users/:id"
  @Get('clients')
  @Roles(Role.ADMIN)
  findClients() {
    return this.usersService.findClients();
  }

  // Accessible a l'ADMIN (tout le monde) ou au proprietaire du profil (lui-meme)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string; role: Role },
  ) {
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('Acces refuse : role insuffisant');
    }
    return this.usersService.findOne(id);
  }

  // Idem : ADMIN peut modifier n'importe qui, un CLIENT ne peut modifier que
  // son propre profil, et seul un ADMIN a le droit de changer un "role"
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: { id: string; role: Role },
  ) {
    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isAdmin && currentUser.id !== id) {
      throw new ForbiddenException('Acces refuse : role insuffisant');
    }

    if (dto.role && !isAdmin) {
      throw new ForbiddenException(
        'Seul un administrateur peut modifier le role d\'un utilisateur',
      );
    }

    return this.usersService.update(id, dto);
  }
}
