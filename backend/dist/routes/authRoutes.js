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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }
    try {
        // Primeiro tenta encontrar um professor
        let user = yield prismaClient_1.default.professor.findUnique({ where: { email } });
        let role = "teacher";
        // Se não encontrar professor, tenta encontrar aluno
        if (!user) {
            user = yield prismaClient_1.default.aluno.findUnique({ where: { email } });
            role = "student";
        }
        // Se não encontrar nenhum usuário
        if (!user) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }
        // Verifica se existe uma senha armazenada
        if (!user.senha) {
            console.error("Senha não encontrada para o usuário:", email);
            return res.status(500).json({ message: "Erro na autenticação" });
        }
        // Verifica a senha
        const validPassword = yield bcrypt_1.default.compare(password, user.senha);
        if (!validPassword) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }
        // Gera o token JWT
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role,
        }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "24h" });
        // Remove a senha do objeto antes de enviar
        const { senha } = user, userWithoutPassword = __rest(user, ["senha"]);
        // Retorna os dados do usuário com sua role e token
        res.json(Object.assign(Object.assign({}, userWithoutPassword), { role,
            token }));
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
}));
// Middleware para verificar token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido" });
        }
        req.user = decoded;
        next();
    });
};
// Rota para verificar token
router.get("/verify-token", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let userData;
        if ((user === null || user === void 0 ? void 0 : user.role) === "teacher") {
            userData = yield prismaClient_1.default.professor.findUnique({
                where: { id: user.id },
                select: { id: true, nome: true, email: true },
            });
        }
        else {
            userData = yield prismaClient_1.default.aluno.findUnique({
                where: { id: user === null || user === void 0 ? void 0 : user.id },
                select: { id: true, nome: true, email: true },
            });
        }
        if (!userData) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        res.json(Object.assign(Object.assign({}, userData), { role: user === null || user === void 0 ? void 0 : user.role }));
    }
    catch (error) {
        console.error("Erro ao verificar token:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
}));
exports.default = router;
