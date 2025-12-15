import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import alunoRoutes from "./routes/alunoRoutes";
import aulaRoutes from "./routes/aulaRoutes";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import comentarioRedacaoRoutes from "./routes/comentarioRedacao";
import cursoRoutes from "./routes/cursoRoutes";
import documentoRoutes from "./routes/documentoRoutes";
import mediaNotaRoutes from "./routes/mediaNotaRoutes";
import moduloRoutes from "./routes/moduloRoutes";
import notaBimestreRoutes from "./routes/notaBimestreRoutes";
import professorRoutes from "./routes/professorRoutes";
import progressRoutes from "./routes/progressRoutes";
import redacaoRoutes from "./routes/redacao";
import redacaoCorrecaoRoutes from "./routes/redacaoCorrecao";
import redacaoRespostaRoutes from "./routes/redacaoResposta";
import tipoComentarioRoutes from "./routes/tipoComentario";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Verifica se a pasta temp existe, se não, cria-a
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`Diretório temporário criado: ${tempDir}`);
}

// Limpa arquivos temporários na inicialização
try {
  const files = fs.readdirSync(tempDir);
  for (const file of files) {
    fs.unlinkSync(path.join(tempDir, file));
  }
  console.log(`${files.length} arquivos temporários limpos na inicialização`);
} catch (err) {
  console.error("Erro ao limpar arquivos temporários:", err);
}

// Configurações de CORS
app.use(
  cors({
    origin: [
      "https://docere.vercel.app",
      "https://plataforma-de-cursos-one.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Configuração para JSON com limite reduzido para uso geral
app.use(express.json({ limit: "100mb" })); // Reduzido para 100MB para requests normais
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Middleware para monitoramento básico de memória
app.use((req, res, next) => {
  const memoryUsage = process.memoryUsage();
  if (memoryUsage.heapUsed / 1024 / 1024 > 1500) {
    // Alerta se usar mais de 1.5GB
    console.warn(
      `🚨 ALERTA DE MEMÓRIA: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(
        2
      )}MB usado. URL: ${req.originalUrl}`
    );

    // Tenta forçar a coleta de lixo se disponível
    if (global.gc) {
      console.log("Forçando coleta de lixo...");
      global.gc();
    }
  }
  next();
});

// Configuração de rotas
app.use("/professores", professorRoutes);
app.use("/redacao", redacaoRoutes);
app.use("/redacaoResposta", redacaoRespostaRoutes);
app.use("/redacaoCorrecao", redacaoCorrecaoRoutes);
app.use("/media-nota", mediaNotaRoutes);
app.use("/progresso", progressRoutes);
app.use("/uploads", uploadRoutes);
app.use("/chat", chatRoutes);
app.use("/tipo-comentario", tipoComentarioRoutes);
app.use("/comentario-redacao", comentarioRedacaoRoutes);
app.use("/login", authRoutes);
app.use("/cursos", cursoRoutes);
app.use("/alunos", alunoRoutes);
app.use("/aulas", aulaRoutes);
app.use("/modulos", moduloRoutes);
app.use("/documentos", documentoRoutes);
app.use("/notas-bimestre", notaBimestreRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
    const files = fs.readdirSync(tempDir);
    let count = 0;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      const fileAgeInHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

      // Remove arquivos com mais de 2 horas
      if (fileAgeInHours > 2) {
        fs.unlinkSync(filePath);
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
  } catch (err) {
    console.error("Erro na limpeza periódica:", err);
  }
}, 60 * 60 * 1000); // 1 hora em ms

// Adicionar middleware de tratamento de erros global
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Erro não tratado:", err);
    res.status(500).json({
      error: "Erro interno no servidor",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Memory limit: ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(
      2
    )}MB`
  );
  console.log(`Node.js version: ${process.version}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

  // Verificando se --expose-gc está ativado
  if (global.gc) {
    console.log("Garbage collection (--expose-gc) está disponível");
  } else {
    console.log(
      "Aviso: Garbage collection explícita não disponível. Execute com --expose-gc para ativar."
    );
  }
});
