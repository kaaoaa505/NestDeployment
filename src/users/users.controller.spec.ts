import { BadRequestException } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeAuthService: Partial<AuthService>;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeAuthService = {
      signup: (email: string, password: string) => {
        return Promise.resolve({
          id: new Date().getTime(),
          email,
          password,
        } as User);
      },
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: new Date().getTime(),
          email,
          password,
        } as User);
      },
    };

    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: '', password: '' } as User);
      },
      findByEmail: (email: string) => {
        return Promise.resolve([
          { id: new Date().getTime(), email, password: '' } as User,
        ] as User[]);
      },
      findAll: () => {
        return Promise.resolve([] as User[]);
      },
      remove: () => {
        return Promise.resolve({} as User);
      },
      update: (id: number, attrs: Partial<User>) => {
        return Promise.resolve({} as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthGuard],
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUser returns a list of users', async () => {
    const user = controller.findAllUser();
    expect(user).toBeDefined();
  });

  it('findUserByEmail returns a list of users with the given email', async () => {
    const email = 'test@test.com';

    const users = await controller.findUserByEmail(email);
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual(email);
  });

  it('findUser returns a single user by id', async () => {
    const email = 'test@test.com';

    const users = await controller.findUserByEmail(email);
    const user = await controller.findUser(users[0].id.toString());
    expect(users.length).toEqual(1);
    expect(user.id).toEqual(users[0].id);
  });

  it('findUser throws an error if user with a given id is not found', async () => {
    fakeUsersService.findOne = () => null;

    try {
      const user = await controller.findUser('1');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('message', 'User not found.');
    }
  });

  it('signin update session object and returns user', async () => {
    const session = {};
    const body = new CreateUserDto();
    body.email = 'test@test.com';
    body.password = '123456';
    const user = await controller.signUserIn(body, session);
    const newSession = { userId: user.id };
    expect(session).toEqual(newSession);
  });
});
