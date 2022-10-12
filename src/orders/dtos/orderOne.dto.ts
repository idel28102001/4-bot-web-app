import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class orderOne {
  @ApiProperty()
  @IsNotEmpty()
  offerId: string;

  @IsNotEmpty()
  @ApiProperty()
  count: number;
}
