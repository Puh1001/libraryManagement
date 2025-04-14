import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schemas';
import { AuthenticationService } from './authentication.service';
import { CookieService } from './cookie.service';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import JwtRefreshAuthenticationGuard from './guards/jwt-refresh.guard';
import JwtAuthenticationGuard from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { TokenService } from './token.service';

@Controller('api/v1/authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('register')
  register(@Body() payload: RegisterDto) {
    return this.authenticationService.register(payload);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: Request & { res: Response },
    @CurrentUser() user: UserDocument,
  ) {
    const token = await this.tokenService.getAccessToken(
      req.user as UserDocument,
    );
    const refreshToken = await this.tokenService.getRefreshToken(
      req.user as UserDocument,
    );
    req.res.setHeader('Set-Cookie', [
      this.cookieService.getCookieWithJwtToken(token),
      this.cookieService.getCookieWithJwtRefreshToken(refreshToken),
    ]);
    return { user, token };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req: Request & { res: Response },
    @Body() payload: ChangePasswordDTO,
    @CurrentUser() user: UserDocument,
  ) {
    const result = await this.authenticationService.changePassword(
      user,
      payload,
    );
    req.res.setHeader('Set-Cookie', this.cookieService.getCookieForLogOut());
    return result;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  me(@CurrentUser() user: UserDocument) {
    return user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('logout')
  async logout(@Req() req: Request & { res: Response }) {
    const result = await this.authenticationService.logout();
    req.res.setHeader('Set-Cookie', this.cookieService.getCookieForLogOut());
    return result;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete('delete-account')
  async deleteAccount(
    @Req() req: Request & { res: Response },
    @CurrentUser() user: UserDocument,
  ) {
    const result = await this.authenticationService.deleteAccount(user);
    req.res.setHeader('Set-Cookie', this.cookieService.getCookieForLogOut());
    return result;
  }

  @UseGuards(JwtRefreshAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  async refresh(@Req() req: Request & { res: Response }) {
    const access_token = await this.tokenService.getAccessToken(
      req.user as UserDocument,
    );
    const accessTokenCookie =
      this.cookieService.getCookieWithJwtToken(access_token);
    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return { access_token };
  }
}
