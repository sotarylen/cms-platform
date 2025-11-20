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
exports.ContentModelEntity = void 0;
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("typeorm");
const tenant_entity_js_1 = require("../tenant/tenant.entity.js");
const content_entry_entity_js_1 = require("../content-entry/content-entry.entity.js");
const content_field_type_js_1 = require("./content-field.type.js");
let ContentModelEntity = class ContentModelEntity {
    id;
    tenantId;
    apiName;
    displayName;
    description;
    fields;
    locales;
    uniqueFields;
    singleton;
    createdAt;
    updatedAt;
    tenant;
    entries;
};
exports.ContentModelEntity = ContentModelEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ContentModelEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContentModelEntity.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], ContentModelEntity.prototype, "apiName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContentModelEntity.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ContentModelEntity.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [content_field_type_js_1.ContentFieldDefinition]),
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], ContentModelEntity.prototype, "fields", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], ContentModelEntity.prototype, "locales", void 0);
__decorate([
    (0, graphql_1.Field)(() => [content_field_type_js_1.ContentFieldType]),
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], ContentModelEntity.prototype, "uniqueFields", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ContentModelEntity.prototype, "singleton", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ContentModelEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ContentModelEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_js_1.TenantEntity, (tenant) => tenant.models, { onDelete: 'CASCADE' }),
    __metadata("design:type", tenant_entity_js_1.TenantEntity)
], ContentModelEntity.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => content_entry_entity_js_1.ContentEntryEntity, (entry) => entry.model),
    __metadata("design:type", Array)
], ContentModelEntity.prototype, "entries", void 0);
exports.ContentModelEntity = ContentModelEntity = __decorate([
    (0, graphql_1.ObjectType)('ContentModel'),
    (0, typeorm_1.Entity)({ name: 'content_models' })
], ContentModelEntity);
