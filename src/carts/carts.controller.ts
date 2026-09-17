import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AtGuard } from 'src/auth/guards';
import type { RequestWithUser } from 'src/types/request-with-user';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(AtGuard)
@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  getCart(@Req() req: RequestWithUser) {
    return this.cartsService.getCart(req.user.sub);
  }

  @Post('items')
  addItem(@Body() addItemDto: AddItemDto, @Req() req: RequestWithUser) {
    return this.cartsService.addItem(req.user.sub, addItemDto);
  }

  @Patch('items/:itemId')
  updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
    @Req() req: RequestWithUser,
  ) {
    return this.cartsService.updateItem(req.user.sub, itemId, updateItemDto);
  }

  @Delete('items/:itemId')
  removeItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.cartsService.removeItem(req.user.sub, itemId);
  }

  @Delete()
  clearCart(@Req() req: RequestWithUser) {
    return this.cartsService.clearCart(req.user.sub);
  }
}
