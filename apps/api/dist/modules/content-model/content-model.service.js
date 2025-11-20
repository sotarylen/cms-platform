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
exports.ContentModelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_model_entity_js_1 = require("./content-model.entity.js");
let ContentModelService = class ContentModelService {
    modelRepo;
    constructor(modelRepo) {
        this.modelRepo = modelRepo;
    }
    findAll(tenantId) {
        return this.modelRepo.find({
            where: tenantId ? { tenantId } : {},
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(idOrApiName) {
        const model = await this.modelRepo.findOne({
            where: [{ id: idOrApiName }, { apiName: idOrApiName }],
        });
        if (!model)
            throw new common_1.NotFoundException('Model not found');
        return model;
    }
    create(input) {
        const entity = this.modelRepo.create(input);
        return this.modelRepo.save(entity);
    }
    async update(input) {
        const model = await this.findOne(input.id);
        Object.assign(model, input);
        return this.modelRepo.save(model);
    }
};
exports.ContentModelService = ContentModelService;
exports.ContentModelService = ContentModelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_model_entity_js_1.ContentModelEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContentModelService);
