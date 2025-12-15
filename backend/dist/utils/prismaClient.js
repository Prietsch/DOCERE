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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Create a singleton PrismaClient instance
const prisma = new client_1.PrismaClient({
    log: ["error", "warn"],
    errorFormat: "pretty",
});
// Handle potential connection issues
prisma
    .$connect()
    .then(() => {
    console.log("Successfully connected to the database");
})
    .catch((error) => {
    console.error("Failed to connect to the database:", error);
});
// Add shutdown hooks
process.on("beforeExit", () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    console.log("Disconnected from database");
}));
exports.default = prisma;
