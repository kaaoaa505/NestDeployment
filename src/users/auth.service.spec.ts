import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let serviceV2: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let fakeUsersServiceV2: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service

    fakeUsersService = {
      findByEmail: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const users: User[] = [];

    fakeUsersServiceV2 = {
      findByEmail: (email: string) => {
        const filteredUsers = users.filter((user) => email === user.email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = new User();
        user.id = Math.round(new Date().getTime());
        user.email = email;
        user.password = password;

        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    const moduleV2 = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersServiceV2,
        },
      ],
    }).compile();

    service = module.get(AuthService);

    serviceV2 = moduleV2.get(AuthService);
  });

  it('can create instance of auth servcie', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const email = 'test@test.com';
    const password = 'test123';

    const user = await service.signup(email, password);

    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
    expect(user.password).toContain('.');

    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that already exist', async () => {
    const email = 'test@test.com';
    const password = 'test123';

    fakeUsersService.findByEmail = () =>
      Promise.resolve([{ id: 1, email, password } as User]);

    try {
      await service.signup(email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('message', 'Email already exist.');
    }
  });

  it('throws if signin is called with email that not exist', async () => {
    const email = 'test@test.com';
    const password = 'test123';

    try {
      await service.signin(email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('message', 'User not found.');
    }
  });

  it('throws if invalid password is provided', async () => {
    const email = 'test@test.com';
    const password = 'test123';

    fakeUsersService.findByEmail = () =>
      Promise.resolve([{ id: 1, email, password } as User]);

    try {
      await service.signin(email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('message', 'Invalid password.');
    }
  });

  it('return a user if correct password is provided', async () => {
    const email = 'test@test.com';
    const password = 'test';

    const passwordHashed =
      'ef1a2f0c649bc55e.aee1141f5910e2ff5432171af7e2750a8cd02afbf1b05fd9fac9cc6b5284fe2e';

    fakeUsersService.findByEmail = () =>
      Promise.resolve([{ id: 1, email, password: passwordHashed } as User]);

    const user = await service.signin(email, password);
    expect(user).toBeDefined();
  });

  it('return a user if correct password is provided v2', async () => {
    const email = 'test@test.com';
    const password = 'test';

    await serviceV2.signup(email, password);

    const user = await serviceV2.signin(email, password);
    expect(user).toBeDefined();
  });

  it('throw an error if user signs up with email that is in use', async () => {
    const email = 'test@test.com';
    const password = 'test';

    await serviceV2.signup(email, password);

    try {
      await serviceV2.signup(email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('message', 'Email already exist.');
    }
  });

  it('throw if an invalid password is provided', async () => {
    const email = 'test@test.com';
    const password = 'test';
    const wrongPassword = 'tst';

    await serviceV2.signup(email, password);

    try {
      await serviceV2.signin(email, wrongPassword);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('message', 'Invalid password.');
    }
  });
});
