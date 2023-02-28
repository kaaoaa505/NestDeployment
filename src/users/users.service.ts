import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(email: string, password: string): Promise<User> {
    const user = this.repo.create({ email, password });

    return await this.repo.save(user);
  }

  async findOne(id: number): Promise<User> {
    if (!id) return null;

    return await this.repo.findOne(id);
  }

  async findByEmail(email: string): Promise<User[]> {
    return await this.repo.find({ email });
  }

  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    let user = await this.findOne(id);

    Object.assign(user, attrs);

    return await this.repo.save(user);
  }

  async remove(id: number): Promise<User> {
    let user = await this.findOne(id);

    return await this.repo.remove(user);
  }
}
