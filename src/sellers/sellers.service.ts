import { Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/enums/user-role.enum';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    private readonly UserService: UsersService,
  ) {}

  async create(createSellerDto: CreateSellerDto) {
    const user = await this.UserService.findOne(createSellerDto.user_id);
    if (!user) {
      throw new Error('Seller not found');
    }

    if (user.role !== Role.seller) {
      throw new Error('User is not a seller');
    }
    const seller = this.sellerRepository.create({
      ...createSellerDto,
      user,
    });
    return this.sellerRepository.save(seller);
  }

  async findAll() {
    return this.sellerRepository.find({
      relations: {
        user: true,
      },
    });
  }

  async findOne(id: number) {
    return this.sellerRepository.findOne({
      where: { seller_id: id },
      relations: {
        user: true,
      },
    });
  }

  async update(id: number, updateSellerDto: UpdateSellerDto) {
    const seller = await this.sellerRepository.findOne({
      where: { seller_id: id },
    });

    if (!seller) {
      return 'Seller not found';
    }
    return this.sellerRepository.update(id, updateSellerDto);
  }

  remove(id: number) {
    return this.sellerRepository.delete(id);
  }
}
