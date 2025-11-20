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
exports.ContentFieldDefinition = exports.ContentFieldType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
var ContentFieldType;
(function (ContentFieldType) {
    ContentFieldType["TEXT"] = "TEXT";
    ContentFieldType["RICH_TEXT"] = "RICH_TEXT";
    ContentFieldType["NUMBER"] = "NUMBER";
    ContentFieldType["BOOLEAN"] = "BOOLEAN";
    ContentFieldType["DATE"] = "DATE";
    ContentFieldType["MEDIA"] = "MEDIA";
    ContentFieldType["RELATION"] = "RELATION";
    ContentFieldType["JSON"] = "JSON";
})(ContentFieldType || (exports.ContentFieldType = ContentFieldType = {}));
(0, graphql_2.registerEnumType)(ContentFieldType, { name: 'ContentFieldType' });
let ContentFieldDefinition = class ContentFieldDefinition {
    key;
    name;
    type;
    required;
    helpText;
    defaultValue;
};
exports.ContentFieldDefinition = ContentFieldDefinition;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentFieldDefinition.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentFieldDefinition.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => ContentFieldType),
    __metadata("design:type", String)
], ContentFieldDefinition.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ContentFieldDefinition.prototype, "required", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ContentFieldDefinition.prototype, "helpText", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ContentFieldDefinition.prototype, "defaultValue", void 0);
exports.ContentFieldDefinition = ContentFieldDefinition = __decorate([
    (0, graphql_1.ObjectType)('ContentField')
], ContentFieldDefinition);
