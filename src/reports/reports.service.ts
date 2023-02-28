import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { Report } from './report.entity';
import { User } from '../users/user.entity';
import { GetReportDto } from './dtos/get-report.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  createEstimate({ make, model, lng, lat, year, mileage }: GetReportDto) {
    return (
      this.repo
        .createQueryBuilder()
        // .select('*')
        .select('AVG(price)', 'price')
        .where('make = :make', { make })
        .andWhere('model = :model', { model })
        .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
        .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
        .andWhere('year - :year BETWEEN -3 AND 3', { year })
        .andWhere('approved IS TRUE')
        .orderBy('ABS(mileage - :mileage)', 'DESC')
        .setParameters({ mileage })
        .limit(3)
        // .getRawMany()
        .getRawOne()
    );
  }

  async create(body: CreateReportDto, user: User) {
    const report = this.repo.create(body);
    report.user = user;
    return await this.repo.save(report);
  }

  async changeApproval(id: string, approved: boolean, user: User) {
    const report = await this.repo.findOne(id);

    if (!report) throw new NotFoundException('report not found');

    report.approved = approved;
    report.approvedBy = user.id;
    return await this.repo.save(report);
  }
}
