import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeTopics = false) {
    return this.prisma.subject.findMany({
      include: includeTopics ? { topics: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, includeTopics = false) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: includeTopics ? { topics: true } : undefined,
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async create(dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        code: dto.code,
        name: dto.name,
        academicYear: dto.academicYear,
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdateSubjectDto) {
    await this.ensureExists(id);

    return this.prisma.subject.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        academicYear: dto.academicYear,
        description: dto.description,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.subject.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.subject.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Subject not found');
    }
  }
}
