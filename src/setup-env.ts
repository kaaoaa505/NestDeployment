import { ConfigModule } from '@nestjs/config';

export const setupENV = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: `.env.${process.env.NODE_ENV}`,
});
