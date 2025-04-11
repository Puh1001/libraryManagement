import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get(EnvironmentConstants.DATABASE_URL),
      }),
    }),
  ],
})
export class DatabaseModule implements OnApplicationBootstrap {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onApplicationBootstrap() {
    const readyState = this.connection.readyState;

    switch (readyState) {
      case 0:
        console.log('MongoDB is disconnected');
        break;
      case 1:
        console.log('MongoDB connection established successfully');
        break;
      case 2:
        console.log('MongoDB is connecting...');
        break;
      case 3:
        console.log('MongoDB is disconnecting...');
        break;
      default:
        console.log('Unknown MongoDB connection state:', readyState);
    }

    this.connection.on('connected', () => {
      console.log(
        'MongoDB connection established successfully (event: connected)',
      );
    });

    this.connection.on('error', (error) => {
      console.error('MongoDB connection error (event: error):', error);
    });

    this.connection.on('disconnected', () => {
      console.log('MongoDB connection disconnected (event: disconnected)');
    });
  }
}
