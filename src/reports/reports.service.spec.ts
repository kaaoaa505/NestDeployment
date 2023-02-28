import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { setupDB } from '../setup-db';
import { setupENV } from '../setup-env';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let repo: Repository<Report> = new Repository<Report>();
  let service: ReportsService = new ReportsService(repo);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [setupENV, setupDB, TypeOrmModule.forFeature([Report])],
      providers: [ReportsService],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
