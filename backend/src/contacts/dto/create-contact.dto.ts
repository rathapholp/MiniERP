import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { ContactType } from '@prisma/client';

export class CreateContactDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsEnum(ContactType)
  type: ContactType;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
