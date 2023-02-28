import { APP_PIPE } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
  MiddlewareConsumer,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/users/dtos/create-user.dto';
import { setupApp } from '../src/setup-app';

describe('Authentication system version 2 (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({
            whitelist: true,
          }),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    setupApp(app);

    await app.init();
  });

  it('/auth/signup (POST)', () => {
    const time = new Date().getTime();

    const route = '/auth/signup';
    const body = new CreateUserDto();
    body.email = `test${time}@test.com`;
    body.password = time.toString();

    return request(app.getHttpServer())
      .post(route)
      .send(body)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toBeDefined();
        expect(email).toEqual(body.email);
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const time = new Date().getTime();

    let route = '/auth/signup';
    const user = new CreateUserDto();
    user.email = `test${time}@test.com`;
    user.password = time.toString();

    const res = await request(app.getHttpServer())
      .post(route)
      .send(user)
      .expect(HttpStatus.CREATED);

    const cookie = res.get('Set-Cookie');

    route = '/auth/whoami';
    const { body } = await request(app.getHttpServer())
      .get(route)
      .set('Cookie', cookie)
      .expect(HttpStatus.OK);

    expect(body.email).toEqual(user.email);
  });
});
