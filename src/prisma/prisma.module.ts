import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useValue: PrismaService.getInstance(),
    },
  ],
  exports: [
    {
      provide: PrismaService,
      useValue: PrismaService.getInstance(),
    },
  ],
})
export class PrismaModule {}
