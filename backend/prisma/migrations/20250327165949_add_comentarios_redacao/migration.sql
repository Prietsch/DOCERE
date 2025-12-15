-- CreateTable
CREATE TABLE "TipoComentario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "id_professor" INTEGER NOT NULL,

    CONSTRAINT "TipoComentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioRedacao" (
    "id" SERIAL NOT NULL,
    "id_resposta" INTEGER NOT NULL,
    "id_tipo_comentario" INTEGER NOT NULL,
    "texto_comentario" TEXT NOT NULL,
    "posicao_inicio" INTEGER NOT NULL,
    "posicao_fim" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioRedacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoComentario_nome_id_professor_key" ON "TipoComentario"("nome", "id_professor");

-- CreateIndex
CREATE INDEX "ComentarioRedacao_id_resposta_idx" ON "ComentarioRedacao"("id_resposta");

-- CreateIndex
CREATE INDEX "ComentarioRedacao_id_tipo_comentario_idx" ON "ComentarioRedacao"("id_tipo_comentario");

-- AddForeignKey
ALTER TABLE "TipoComentario" ADD CONSTRAINT "TipoComentario_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioRedacao" ADD CONSTRAINT "ComentarioRedacao_id_resposta_fkey" FOREIGN KEY ("id_resposta") REFERENCES "RedacaoResposta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioRedacao" ADD CONSTRAINT "ComentarioRedacao_id_tipo_comentario_fkey" FOREIGN KEY ("id_tipo_comentario") REFERENCES "TipoComentario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
