import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@/common/entities/users.entity';
import { genNanoid } from '@/common/utils';
import { GitService } from '@/git/git.service';

import { NewUserInput } from './dtos/new-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly gitService: GitService
  ) {}

  listUsers() {
    return this.usersRepository.find({
      order: {
        createAt: 'DESC',
      },
    });
  }

  getUserById(id: string) {
    return this.usersRepository.findOneBy({
      id,
    });
  }

  getLoginUser(name: string) {
    return this.usersRepository.findOneBy({
      name,
    });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async createUser(body: NewUserInput) {
    const { name, email, role } = body;
    const user = {
      id: genNanoid('user'),
      name,
      email,
      role,
    };
    await this.usersRepository.insert(user);
    await this.gitService.commitNt('main', {
      tables: [User.tableName],
      message: `Create user ${name}(${user.id}).`,
    });
    return this.usersRepository.findOneBy({ id: user.id });
  }
}
