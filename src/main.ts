import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as admin from 'firebase-admin';
import serviceAccount = require('../darabny-63c36-firebase-adminsdk-svdxh-d0aafcfa2d.json');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  //NOTE: i had this fixed before please don't revert the fix again.
  // var serviceAccount = require(process.env.FIREBASE_AUTH_FILE);

  const firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  console.log(firebaseAdminApp);
  await app.listen(8000);

  process.on('beforeExit', async () => {
    await prismaService.$disconnect();
    await app.close();
  });
}
bootstrap();
