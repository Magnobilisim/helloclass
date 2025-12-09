import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(subjectId?: string) {
    return this.prisma.topic.findMany({
      where: subjectId ? { subjectId } : undefined,
      orderBy: [{ subjectId: 'asc' }, { name: 'asc' }],
      include: { subject: true },
    });
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: { subject: true },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  create(dto: CreateTopicDto) {
    return this.prisma.topic.create({
      data: {
        subjectId: dto.subjectId,
        name: dto.name,
        grade: dto.grade,
        level: dto.level,
        curriculumYear: dto.curriculumYear,
        metadata: dto.metadata,
      },
    });
  }

  async update(id: string, dto: UpdateTopicDto) {
    await this.ensureExists(id);

    return this.prisma.topic.update({
      where: { id },
      data: {
        subjectId: dto.subjectId,
        name: dto.name,
        grade: dto.grade,
        level: dto.level,
        curriculumYear: dto.curriculumYear,
        metadata: dto.metadata,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.topic.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.topic.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Topic not found');
    }
  }
}
