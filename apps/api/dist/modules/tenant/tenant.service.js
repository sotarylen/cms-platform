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
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_js_1 = require("./tenant.entity.js");
let TenantService = class TenantService {
    tenantRepo;
    constructor(tenantRepo) {
        this.tenantRepo = tenantRepo;
    }
    findAll() {
        return this.tenantRepo.find({ order: { createdAt: 'DESC' } });
    }
    async findOne(idOrSlug) {
        const tenant = await this.tenantRepo.findOne({
            where: [{ id: idOrSlug }, { slug: idOrSlug }],
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    create(input) {
        const entity = this.tenantRepo.create(input);
        return this.tenantRepo.save(entity);
    }
    async update(input) {
        const tenant = await this.findOne(input.id);
        Object.assign(tenant, input);
        return this.tenantRepo.save(tenant);
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_js_1.TenantEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantService);
