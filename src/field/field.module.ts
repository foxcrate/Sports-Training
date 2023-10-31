import { Module } from '@nestjs/common';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';
import { FieldModel } from './field.model';
import { AdminFieldController } from './admin-field.controller';
import { AdminFieldService } from './admin-field.service';

@Module({
  controllers: [FieldController, AdminFieldController],
  providers: [AdminFieldService, FieldService, FieldModel],
  exports: [FieldModel],
})
export class FieldModule {}
