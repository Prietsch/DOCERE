"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaNotaService = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class MediaNotaService {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.mediaNota.create({ data });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.mediaNota.findMany();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.mediaNota.findUnique({ where: { id } });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.mediaNota.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prismaClient_1.default.mediaNota.delete({ where: { id } });
        });
    }
}
exports.MediaNotaService = MediaNotaService;
