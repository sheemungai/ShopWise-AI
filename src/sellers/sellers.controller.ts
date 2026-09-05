import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/guards';
import { Roles } from 'src/auth/decorators';
import { Role } from 'src/users/enums/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { RequestWithUser } from 'src/types/request-with-user';
import { ApplySellerDto } from './dto/apply-seller.dto';

@ApiTags('sellers')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Roles(Role.admin, Role.seller)
  @Post()
  create(@Body() createSellerDto: CreateSellerDto) {
    return this.sellersService.create(createSellerDto);
  }

  @UseGuards(AtGuard)
  @Post('apply')
  applyToBecomeSeller(
    @Body() applySellerDto: ApplySellerDto,
    @Req() req: RequestWithUser,
  ) {
    return this.sellersService.applyToBeSeller(req.user.sub, applySellerDto);
  }

  @Roles(Role.admin, Role.seller)
  @Get()
  findAll() {
    return this.sellersService.findAll();
  }

  @Roles(Role.admin, Role.seller)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sellersService.findOne(+id);
  }

  @Roles(Role.admin, Role.seller)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSellerDto: UpdateSellerDto,
    @Req() req: RequestWithUser,
  ) {
    return this.sellersService.update(id, updateSellerDto, req.user);
  }

  @Roles(Role.admin, Role.seller)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.sellersService.remove(id, req.user);
  }
}
