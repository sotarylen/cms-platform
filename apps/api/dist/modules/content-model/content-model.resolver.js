"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModelResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const content_model_entity_js_1 = require("./content-model.entity.js");
const content_model_service_js_1 = require("./content-model.service.js");
const create_content_model_input_js_1 = require("./dto/create-content-model.input.js");
const update_content_model_input_js_1 = require("./dto/update-content-model.input.js");
let ContentModelResolver = class ContentModelResolver {
    service;
    constructor(service) {
        this.service = service;
    }
    contentModels(tenantId) {
        return this.service.findAll(tenantId);
    }
    contentModel(idOrApiName) {
        return this.service.findOne(idOrApiName);
    }
    createContentModel(input) {
        return this.service.create(input);
    }
    updateContentModel(input) {
        return this.service.update(input);
    }
};
exports.ContentModelResolver = ContentModelResolver;
__decorate([
    (0, graphql_1.Query)(() => [content_model_entity_js_1.ContentModelEntity]),
    __param(0, (0, graphql_1.Args)('tenantId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentModelResolver.prototype, "contentModels", null);
__decorate([
    (0, graphql_1.Query)(() => content_model_entity_js_1.ContentModelEntity),
    __param(0, (0, graphql_1.Args)('idOrApiName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentModelResolver.prototype, "contentModel", null);
__decorate([
    (0, graphql_1.Mutation)(() => content_model_entity_js_1.ContentModelEntity),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_content_model_input_js_1.CreateContentModelInput]),
    __metadata("design:returntype", void 0)
], ContentModelResolver.prototype, "createContentModel", null);
__decorate([
    (0, graphql_1.Mutation)(() => content_model_entity_js_1.ContentModelEntity),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_content_model_input_js_1.UpdateContentModelInput]),
    __metadata("design:returntype", void 0)
], ContentModelResolver.prototype, "updateContentModel", null);
exports.ContentModelResolver = ContentModelResolver = __decorate([
    (0, graphql_1.Resolver)(() => content_model_entity_js_1.ContentModelEntity),
    __metadata("design:paramtypes", [content_model_service_js_1.ContentModelService])
], ContentModelResolver);
