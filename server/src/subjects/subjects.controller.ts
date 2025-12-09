import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll(@Query('includeTopics') includeTopics?: string) {
    return this.subjectsService.findAll(this.toBoolean(includeTopics));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('includeTopics') includeTopics?: string) {
    return this.subjectsService.findOne(id, this.toBoolean(includeTopics));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }

  private toBoolean(value?: string) {
    return value === 'true' || value === '1';
  }
}
