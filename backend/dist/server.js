"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const alunoRoutes_1 = __importDefault(require("./routes/alunoRoutes"));
const aulaRoutes_1 = __importDefault(require("./routes/aulaRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const comentarioRedacao_1 = __importDefault(require("./routes/comentarioRedacao"));
const cursoRoutes_1 = __importDefault(require("./routes/cursoRoutes"));
const documentoRoutes_1 = __importDefault(require("./routes/documentoRoutes"));
const mediaNotaRoutes_1 = __importDefault(require("./routes/mediaNotaRoutes"));
const moduloRoutes_1 = __importDefault(require("./routes/moduloRoutes"));
const notaBimestreRoutes_1 = __importDefault(require("./routes/notaBimestreRoutes"));
const professorRoutes_1 = __importDefault(require("./routes/professorRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const redacao_1 = __importDefault(require("./routes/redacao"));
const redacaoCorrecao_1 = __importDefault(require("./routes/redacaoCorrecao"));
const redacaoResposta_1 = __importDefault(require("./routes/redacaoResposta"));
const tipoComentario_1 = __importDefault(require("./routes/tipoComentario"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Verifica se a pasta temp existe, se não, cria-a
const tempDir = path_1.default.join(process.cwd(), "temp");
if (!fs_1.default.existsSync(tempDir)) {
    fs_1.default.mkdirSync(tempDir, { recursive: true });
    console.log(`Diretório temporário criado: ${tempDir}`);
}
// Limpa arquivos temporários na inicialização
try {
    const files = fs_1.default.readdirSync(tempDir);
    for (const file of files) {
        fs_1.default.unlinkSync(path_1.default.join(tempDir, file));
    }
    console.log(`${files.length} arquivos temporários limpos na inicialização`);
}
catch (err) {
    console.error("Erro ao limpar arquivos temporários:", err);
}
// Configurações de CORS
app.use((0, cors_1.default)({
    origin: [
        "https://docere.vercel.app",
        "https://plataforma-de-cursos-one.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// Configuração para JSON com limite reduzido para uso geral
app.use(express_1.default.json({ limit: "100mb" })); // Reduzido para 100MB para requests normais
app.use(express_1.default.urlencoded({ limit: "100mb", extended: true }));
// Middleware para monitoramento básico de memória
app.use((req, res, next) => {
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed / 1024 / 1024 > 1500) {
        // Alerta se usar mais de 1.5GB
        console.warn(`🚨 ALERTA DE MEMÓRIA: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB usado. URL: ${req.originalUrl}`);
        // Tenta forçar a coleta de lixo se disponível
        if (global.gc) {
            console.log("Forçando coleta de lixo...");
            global.gc();
        }
    }
    next();
});
// Configuração de rotas
app.use("/professores", professorRoutes_1.default);
app.use("/redacao", redacao_1.default);
app.use("/redacaoResposta", redacaoResposta_1.default);
app.use("/redacaoCorrecao", redacaoCorrecao_1.default);
app.use("/media-nota", mediaNotaRoutes_1.default);
app.use("/progresso", progressRoutes_1.default);
app.use("/uploads", uploadRoutes_1.default);
app.use("/chat", chatRoutes_1.default);
app.use("/tipo-comentario", tipoComentario_1.default);
app.use("/comentario-redacao", comentarioRedacao_1.default);
app.use("/login", authRoutes_1.default);
app.use("/cursos", cursoRoutes_1.default);
app.use("/alunos", alunoRoutes_1.default);
app.use("/aulas", aulaRoutes_1.default);
app.use("/modulos", moduloRoutes_1.default);
app.use("/documentos", documentoRoutes_1.default);
app.use("/notas-bimestre", notaBimestreRoutes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// Rota para verificação de saúde do servidor
app.get("/health", (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.json({
        status: "ok",
        uptime: process.uptime(),
        memory: {
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
        },
    });
});
// Limpar arquivos temporários periodicamente (a cada 1 hora)
setInterval(() => {
    try {
        const files = fs_1.default.readdirSync(tempDir);
        let count = 0;
        for (const file of files) {
            const filePath = path_1.default.join(tempDir, file);
            const stats = fs_1.default.statSync(filePath);
            const fileAgeInHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
            // Remove arquivos com mais de 2 horas
            if (fileAgeInHours > 2) {
                fs_1.default.unlinkSync(filePath);
                count++;
            }
        }
        if (count > 0) {
            console.log(`Limpeza periódica: ${count} arquivos temporários removidos`);
        }
        // Forçar coleta de lixo se disponível
        if (global.gc) {
            global.gc();
            console.log("Coleta de lixo forçada durante limpeza periódica");
        }
    }
    catch (err) {
        console.error("Erro na limpeza periódica:", err);
    }
}, 60 * 60 * 1000); // 1 hora em ms
// Adicionar middleware de tratamento de erros global
app.use((err, req, res, next) => {
    console.error("Erro não tratado:", err);
    res.status(500).json({
        error: "Erro interno no servidor",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Memory limit: ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Node.js version: ${process.version}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    // Verificando se --expose-gc está ativado
    if (global.gc) {
        console.log("Garbage collection (--expose-gc) está disponível");
    }
    else {
        console.log("Aviso: Garbage collection explícita não disponível. Execute com --expose-gc para ativar.");
    }
});
