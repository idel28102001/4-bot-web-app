import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { orderOne } from './orderOne.dto';

export class OrderDto {
  @ApiProperty()
  @IsNotEmpty()
  orders: orderOne[];

  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
