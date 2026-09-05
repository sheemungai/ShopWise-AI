import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AtGuard, RolesGuard } from 'src/auth/guards';
import { Role } from './enums/user-role.enum';
import { Public, Roles } from 'src/auth/decorators';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        success: true,
        data: user,
        message: 'User created successfully',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      throw new BadRequestException(message);
    }
  }

  @Roles(Role.admin, Role.seller)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      count: users.length,
      data: users,
    };
  }

  @Roles(Role.admin, Role.seller)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    return {
      success: true,
      data: user,
    };
  }

  @Roles(Role.admin)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updateUser = await this.usersService.update(id, updateUserDto, id);
    return {
      success: true,
      data: updateUser,
      message: 'User updated successfully',
    };
  }

  @Roles(Role.admin)
  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: Role },
  ) {
    return this.usersService.updateRole(id, body.role);
  }

  @Roles(Role.admin)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.delete(id);
    return {
      success: true,
      data: user,
      message: ` user with id ${id} deleted successfully`,
    };
  }
}
