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
const ChatService_1 = require("../services/ChatService");
const router = express_1.default.Router();
const chatService = new ChatService_1.ChatService();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield chatService.create(req.body);
        res.status(201).json(chat);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating chat' });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield chatService.findAll();
        res.json(chats);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching chats' });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield chatService.findById(Number(req.params.id));
        if (chat) {
            res.json(chat);
        }
        else {
            res.status(404).json({ error: 'Chat not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching chat' });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield chatService.update(Number(req.params.id), req.body);
        res.json(chat);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating chat' });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield chatService.delete(Number(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting chat' });
    }
}));
exports.default = router;
