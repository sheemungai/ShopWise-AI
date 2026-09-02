import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new NotFoundException('Seller not found');
    }

    if (user.role !== Role.seller) {
      throw new BadRequestException('Seller is not a seller');
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

  async update(
    id: number,
    updateSellerDto: UpdateSellerDto,
    requestingUser: { sub: number; role: Role },
  ) {
    const seller = await this.sellerRepository.findOne({
      where: { seller_id: id },
      relations: { user: true },
    });

    if (!seller) {
      throw new NotFoundException(` Selle with id ${id} not found`);
    }
    const isOwner = seller.user.user_id === requestingUser.sub;
    const isAdmin = requestingUser.role === Role.admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You can only update your own seller profile',
      );
    }

    await this.sellerRepository.update(id, updateSellerDto);
    return this.findOne(id);
  }

  async remove(id: number, requestingUser: { sub: number; role: Role }) {
    const seller = await this.sellerRepository.findOne({
      where: { seller_id: id },
      relations: { user: true },
    });

    if (!seller) {
      throw new NotFoundException(`Seller with id ${id} not found`);
    }

    const isOwner = seller.user.user_id === requestingUser.sub;
    const isAdmin = requestingUser.role === Role.admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You can only delete your own seller profile',
      );
    }

    return this.sellerRepository.delete(id);
  }
}
