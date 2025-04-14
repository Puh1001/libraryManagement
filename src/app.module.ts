import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './features/users/users.module';
import { DatabaseModule } from './features/db/db.module';
import * as joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './features/books/books.module';
import { AuthenticationModule } from './features/authentication/authentication.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DATABASE_URL: joi.string().required(),
        PORT: joi.string().required(),
        REDIS_HOST: joi.string().required(),
        DUPLICATE_ERROR_KEY: joi.string().required(),
        USER_TOKEN_CACHE_KEY: joi.string().required(),
        REDIS_PORT: joi.number().required(),
        /* token */
        JWT_ACCESS_SECRET: joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: joi.number().required(),
        JWT_REFRESH_SECRET: joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: joi.number().required(),
        /* cookies */
        COOKIE_JWT_ACCESS_KEY: joi.string().required(),
        COOKIE_REFRESH_JWT_KEY: joi.string().required(),
      }),
    }),
    UsersModule,
    DatabaseModule,
    BooksModule,
    AuthenticationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
