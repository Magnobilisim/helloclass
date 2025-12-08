import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  async listPublished() {
    return this.examsService.findAllPublished();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateExamDto, @CurrentUser() user: RequestUser) {
    return this.examsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.examsService.findOne(id, user);
  }
}
