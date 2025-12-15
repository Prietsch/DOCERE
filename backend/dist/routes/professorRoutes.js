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
const ProfessorService_1 = require("../services/ProfessorService");
const router = express_1.default.Router();
const professorService = new ProfessorService_1.ProfessorService();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const professor = yield professorService.create(req.body);
        res.status(201).json(professor);
    }
    catch (error) {
        if (error instanceof Error && error.message === 'Email already exists') {
            res.status(400).json({ error: 'Email already exists' });
        }
        else {
            res.status(500).json({ error: 'Error creating professor' });
        }
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const professors = yield professorService.findAll();
        res.json(professors);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching professors' });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const professor = yield professorService.findById(Number(req.params.id));
        if (professor) {
            res.json(professor);
        }
        else {
            res.status(404).json({ error: 'Professor not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching professor' });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const professor = yield professorService.update(Number(req.params.id), req.body);
        res.json(professor);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating professor' });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield professorService.delete(Number(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting professor' });
    }
}));
exports.default = router;
