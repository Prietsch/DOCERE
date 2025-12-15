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
const NotaBimestreService_1 = require("../services/NotaBimestreService");
const router = express_1.default.Router();
const notaBimestreService = new NotaBimestreService_1.NotaBimestreService();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notaBimestre = yield notaBimestreService.create(req.body);
        res.status(201).json(notaBimestre);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating nota bimestre' });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notasBimestre = yield notaBimestreService.findAll();
        res.json(notasBimestre);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching notas bimestre' });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notaBimestre = yield notaBimestreService.findById(Number(req.params.id));
        if (notaBimestre) {
            res.json(notaBimestre);
        }
        else {
            res.status(404).json({ error: 'Nota bimestre not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching nota bimestre' });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notaBimestre = yield notaBimestreService.update(Number(req.params.id), req.body);
        res.json(notaBimestre);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating nota bimestre' });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield notaBimestreService.delete(Number(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting nota bimestre' });
    }
}));
exports.default = router;
