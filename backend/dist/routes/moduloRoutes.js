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
const express_1 = __importDefault(require("express"));
const ModuloService_1 = require("../services/ModuloService");
const router = express_1.default.Router();
const moduloService = new ModuloService_1.ModuloService();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modulo = yield moduloService.create(req.body);
        res.status(201).json(modulo);
    }
    catch (error) {
        res.status(500).json({ error: "Error creating modulo" });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modulos = yield moduloService.findAll();
        res.json(modulos);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching modulos" });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modulo = yield moduloService.findById(Number(req.params.id));
        if (modulo) {
            res.json(modulo);
        }
        else {
            res.status(404).json({ error: "Modulo not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching modulo" });
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modulo = yield moduloService.update(Number(req.params.id), req.body);
        res.json(modulo);
    }
    catch (error) {
        res.status(500).json({ error: "Error updating modulo" });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield moduloService.delete(Number(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting module:", error);
        res.status(500).json({
            error: "Error deleting modulo",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}));
exports.default = router;
