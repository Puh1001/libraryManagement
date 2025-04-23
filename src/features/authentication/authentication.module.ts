import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UsersModule } from 'src/features/users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './services/authentication.service';
import { CookieService } from './cookie.service';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(EnvironmentConstants.JWT_ACCESS_SECRET),
        signOptions: {
          expiresIn: configService.get(
            EnvironmentConstants.JWT_ACCESS_EXPIRES_IN,
          ),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    CookieService,
  ],
})
export class AuthenticationModule {}
