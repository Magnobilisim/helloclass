import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsInt()
  correctIndex: number;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsOptional()
  @IsString()
  topicId?: string;

  @IsEnum(['Easy', 'Medium', 'Hard'], {
    message: 'difficulty must be Easy | Medium | Hard',
  })
  difficulty: 'Easy' | 'Medium' | 'Hard';

  @IsOptional()
  @IsInt()
  grade?: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(5)
  durationMinutes: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
