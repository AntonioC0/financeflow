# Gestor+ - Instalação Rápida

## 🚀 Início Rápido (Desenvolvimento Local)

### Pré-requisitos

- Node.js 18+ instalado
- MySQL instalado e rodando
- pnpm instalado (`npm install -g pnpm`)

### Passo 1: Instalar Dependências

```bash
pnpm install
```

### Passo 2: Configurar Banco de Dados

1. Crie um banco de dados MySQL:

```sql
CREATE DATABASE gestorplus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Crie arquivo `.env` na raiz do projeto:

```bash
DATABASE_URL=mysql://root:senha@localhost:3306/gestorplus
JWT_SECRET=sua-chave-secreta-aqui
NODE_ENV=development
PORT=3000
```

3. Execute as migrations:

```bash
pnpm db:push
```

### Passo 3: Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em: `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
gestorplus/
├── client/              # Frontend (React + Vite)
│   ├── public/         # Arquivos estáticos
│   └── src/
│       ├── components/ # Componentes React
│       ├── pages/      # Páginas da aplicação
│       ├── hooks/      # Custom hooks
│       └── lib/        # Utilitários
├── server/             # Backend (Express + tRPC)
│   ├── _core/         # Código core do servidor
│   ├── db.ts          # Queries do banco
│   └── routers.ts     # Rotas tRPC
├── drizzle/           # Schema e migrations do DB
├── shared/            # Código compartilhado
└── package.json       # Dependências
```

---

## 🔧 Scripts Disponíveis

```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Inicia servidor de produção
pnpm db:push      # Executa migrations do banco
pnpm db:studio    # Abre interface visual do banco
pnpm test         # Executa testes
```

---

## ⚠️ Importante

Este projeto foi desenvolvido originalmente para a plataforma Manus e usa recursos específicos:

- **Autenticação OAuth Manus** (precisa ser substituída)
- **Banco de dados gerenciado**
- **Armazenamento S3 gerenciado**

Para hospedar em ambiente próprio, consulte o arquivo **`GUIA_MIGRACAO_HOSPEDAGEM.md`** incluído neste ZIP.

---

## 🆘 Problemas Comuns

### Erro: "Cannot connect to database"

Verifique se:
- MySQL está rodando
- Credenciais no `.env` estão corretas
- Banco de dados foi criado

### Erro: "Port 3000 already in use"

Mude a porta no arquivo `.env`:
```
PORT=3001
```

### Erro: "Module not found"

Execute:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📚 Documentação Completa

- **GUIA_MIGRACAO_HOSPEDAGEM.md** - Guia completo para hospedar em servidor próprio
- **README.md** - Documentação do projeto original
- **todo.md** - Lista de funcionalidades implementadas

---

## 🔐 Segurança

**NUNCA** commite o arquivo `.env` no Git!

Adicione ao `.gitignore`:
```
.env
.env.local
.env.production
```

---

## 📞 Suporte

Para dúvidas sobre migração e hospedagem, consulte o guia completo incluído neste pacote.

**Boa sorte com seu projeto!** 🎉
