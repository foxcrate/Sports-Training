import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import admin from 'firebase-admin';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Instaplay API')
    .addBearerAuth()
    .setDescription(
      `
      success response object -> {
        success: true,
        statusCode: number,
        data: any,
        userRoles: string[],
        error: null
      }

      error response object -> {
        success: false,
        statusCode: number,
        data: null,
        userRoles: null,
        error: {
          type: string
          message: string
          }
      }

      - data objects are defined below
      `,
    )
    .setVersion('1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      plugins: [
        (...args: any[]) => (window as any).HierarchicalTagsPlugin(...args),
        // This is added by nestjs by default and would be overridden if not included
        (...args: any[]) => (window as any).SwaggerUIBundle.plugins.DownloadUrl(...args),
      ],
      hierarchicalTagSeparator: ':', // This must be a string, as RegExp will not survive being json encoded
    },
    customJs: ['https://unpkg.com/swagger-ui-plugin-hierarchical-tags'],
  });
  //

  var serviceAccount = process.env.FIREBASE_AUTH_FILE;

  const firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(
      join(process.cwd(), serviceAccount) as admin.ServiceAccount,
    ),
  });

  // console.log(firebaseAdminApp);
  await app.listen(8000);

  process.on('beforeExit', async () => {
    await prismaService.$disconnect();
    await app.close();
  });
}
bootstrap();
