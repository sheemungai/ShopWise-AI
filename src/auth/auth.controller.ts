import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  SignIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signIn(createAuthDto);
  }

  @Get('signout/:id')
  signOut(@Param('id', ParseIntPipe) id: number) {
    return this.authService.signOut(id);
  }

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
