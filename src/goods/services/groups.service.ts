import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GroupsEntity } from '../entities/groups.entity';
import { UtilsService } from './utils.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupsEntity)
    private readonly groupsRepo: Repository<GroupsEntity>,
    private readonly utils: UtilsService,
  ) {}

  async getById(_id: string) {
    return await this.groupsRepo.findOne(_id);
  }

  async getByOldId(id: string) {
    return await this.groupsRepo.findOne({ where: { id } });
  }

  async saveGroups(array) {
    const prevs = await this.groupsRepo.find({
      where: { id: In(array) },
    });
    return await this.groupsRepo.save(
      array
        .filter((e) => !prevs.map((e) => e.id).includes(e))
        .map((e) => {
          return { id: e };
        }),
    );
  }

  async save(data) {
    return await this.groupsRepo.save(data);
  }
}
