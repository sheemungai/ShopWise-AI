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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      count: users.length,
      data: users,
    };
  }

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
