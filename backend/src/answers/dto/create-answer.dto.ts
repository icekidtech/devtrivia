import { IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  text: string;

  @IsString()
  questionId: string;
}