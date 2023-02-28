import { ValidationPipe } from '@nestjs/common';

const cookieSession = require('cookie-session');

export const setupApp = (app: any) => {
  app.use(
    cookieSession({
      // encrypt cookie data using this keys
      keys: ['wategufropruslojuste'],
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
};
