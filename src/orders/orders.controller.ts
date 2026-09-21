import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AtGuard, RolesGuard } from 'src/auth/guards';
import { Roles } from 'src/auth/decorators';
import { Role } from 'src/users/enums/user-role.enum';
import type { RequestWithUser } from 'src/types/request-with-user';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Body() checkoutDto: CheckoutDto, @Req() req: RequestWithUser) {
    return this.ordersService.checkout(req.user.sub, checkoutDto);
  }

  @Get('mine')
  findMine(@Req() req: RequestWithUser) {
    return this.ordersService.findAllForCustomer(req.user.sub);
  }

  @Roles(Role.admin)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.ordersService.findOne(id, req.user);
  }

  @Roles(Role.admin)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }
}
