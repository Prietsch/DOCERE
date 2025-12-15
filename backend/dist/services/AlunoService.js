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
exports.AlunoService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class AlunoService {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAluno = yield prismaClient_1.default.aluno.findUnique({
                where: { email: data.email },
            });
            if (existingAluno) {
                throw new Error("Email already exists");
            }
            const hashedPassword = yield bcrypt_1.default.hash(data.senha, 10);
            return prismaClient_1.default.aluno.create({
                data: Object.assign(Object.assign({}, data), { senha: hashedPassword }),
            });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.aluno.findMany();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.aluno.findUnique({ where: { id } });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.aluno.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prismaClient_1.default.aluno.delete({ where: { id } });
        });
    }
}
exports.AlunoService = AlunoService;
