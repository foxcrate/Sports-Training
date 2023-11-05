import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as admin from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  var serviceAccount = require('/home/fawzy/Desktop/Projects/Nest/instaplay_backend/darabny-63c36-firebase-adminsdk-svdxh-d0aafcfa2d.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  await app.listen(8000);

  process.on('beforeExit', async () => {
    await prismaService.$disconnect();
    await app.close();
  });
}
bootstrap();
