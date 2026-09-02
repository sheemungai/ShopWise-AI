import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/users/enums/user-role.enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly UserService: UsersService,
  ) {}
  async create(createCustomerDto: CreateCustomerDto) {
    const user = await this.UserService.findOne(createCustomerDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== Role.customer) {
      throw new BadRequestException('User is not a customer');
    }
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      user,
    });
    return this.customerRepository.save(customer);
  }

  async findAll() {
    return this.customerRepository.find({
      relations: {
        user: true,
      },
    });
  }

  findOne(id: number) {
    return this.customerRepository.findOne({
      where: { customer_id: id },
      relations: {
        user: true,
      },
    });
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
    requestingUser: { sub: number; role: Role },
  ) {
    const customer = await this.customerRepository.findOne({
      where: { customer_id: id },
      relations: { user: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    const isOwner = customer.user.user_id === requestingUser.sub;
    const isAdmin = requestingUser.role === Role.admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update your profile');
    }
    await this.customerRepository.update(id, updateCustomerDto);
    return this.findOne(id);
  }

  async remove(id: number, requestingUser: { sub: number; role: Role }) {
    const customer = await this.customerRepository.findOne({
      where: { customer_id: id },
      relations: { user: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    const isOwner = customer.user.user_id === requestingUser.sub;
    const isAdmin = requestingUser.role === Role.admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your profile');
    }
    return this.customerRepository.delete(id);
  }
}
