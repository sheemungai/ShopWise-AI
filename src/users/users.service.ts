import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Role } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      select: { user_id: true },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    const hashedPassword = await this.hashData(createUserDto.password);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: Role.customer,
    });
    return this.userRepository.save(newUser);
  }

  async findAll(email?: string) {
    const users = await this.userRepository.find({
      where: email ? { email } : {},
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });
    return users.map((user) => plainToInstance(User, user));
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return plainToInstance(User, user);
  }

  async update(id: number, updateUserDto: UpdateUserDto, user_id: number) {
    if (user_id !== id) {
      throw new ForbiddenException(
        'You are not authorized to update this user',
      );
    }

    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updatePayload: Partial<User> & { password?: string } = {
      ...updateUserDto,
    };

    if (updatePayload.password) {
      updatePayload.password = await this.hashData(updatePayload.password);
    }

    await this.userRepository.update(id, updatePayload);
    return this.findOne(id);
  }

  async updateRole(id: number, role: Role) {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.update(id, { role });
    return this.findOne(id);
  }

  async delete(id: number) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return { message: `User with id ${id} deleted successfully` };
  }
}
