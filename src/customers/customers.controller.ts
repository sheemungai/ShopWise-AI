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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AtGuard, RolesGuard } from 'src/auth/guards';
import { Role } from 'src/users/enums/user-role.enum';
import { Roles } from 'src/auth/decorators';
import type { RequestWithUser } from 'src/types/request-with-user';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(Role.admin, Role.customer)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Roles(Role.admin, Role.customer)
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Roles(Role.admin, Role.customer)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(+id);
  }

  @Roles(Role.admin, Role.customer)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Req() req: RequestWithUser,
  ) {
    return this.customersService.update(id, updateCustomerDto, req.user);
  }

  @Roles(Role.admin, Role.customer)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.customersService.remove(id, req.user);
  }
}
