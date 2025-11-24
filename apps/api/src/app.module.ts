import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration.js';
import { validationSchema } from './config/validation.js';
import { graphqlDriverConfig } from './config/graphql.config.js';
import { typeormConfig } from './config/typeorm.config.js';
import { HealthModule } from './modules/health/health.module.js';
import { TenantModule } from './modules/tenant/tenant.module.js';
import { ContentModelModule } from './modules/content-model/content-model.module.js';
import { ContentEntryModule } from './modules/content-entry/content-entry.module.js';
import { WorkflowModule } from './modules/workflow/workflow.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { N8nIntegrationModule } from './modules/n8n-integration/n8n-integration.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env', '.env.local'],
    }),
    GraphQLModule.forRootAsync({
      useFactory: graphqlDriverConfig,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeormConfig,
    }),
    TerminusModule,
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
    HealthModule,
    AuthModule,
    TenantModule,
    ContentModelModule,
    ContentEntryModule,
    WorkflowModule,
    UserModule,
    N8nIntegrationModule,
  ],
})
export class AppModule {}
