import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Report } from './reports/report.entity';
import { ReportsModule } from './reports/reports.module';
import { setupDB } from './setup-db';
import { setupENV } from './setup-env';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

var cookieSession = require('cookie-session');

@Module({
  imports: [setupENV, setupDB, UsersModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      cookieSession({
        // encrypt cookie data using this keys
        keys: [this.configService.get('COOKIE_KEY')],
      }),
    );
  }
}
