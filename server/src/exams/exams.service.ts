import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { RequestUser } from '../auth/current-user.decorator';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExamDto, user: RequestUser) {
    const difficultyMap: Record<string, 'EASY' | 'MEDIUM' | 'HARD'> = {
      Easy: 'EASY',
      Medium: 'MEDIUM',
      Hard: 'HARD',
    };

    return this.prisma.exam.create({
      data: {
        title: dto.title,
        subjectId: dto.subjectId,
        topicId: dto.topicId,
        difficulty: difficultyMap[dto.difficulty],
        grade: dto.grade,
        price: dto.price,
        durationMinutes: dto.durationMinutes,
        createdBy: user.userId,
        questions: {
          create: dto.questions.map((question) => ({
            text: question.text,
            options: question.options,
            correctIndex: question.correctIndex,
            explanation: question.explanation,
          })),
        },
      },
    });
  }

  async findAllPublished() {
    return this.prisma.exam.findMany({
      where: { isPublished: true },
      include: {
        subject: true,
        creator: true,
      },
    });
  }

  async findOne(id: string, user: RequestUser) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (!exam.isPublished && exam.createdBy !== user.userId) {
      throw new ForbiddenException('Not allowed to view this exam');
    }

    return exam;
  }
}
