import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/guards';
import { AtStrategy } from 'src/auth/strategies';
import { Roles } from 'src/auth/decorators';
import { Role } from 'src/users/enums/user-role.enum';

@ApiTags('sellers')
@ApiBearerAuth()
@UseGuards(AtGuard, AtStrategy)
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Roles(Role.admin, Role.seller)
  @Post()
  create(@Body() createSellerDto: CreateSellerDto) {
    return this.sellersService.create(createSellerDto);
  }

  @Roles(Role.admin, Role.seller)
  @Get()
  findAll() {
    return this.sellersService.findAll();
  }

  @Roles(Role.admin, Role.seller)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellersService.findOne(+id);
  }

  @Roles(Role.admin, Role.seller)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSellerDto: UpdateSellerDto) {
    return this.sellersService.update(+id, updateSellerDto);
  }

  @Roles(Role.admin, Role.seller)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellersService.remove(+id);
  }
}
