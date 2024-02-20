import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientInitializationError,
)
export class PrismaErrorsFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientValidationError
      | any,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const req = ctx.getRequest();
    // let errorMessage = exception.message;

    console.log('--- PrismaError ---');
    console.log(exception);
    console.log('--- PrismaError ---');

    response.status(500).json({
      success: false,
      statusCode: 500,
      data: null,
      authData: {
        userId: req.userId,
        role: req.authType,
        playerProfileId: req.playerProfileId,
        trainerProfileId: req.trainerProfileId,
        childrenNumber: req.childrenNumber,
      },
      error: {
        type: 'Database Error',
        message: 'Internal server error',
      },
    });
  }
}
