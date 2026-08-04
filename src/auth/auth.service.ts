import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/users/enums/user-role.enum';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { userInfo } from 'os';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async getTokens(
    user_id: number,
    email: string,
    password: string,
    role: Role,
  ) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user_id, email: email, role: role },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user_id,
          email: email,
          role: role,
        },
        {
          secret: this.configService.gerOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }

  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  private async saveRefreshToken(user_id: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userRepository.update(user_id, {
      hashedRefreshToken,
    });
  }

  async signIn(CreateAuthDto: CreateAuthDto) {
    const foundUser = await this.userRepository.findOne({
      where: { email: CreateAuthDto.email },
      select: ['user_id', 'email', 'password', 'role'],
    });
    if (!foundUser) {
      throw NotFoundException(
        `user with email ${CreateAuthDto.email} not found`,
      );
    }
    const foundPassword = await bcrypt.compare(
      CreateAuthDto.password,
      foundUser.password,
    );
    if (!foundPassword) {
      throw new NotFoundException(
        `invalid credentials for user with email ${CreateAuthDto.email}`,
      );
    }
    const { accessToken, refreshToken } = await this.getTokens(
      foundUser.user_id,
      foundUser.email,
      foundUser.role,
    );
    await this.saveRefreshToken(foundUser.user_id, refreshToken);
    return {
      token: {
        accessToken,
        refreshToken,
      },

      user: {
        user_id: foundUser.user_id,
        email: foundUser.email,
        role: foundUser.role,
      },
    };
  }

  async signOut(user_id: number) {
    const foundUser = await this.userRepository.findOne({
      where: { user_id: user_id },
      select: ['user_id', 'email', 'role', 'hashedRefreshToken'],
    });
    if (!foundUser) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }
    await this.userRepository.update(user_id, {
      hashedRefreshToken: null,
    });
    return { message: ` user with id:${user_id} signed out successfully` };
  }
  async refreshTokens(user_id: number, refreshToken: string) {
    const foundUser = await this.userRepository.findOne({
      where: { user_id: user_id },
      select: ['user_id', 'email', 'role', 'hashedRefreshToken'],
    });
    if (!foundUser) {
      throw new NotFoundException(`user with id: ${user_id} not found`);
    }
    if (!foundUser.hashedRefreshToken) {
      throw new NotFoundException(
        `User with id ${user_id} does not have a refresh token`,
      );
    }
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      foundUser.hashedRefreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new NotFoundException(
        `Invalid refresh token for user with id ${user_id}`,
      );
    }
    const { accessToken, refreshToken: newRefreshToken } = await this.getTokens(
      foundUser.user_id,
      foundUser.email,
      foundUser.role,
    );
    await this.saveRefreshToken(foundUser.user_id, newRefreshToken);
    return { accessToken, refreshToken: newRefreshToken };
  }
}
