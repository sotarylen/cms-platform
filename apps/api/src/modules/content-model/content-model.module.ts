import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModelEntity } from './content-model.entity.js';
import { ContentModelResolver } from './content-model.resolver.js';
import { ContentModelService } from './content-model.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ContentModelEntity])],
  providers: [ContentModelResolver, ContentModelService],
  exports: [ContentModelService],
})
export class ContentModelModule {}
