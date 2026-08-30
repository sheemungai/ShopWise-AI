import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import type { Request } from 'express';

type JWTPayLoad = {
  sub: number;
  emai: string;
};

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(private readonly ConfigService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: ConfigService.getOrThrow<string>('JWT_REFRESH_secret'),
      passReqToCallback: true,
    };
    super(options);
  }
  validate(req: Request, payload: JWTPayLoad): unknown {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new ForbiddenException('No refresh token provided');
    }
    const refreshToken = authHeader.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('invalid refresh token format');
    }
    return {
      ...payload,
      refreshToken,
    };
  }
}
