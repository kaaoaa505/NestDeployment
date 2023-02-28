import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { setupDB } from '../setup-db';
import { setupENV } from '../setup-env';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let repo: Repository<User> = new Repository<User>();
  let service: UsersService = new UsersService(repo);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [setupENV, setupDB, TypeOrmModule.forFeature([User])],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
