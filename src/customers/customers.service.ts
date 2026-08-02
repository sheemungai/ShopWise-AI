import { Injectable } from '@nestjs/common';
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
      throw new Error('User not found');
    }
    if (user.role !== Role.customer) {
      throw new Error('User is not a customer');
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

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({
      where: { customer_id: id },
    });

    if (!customer) {
      return 'Customer not found';
    }
    return this.customerRepository.update(id, updateCustomerDto);
  }

  remove(id: number) {
    return this.customerRepository.delete(id);
  }
}
