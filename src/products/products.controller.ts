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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { AtGuard, RolesGuard } from 'src/auth/guards';
import { Roles, Public } from 'src/auth/decorators';
import { Role } from 'src/users/enums/user-role.enum';
import type { RequestWithUser } from 'src/types/request-with-user';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.admin, Role.seller)
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: RequestWithUser,
  ) {
    return this.productsService.create(createProductDto, req.user);
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Roles(Role.admin, Role.seller)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: RequestWithUser,
  ) {
    return this.productsService.update(id, updateProductDto, req.user);
  }

  @Roles(Role.admin, Role.seller)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.productsService.remove(id, req.user);
  }

  @Roles(Role.admin, Role.seller)
  @Post(':id/variants')
  addVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() createVariantDto: CreateVariantDto,
    @Req() req: RequestWithUser,
  ) {
    return this.productsService.addVariant(id, createVariantDto, req.user);
  }

  @Roles(Role.admin, Role.seller)
  @Patch(':id/variants/:variantId')
  updateVariant(
    @Param('id', ParseIntPipe) id: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() updateVariantDto: UpdateProductDto,
    @Req() req: RequestWithUser,
  ) {
    return this.productsService.updateVariant(
      id,
      variantId,
      updateVariantDto,
      req.user,
    );
  }

  @Roles(Role.admin, Role.seller)
  @Delete(':id/variants/:variantId')
  removeVariant(
    @Param('id', ParseIntPipe) id: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.productsService.removeVariant(id, variantId, req.user);
  }
}
