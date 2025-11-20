"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const graphql_1 = require("@nestjs/graphql");
const terminus_1 = require("@nestjs/terminus");
const throttler_1 = require("@nestjs/throttler");
const typeorm_1 = require("@nestjs/typeorm");
const configuration_js_1 = __importDefault(require("./config/configuration.js"));
const validation_js_1 = require("./config/validation.js");
const graphql_config_js_1 = require("./config/graphql.config.js");
const typeorm_config_js_1 = require("./config/typeorm.config.js");
const health_module_js_1 = require("./modules/health/health.module.js");
const tenant_module_js_1 = require("./modules/tenant/tenant.module.js");
const content_model_module_js_1 = require("./modules/content-model/content-model.module.js");
const content_entry_module_js_1 = require("./modules/content-entry/content-entry.module.js");
const workflow_module_js_1 = require("./modules/workflow/workflow.module.js");
const auth_module_js_1 = require("./modules/auth/auth.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_js_1.default],
                validationSchema: validation_js_1.validationSchema,
                envFilePath: ['.env', '.env.local'],
            }),
            graphql_1.GraphQLModule.forRootAsync({
                useFactory: graphql_config_js_1.graphqlDriverConfig,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: typeorm_config_js_1.typeormConfig,
            }),
            terminus_1.TerminusModule,
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
            health_module_js_1.HealthModule,
            auth_module_js_1.AuthModule,
            tenant_module_js_1.TenantModule,
            content_model_module_js_1.ContentModelModule,
            content_entry_module_js_1.ContentEntryModule,
            workflow_module_js_1.WorkflowModule,
        ],
    })
], AppModule);
