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
exports.TenantResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const create_tenant_input_js_1 = require("./dto/create-tenant.input.js");
const update_tenant_input_js_1 = require("./dto/update-tenant.input.js");
const tenant_entity_js_1 = require("./tenant.entity.js");
const tenant_service_js_1 = require("./tenant.service.js");
let TenantResolver = class TenantResolver {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    tenants() {
        return this.tenantService.findAll();
    }
    tenant(idOrSlug) {
        return this.tenantService.findOne(idOrSlug);
    }
    createTenant(input) {
        return this.tenantService.create(input);
    }
    updateTenant(input) {
        return this.tenantService.update(input);
    }
};
exports.TenantResolver = TenantResolver;
__decorate([
    (0, graphql_1.Query)(() => [tenant_entity_js_1.TenantEntity]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantResolver.prototype, "tenants", null);
__decorate([
    (0, graphql_1.Query)(() => tenant_entity_js_1.TenantEntity),
    __param(0, (0, graphql_1.Args)('idOrSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantResolver.prototype, "tenant", null);
__decorate([
    (0, graphql_1.Mutation)(() => tenant_entity_js_1.TenantEntity),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_input_js_1.CreateTenantInput]),
    __metadata("design:returntype", void 0)
], TenantResolver.prototype, "createTenant", null);
__decorate([
    (0, graphql_1.Mutation)(() => tenant_entity_js_1.TenantEntity),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_tenant_input_js_1.UpdateTenantInput]),
    __metadata("design:returntype", void 0)
], TenantResolver.prototype, "updateTenant", null);
exports.TenantResolver = TenantResolver = __decorate([
    (0, graphql_1.Resolver)(() => tenant_entity_js_1.TenantEntity),
    __metadata("design:paramtypes", [tenant_service_js_1.TenantService])
], TenantResolver);
