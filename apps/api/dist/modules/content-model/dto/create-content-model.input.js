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
exports.CreateContentModelInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const content_field_type_js_1 = require("../content-field.type.js");
let CreateContentModelInput = class CreateContentModelInput {
    tenantId;
    apiName;
    displayName;
    description;
    locales;
    fields;
    singleton;
};
exports.CreateContentModelInput = CreateContentModelInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentModelInput.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z][A-Za-z0-9_]+$/),
    __metadata("design:type", String)
], CreateContentModelInput.prototype, "apiName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentModelInput.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContentModelInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: 'itemsAndList' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateContentModelInput.prototype, "locales", void 0);
__decorate([
    (0, graphql_1.Field)(() => [content_field_type_js_1.ContentFieldDefinition]),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateContentModelInput.prototype, "fields", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateContentModelInput.prototype, "singleton", void 0);
exports.CreateContentModelInput = CreateContentModelInput = __decorate([
    (0, graphql_1.InputType)()
], CreateContentModelInput);
