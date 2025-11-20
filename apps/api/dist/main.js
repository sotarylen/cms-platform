"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_js_1 = require("./app.module.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule, {
        bufferLogs: true,
    });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Headless CMS')
        .setDescription('Enterprise Headless CMS API')
        .setVersion('0.1.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`🚀 API server is running at http://localhost:${port}/${globalPrefix}`);
    logger.log(`📚 Swagger UI ready at http://localhost:${port}/${globalPrefix}/docs`);
}
bootstrap();
