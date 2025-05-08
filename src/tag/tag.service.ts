import { Injectable } from '@nestjs/common';
import { TagRepository } from './tag.repository';
import { MAX_TAG_COUNT } from './constants/tag.constant';

@Injectable()
export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  async getTags(accountId: number) {
    return await this.tagRepository.getTags({
      where: { accountId, deletedAt: null },
    });
  }

  async createTag(accountId: number, data: { name: string; color?: string }) {
    const tagCount = await this.tagRepository.getTagCount({
      where: { accountId, deletedAt: null },
    });

    if (tagCount > MAX_TAG_COUNT) throw new Error('max tag count error');

    await this.tagRepository.createTag({
      data: {
        accountId,
        name: data.name,
        color: data.color,
      },
    });

    return true;
  }

  async deleteTag(accountId: number, tagId: number) {
    const tag = await this.tagRepository.getTag({
      where: { id: tagId, accountId, deletedAt: null },
    });

    if (!tag) throw new Error('tag not found');

    await this.tagRepository.updateTag({
      where: { id: tagId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
