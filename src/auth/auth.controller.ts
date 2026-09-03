import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from './decorators';
import { AtGuard, RtGuard } from './guards';

interface RequestWithUser extends Request {
  user: {
    sub: number;
    refreshToken: string;
    [key: string]: any;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  SignIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signIn(createAuthDto);
  }

  @UseGuards(AtGuard)
  @Get('signout/:id')
  signOut(@Param('id', ParseIntPipe) id: number) {
    return this.authService.signOut(id);
  }

  @Public()
  @UseGuards(RtGuard)
  @Get('refresh')
  refreshTokens(
    @Query('id', ParseIntPipe) user_id: number,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.sub !== user_id) {
      throw new UnauthorizedException('User id mismatch');
    }
    return this.authService.refreshTokens(user_id, user.refreshToken);
  }
}
