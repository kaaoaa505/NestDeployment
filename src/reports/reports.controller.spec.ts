import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from '../users/auth.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { Report } from './report.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let fakeAuthService: Partial<AuthService>;
  let fakeReportsService: Partial<ReportsService>;

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

    fakeReportsService = {
      create: (body: CreateReportDto) => {
        return Promise.resolve({} as Report);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthGuard],
      controllers: [ReportsController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: ReportsService,
          useValue: fakeReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
