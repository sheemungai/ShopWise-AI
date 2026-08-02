import {
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      select: {
        user_id: true,
      },
    });
    if (existingUser) {
      throw new Error(`User with email ${createUserDto.email} already exists`);
    }

    // const newUser = Partial<User> = {
    //   name: createUserDto.name,
    //   email: createUserDto.email,
    //   password: createUserDto.password,
    //   role: createUserDto.role,
    //   phone: createUserDto.phone,
    // };
    // if (createUserDto.role) {
    //   newUser.role = createUserDto.role;
    // }
    // const savedUser = await this.userRepository.save(newUser);
    // return savedUser;
    return this.userRepository.save(createUserDto);
  }

  async findAll(email?: string) {
    let users: User[];
    if (email) {
      users = await this.userRepository.find({
        where: { email },
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
        },
      });
    } else {
      users = await this.userRepository.find({
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
        },
      });
    }
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
      throw new Error(`user with id ${id} not found`);
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
    {
      return this.userRepository.update(id, updateUserDto);
    }
  }

  async delete(id: number) {
    return await this.userRepository
      .delete(id)
      .then((result) => {
        if (result.affected === 0) {
          return `user with id ${id} not found`;
        }
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        throw new Error(`Failed to delete user with id ${id}`);
      });
  }
}
