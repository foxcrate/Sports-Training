import { Module } from '@nestjs/common';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';
import { FieldRepository } from './field.repository';
import { AdminFieldController } from './admin-field.controller';
import { AdminFieldService } from './admin-field.service';

@Module({
  controllers: [FieldController, AdminFieldController],
  providers: [AdminFieldService, FieldService, FieldRepository],
  exports: [FieldRepository],
})
export class FieldModule {}
