import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactType } from '@prisma/client';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: ContactType, search?: string) {
    return this.prisma.contact.findMany({
      where: {
        ...(type && { type }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { taxId: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contact #${id} not found`);
    return contact;
  }

  async create(dto: CreateContactDto) {
    const existing = await this.prisma.contact.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Code ${dto.code} already exists`);
    return this.prisma.contact.create({ data: dto });
  }

  async update(id: number, dto: UpdateContactDto) {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.contact.delete({ where: { id } });
  }
}
