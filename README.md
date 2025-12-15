# Plataforma de Cursos em Vídeo

Uma plataforma completa para cursos em vídeo com frontend em React e backend em Node.js.

## Estrutura do Projeto

```
video-course-platform/
├── frontend/         # Aplicação React
├── backend/         # API Node.js/Express
└── uploads/         # Arquivos de vídeo enviados
```

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (versão 6 ou superior)
- PostgreSQL (versão 12 ou superior)

## Configuração e Instalação

1. **Clone o repositório:**

```bash
git clone <url-do-repositorio>
cd video-course-platform
```

2. **Instale todas as dependências:**

```bash
npm run install:all
```

3. **Configure o ambiente:**

Crie um arquivo `.env` na pasta `backend` com:

```env
RENDER_URL="postgresql://usuario:senha@localhost:5432/video_courses"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=3000
```

4. **Configure o banco de dados:**

```bash
cd backend
npx prisma migrate dev
```

## Executando o Projeto

### Desenvolvimento

Para executar tanto o frontend quanto o backend em modo de desenvolvimento:

```bash
npm run dev
```

Isso iniciará:

- Backend: http://localhost:3000
- Frontend: http://localhost:3001

### Separadamente

**Backend:**

```bash
npm run start:backend
```

**Frontend:**

```bash
npm run start:frontend
```

## Funcionalidades

### Professores

- Criar e gerenciar cursos
- Adicionar módulos e aulas
- Upload de vídeos
- Acompanhar progresso dos alunos

### Alunos

- Assistir aulas
- Acompanhar progresso
- Acessar material do curso
- Marcar aulas como concluídas

## Tecnologias Principais

### Frontend

- React
- Material-UI
- TypeScript
- React Router
- Axios

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- TypeScript
- JWT Authentication

## Scripts Disponíveis

- `npm run install:all`: Instala dependências em todos os projetos
- `npm run dev`: Inicia frontend e backend em modo desenvolvimento
- `npm run start:backend`: Inicia apenas o backend
- `npm run start:frontend`: Inicia apenas o frontend
- `npm run build`: Compila frontend e backend para produção
- `npm test`: Executa testes em ambos os projetos

## Estrutura de Arquivos Principal

```
frontend/
├── src/
│   ├── pages/         # Componentes de página
│   ├── components/    # Componentes reutilizáveis
│   ├── contexts/      # Contextos React
│   └── services/      # Serviços e APIs
│
backend/
├── src/
│   ├── controllers/   # Controladores
│   ├── routes/        # Rotas da API
│   ├── services/      # Lógica de negócios
│   └── middlewares/   # Middlewares
```

## Contribuindo

1. Faça o fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.
