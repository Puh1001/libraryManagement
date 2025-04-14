import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UserDocument } from '../users/schemas/user.schemas';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {}

  async getRefreshToken(user: UserDocument) {
    const refresh_token = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.configService.get(EnvironmentConstants.JWT_REFRESH_SECRET),
        expiresIn: this.configService.get(
          EnvironmentConstants.JWT_REFRESH_EXPIRES_IN,
        ),
      },
    );
    const expirationTime = new Date();
    const tokenExpirationTimeInSecodns = +this.configService.get(
      EnvironmentConstants.JWT_REFRESH_EXPIRES_IN,
    );
    expirationTime.setSeconds(
      expirationTime.getSeconds() + tokenExpirationTimeInSecodns,
    );

    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);
    await this.refreshTokenModel.updateOne(
      { user: user._id },
      {
        expirationTime,
        refreshToken: refreshTokenHash,
      },
      { upsert: true },
    );

    return refresh_token;
  }
  async getAccessToken(user: UserDocument) {
    const token = this.jwtService.sign({ email: user.email });
    return token;
  }

  async isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
    const currentTime = new Date();
    const tokenFromDB = await this.refreshTokenModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!tokenFromDB) {
      return false;
    }
    const isTokenMatch = await bcrypt.compare(token, tokenFromDB.refreshToken);
    if (!isTokenMatch) {
      return false;
    }
    return new Date(tokenFromDB.expirationTime) > currentTime;
  }
}
