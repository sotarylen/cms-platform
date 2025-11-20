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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantEntity = void 0;
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("typeorm");
const content_model_entity_js_1 = require("../content-model/content-model.entity.js");
const content_entry_entity_js_1 = require("../content-entry/content-entry.entity.js");
let TenantEntity = class TenantEntity {
    id;
    slug;
    name;
    isActive;
    metadata;
    createdAt;
    updatedAt;
    models;
    entries;
};
exports.TenantEntity = TenantEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TenantEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], TenantEntity.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], TenantEntity.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ description: '是否启用' }),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], TenantEntity.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TenantEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TenantEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => content_model_entity_js_1.ContentModelEntity, (model) => model.tenant),
    __metadata("design:type", Array)
], TenantEntity.prototype, "models", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => content_entry_entity_js_1.ContentEntryEntity, (entry) => entry.tenant),
    __metadata("design:type", Array)
], TenantEntity.prototype, "entries", void 0);
exports.TenantEntity = TenantEntity = __decorate([
    (0, graphql_1.ObjectType)('Tenant'),
    (0, typeorm_1.Entity)({ name: 'tenants' })
], TenantEntity);
