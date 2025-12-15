-- CreateTable
CREATE TABLE "Redacao" (
    "id" SERIAL NOT NULL,
    "tema" TEXT NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_professor" INTEGER NOT NULL,
    "id_aula" INTEGER NOT NULL,

    CONSTRAINT "Redacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedacaoResposta" (
    "id" SERIAL NOT NULL,
    "id_redacao" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "id_aluno" INTEGER NOT NULL,

    CONSTRAINT "RedacaoResposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedacaoCorrecao" (
    "id" SERIAL NOT NULL,
    "id_redacao" INTEGER NOT NULL,
    "id_redacao_resposta" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "id_professor" INTEGER NOT NULL,

    CONSTRAINT "RedacaoCorrecao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RedacaoCorrecao_id_redacao_key" ON "RedacaoCorrecao"("id_redacao");

-- CreateIndex
CREATE UNIQUE INDEX "RedacaoCorrecao_id_redacao_resposta_key" ON "RedacaoCorrecao"("id_redacao_resposta");

-- AddForeignKey
ALTER TABLE "Redacao" ADD CONSTRAINT "Redacao_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redacao" ADD CONSTRAINT "Redacao_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redacao" ADD CONSTRAINT "Redacao_id_aula_fkey" FOREIGN KEY ("id_aula") REFERENCES "Aula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedacaoResposta" ADD CONSTRAINT "RedacaoResposta_id_redacao_fkey" FOREIGN KEY ("id_redacao") REFERENCES "Redacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedacaoResposta" ADD CONSTRAINT "RedacaoResposta_id_aluno_fkey" FOREIGN KEY ("id_aluno") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedacaoCorrecao" ADD CONSTRAINT "RedacaoCorrecao_id_redacao_fkey" FOREIGN KEY ("id_redacao") REFERENCES "Redacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedacaoCorrecao" ADD CONSTRAINT "RedacaoCorrecao_id_redacao_resposta_fkey" FOREIGN KEY ("id_redacao_resposta") REFERENCES "RedacaoResposta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedacaoCorrecao" ADD CONSTRAINT "RedacaoCorrecao_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
