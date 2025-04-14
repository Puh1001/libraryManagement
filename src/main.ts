import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvironmentConstants } from './common/constants/environment.constants';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription('API documentation for the Library Management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get(EnvironmentConstants.PORT) || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
