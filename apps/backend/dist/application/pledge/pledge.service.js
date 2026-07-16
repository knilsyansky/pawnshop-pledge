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
exports.PledgeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pledge_factory_1 = require("../../domain/pledge/pledge.factory");
const pledge_entity_1 = require("../../domain/pledge/pledge.entity");
const index_browser_1 = require("@prisma/client/index-browser");
const pledge_redemption_service_1 = require("../../domain/pledge/pledge-redemption.service");
let PledgeService = class PledgeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatAmount(amount) {
        const decimalAmount = amount instanceof index_browser_1.Prisma.Decimal ? amount : new index_browser_1.Prisma.Decimal(String(amount));
        return decimalAmount.toFixed(2);
    }
    async findAll() {
        return this.prisma.pledge.findMany({
            include: {
                client: true,
                tariff: true,
                items: true
            }
        });
    }
    async create(createPledgeDto) {
        const tariff = await this.prisma.tariff.findUnique({
            where: { id: createPledgeDto.tariffId }
        });
        if (!tariff) {
            throw new Error('Tariff not found');
        }
        const createdAt = new Date();
        const dueDate = new Date(createdAt);
        dueDate.setDate(dueDate.getDate() + tariff.basePeriodDays);
        const items = createPledgeDto.items.map(item => new pledge_entity_1.PledgeItem(item.categoryId, item.name, new index_browser_1.Prisma.Decimal(String(item.estimatedValue)), item.specifications));
        const pledge = pledge_factory_1.PledgeFactory.createFromData(createPledgeDto.clientId, createPledgeDto.tariffId, createdAt, dueDate, items);
        const createdPledge = await this.prisma.pledge.create({
            data: pledge_factory_1.PledgeFactory.toPrismaCreate(pledge),
            include: { items: true }
        });
        return {
            ...createdPledge,
            amount: this.formatAmount(createdPledge.amount)
        };
    }
    async redeem(pledgeId) {
        const pledge = await this.prisma.pledge.findUnique({
            where: { id: pledgeId },
            include: { tariff: true }
        });
        if (!pledge) {
            throw new Error('Pledge not found');
        }
        if (pledge.status !== 'ACTIVE') {
            throw new Error('Only active pledges can be redeemed');
        }
        const redeemedAmount = pledge_redemption_service_1.PledgeRedemptionService.calculateRedeemedAmount(pledge.amount, pledge.dueDate, pledge.tariff.basePeriodRate, pledge.tariff.overdueRate);
        const updatedPledge = await this.prisma.pledge.update({
            where: { id: pledgeId },
            data: {
                status: 'REDEEMED',
                redeemedAt: new Date(),
                redeemedAmount
            }
        });
        return {
            ...updatedPledge,
            amount: this.formatAmount(updatedPledge.amount),
            redeemedAmount: this.formatAmount(updatedPledge.redeemedAmount)
        };
    }
};
exports.PledgeService = PledgeService;
exports.PledgeService = PledgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PledgeService);
