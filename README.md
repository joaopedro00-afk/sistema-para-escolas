# Desafio CRUD — Sistema de Gestão Escolar

Sistema de gerenciamento de usuários, escolas, professores e alunos, feito com **Node.js + Express + MySQL** no backend e **React + TypeScript + Vite** no frontend.

A organização de pastas segue o mesmo padrão do projeto FluiSaúde usado como referência: separação em **model → controller → route** no backend, e **services (api.ts) → pages** no frontend.

## Estrutura

```
desafio-crud/
├── backend/
│   ├── src/
│   │   ├── config/database.js       # conexão Sequelize com o MySQL
│   │   ├── models/                  # Usuario, Escola, Professor, Aluno
│   │   ├── controllers/             # regras de negócio e acesso ao banco
│   │   ├── routes/                  # endpoints HTTP (blueprints do Express)
│   │   ├── middlewares/             # authMiddleware (JWT) e errorHandler
│   │   ├── utils/validators.js      # validação de CPF, data e senha
│   │   ├── app.js                   # criação do app Express
│   │   └── server.js                # ponto de entrada
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── services/api.ts          # cliente HTTP tipado
    │   ├── context/AuthContext.tsx  # estado de login (JWT)
    │   ├── components/              # Layout, ProtectedRoute, TableSimple
    │   ├── pages/                   # Login, Cadastro, Escolas, Professores, Alunos
    │   └── styles/main.css
    └── package.json
```

## Modelagem

- **usuarios**: id, nome, cpf (único), senha_hash, data_nascimento
- **escolas**: id, nome, endereco
- **professores**: id, usuario_id (FK → usuarios), escola_id (FK → escolas)
- **alunos**: id, nome, cpf (único), data_nascimento, professor_id (FK → professores)

Regras: um professor pertence a uma escola; um aluno pertence a um professor. Ao cadastrar um professor, o sistema cria automaticamente o `Usuario` (login) e o `Professor` associado, numa única transação.

## Como rodar

### 1. Banco de dados

Crie o banco no MySQL:

```sql
CREATE DATABASE desafio_crud CHARACTER SET utf8mb4;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# edite o .env com as credenciais do seu MySQL
npm install
npm run dev
```

As tabelas são criadas automaticamente na primeira execução (via `sequelize.sync()`). A API sobe em `http://127.0.0.1:5001`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://127.0.0.1:5173` e já aponta para a API local por padrão.

## Endpoints principais

| Método | Rota                | Descrição                              | Autenticado |
|--------|----------------------|-----------------------------------------|-------------|
| POST   | /api/login            | Login por CPF e senha                   | Não |
| POST   | /api/users             | Cadastro de usuário comum               | Não |
| GET    | /api/users             | Lista usuários                          | Sim |
| GET/POST/PUT/DELETE | /api/schools  | CRUD de escolas                         | Sim |
| POST   | /api/teachers          | Cadastro de professor (cria usuário)    | Não |
| GET/PUT/DELETE | /api/teachers   | Listar / atualizar escola / excluir     | Sim |
| GET/POST/PUT/DELETE | /api/students | CRUD de alunos                          | Sim |

## Fluxo no frontend

1. `/cadastro` — cria um usuário comum.
2. `/login` — autentica por CPF + senha e guarda o JWT.
3. `/escolas` — cadastra escolas (pré-requisito para professores).
4. `/professores` — cadastra professores, escolhendo uma escola existente (cria login automaticamente).
5. `/alunos` — cadastra alunos, escolhendo um professor existente.

Todas as rotas de gestão são protegidas e redirecionam para `/login` caso não haja token válido.
