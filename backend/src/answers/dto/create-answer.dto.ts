import { IsString, IsBoolean } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  text: string;

  @IsString()
  questionId: string;

  @IsBoolean()
  isCorrect: boolean;
}