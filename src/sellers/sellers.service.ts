import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/enums/user-role.enum';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    private readonly UserService: UsersService,
    @InjectDataSource() private readonly datasource: DataSource,
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

  async applyToBeSeller(userId: number, applySellerDto: ApplySellerDto) {
    return this.datasource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: {
          user_id: userId,
        },
      });
      if (!user) {
        throw new NotFoundException(`User with is ${userId} not found`);
      }
      if (user.role === Role.seller) {
        throw new ConflictException('You are already a seller');
      }
      if (user.role === Role.admin) {
        throw new ForbiddenException(
          'Admin accounts annot be converted to seller account',
        );
      }
      const seller = manager.create(Seller, {
        ...applySellerDto,
        user,
      });
      const savedSeller = await manager.save(seller);

      await manager.update(User, userId, { role: Role.seller });

      return savedSeller;
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
