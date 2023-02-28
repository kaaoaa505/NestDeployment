import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from './../src/users/dtos/create-user.dto';
import { setupApp } from './../src/setup-app';

describe('Authentication system (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
      })
      .catch((error) => console.log('error is: ', error));
  });
});
