import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import admin from 'firebase-admin';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const serviceAccount = process.env.FIREBASE_AUTH_FILE;

  const firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(
      join(process.cwd(), serviceAccount) as admin.ServiceAccount,
    ),
  });

  console.log(firebaseAdminApp);
  await app.listen(8000);

  process.on('beforeExit', async () => {
    await prismaService.$disconnect();
    await app.close();
  });
}
bootstrap();
