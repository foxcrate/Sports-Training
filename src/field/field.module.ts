import { Module } from '@nestjs/common';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';
import { FieldSQLService } from './field-sql.service';

@Module({
  controllers: [FieldController],
  providers: [FieldService, FieldSQLService],
})
export class FieldModule {}
