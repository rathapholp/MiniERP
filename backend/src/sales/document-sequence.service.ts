import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentSequenceService {
  constructor(private prisma: PrismaService) {}

  async nextNumber(prefix: string, year?: number): Promise<string> {
    const y = year ?? new Date().getFullYear();
    const seq = await this.prisma.$transaction(async (tx) => {
      const record = await tx.documentSequence.upsert({
        where: { prefix_year: { prefix, year: y } },
        update: { lastSeq: { increment: 1 } },
        create: { prefix, year: y, lastSeq: 1 },
      });
      return record.lastSeq;
    });
    return `${prefix}-${y}-${String(seq).padStart(4, '0')}`;
  }
}
