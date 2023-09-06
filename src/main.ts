import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(8000);

  process.on('beforeExit', async () => {
    await prismaService.$disconnect(); // Disconnect from the database or perform cleanup
    await app.close(); // Close the NestJS application
  });
}
bootstrap();
