import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './reports/report.entity';
import { User } from './users/user.entity';

export const setupDB = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return {
      type: 'sqlite',
      database: config.get<string>('DB_NAME'),
      entities: [User, Report],
      synchronize: true,
    };
  },
});
