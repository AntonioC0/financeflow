# Guia de Migração: Gestor+ para Hospedagem Tradicional

**Autor:** Manus AI  
**Data:** 16 de novembro de 2025  
**Versão do Projeto:** 48b95f04

---

## Introdução

Este guia fornece instruções detalhadas para migrar o projeto **Gestor+** da plataforma Manus para um ambiente de hospedagem tradicional, como cPanel com MySQL, VPS ou servidores dedicados. O projeto foi originalmente desenvolvido utilizando recursos específicos da plataforma Manus (autenticação OAuth, banco de dados gerenciado, armazenamento S3), que precisarão ser substituídos ou adaptados.

---

## Visão Geral das Mudanças Necessárias

A migração envolve quatro áreas principais de adaptação:

1. **Sistema de Autenticação**: Substituir OAuth Manus por autenticação própria (JWT, sessões, ou OAuth de terceiros)
2. **Banco de Dados**: Configurar e conectar ao MySQL próprio
3. **Armazenamento de Arquivos**: Configurar S3 próprio ou alternativas (Cloudinary, DigitalOcean Spaces, local)
4. **Variáveis de Ambiente**: Configurar todas as env vars necessárias
5. **Build e Deploy**: Preparar aplicação para produção

---

## 1. Configuração do Banco de Dados

### 1.1 Criar Banco de Dados MySQL

No cPanel ou via linha de comando, crie um novo banco de dados:

```sql
CREATE DATABASE gestorplus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gestorplus_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON gestorplus.* TO 'gestorplus_user'@'localhost';
FLUSH PRIVILEGES;
```

### 1.2 Executar Migrations

O projeto usa Drizzle ORM para gerenciar o schema do banco de dados. Após baixar os arquivos:

```bash
# Instalar dependências
npm install
# ou
pnpm install

# Configurar DATABASE_URL no arquivo .env
echo "DATABASE_URL=mysql://gestorplus_user:senha_segura_aqui@localhost:3306/gestorplus" > .env

# Executar migrations
pnpm db:push
```

### 1.3 Schema do Banco de Dados

O schema principal está em `drizzle/schema.ts`. As tabelas principais incluem:

| Tabela | Descrição | Colunas Principais |
|--------|-----------|-------------------|
| `users` | Usuários do sistema | id, openId, name, email, role, createdAt |
| `accounts` | Contas bancárias | id, userId, name, type, balance, currency |
| `credit_cards` | Cartões de crédito | id, userId, name, limit, closingDay, dueDay |
| `transactions` | Transações financeiras | id, userId, accountId, type, amount, category, date |
| `budgets` | Orçamentos | id, userId, category, amount, period, startDate |
| `goals` | Metas financeiras | id, userId, name, targetAmount, currentAmount, deadline |
| `reminders` | Lembretes | id, userId, title, description, dueDate, completed |
| `investments` | Investimentos | id, userId, name, type, amount, currentValue, purchaseDate |

---

## 2. Sistema de Autenticação

### 2.1 Opções de Autenticação

Você tem três opções principais para substituir o OAuth Manus:

#### Opção A: Autenticação JWT Simples (Recomendado para início)

Implementar sistema de registro/login com email e senha usando JWT (JSON Web Tokens).

**Passos:**

1. Instalar dependências:
```bash
npm install bcrypt jsonwebtoken
npm install --save-dev @types/bcrypt @types/jsonwebtoken
```

2. Criar arquivo `server/auth.ts`:

```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { users } from '../drizzle/schema';
import { getDb } from './db';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui-mude-em-producao';
const JWT_EXPIRES_IN = '7d';

export async function registerUser(email: string, password: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Verificar se email já existe
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error('Email já cadastrado');
  }

  // Hash da senha
  const passwordHash = await bcrypt.hash(password, 10);

  // Criar usuário
  const [user] = await db.insert(users).values({
    email,
    name,
    openId: `local_${Date.now()}_${Math.random()}`, // ID único para compatibilidade
    loginMethod: 'email',
    role: 'user',
  });

  // Armazenar hash da senha em tabela separada (criar nova tabela user_credentials)
  // Por segurança, não armazenar senha na tabela users principal

  return user;
}

export async function loginUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Buscar usuário
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  // Verificar senha (buscar de user_credentials)
  // const isValid = await bcrypt.compare(password, storedHash);
  // if (!isValid) throw new Error('Credenciais inválidas');

  // Gerar JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user, token };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
```

3. Criar tabela `user_credentials` no schema:

```typescript
// Em drizzle/schema.ts
export const userCredentials = mysqlTable("user_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

4. Atualizar `server/_core/context.ts` para usar JWT:

```typescript
// Substituir lógica de OAuth por verificação de JWT
const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');
if (token) {
  const decoded = verifyToken(token);
  if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
    const user = await getUserById(decoded.userId);
    return { req, res, user };
  }
}
```

5. Criar rotas de autenticação em `server/routers.ts`:

```typescript
auth: router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      const user = await registerUser(input.email, input.password, input.name);
      const { token } = await loginUser(input.email, input.password);
      return { user, token };
    }),
  
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { user, token } = await loginUser(input.email, input.password);
      
      // Definir cookie
      ctx.res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        sameSite: 'lax',
      });
      
      return { user };
    }),
  
  me: publicProcedure.query(({ ctx }) => ctx.user),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie('auth_token');
    return { success: true };
  }),
}),
```

6. Atualizar frontend para usar novo sistema:

Substituir `getLoginUrl()` por formulário de login próprio em `client/src/pages/Home.tsx` e criar páginas de Login/Registro.

#### Opção B: OAuth com Provedores Terceiros (Google, Facebook)

Use bibliotecas como **Passport.js** ou **NextAuth.js** (se migrar para Next.js) para implementar OAuth com Google, Facebook, GitHub, etc.

#### Opção C: Sistema de Sessões Tradicional

Use **express-session** com armazenamento em banco de dados ou Redis.

---

## 3. Armazenamento de Arquivos

### 3.1 Opções de Armazenamento

O projeto usa S3 para armazenar arquivos (avatares, anexos, etc.). Você tem várias opções:

#### Opção A: AWS S3 Próprio

1. Criar bucket no AWS S3
2. Configurar credenciais IAM
3. Atualizar `server/storage.ts`:

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function storagePut(key: string, data: Buffer | Uint8Array | string, contentType?: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: data,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return {
    key,
    url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
  };
}

export async function storageGet(key: string, expiresIn: number = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });

  return { key, url };
}
```

4. Adicionar variáveis de ambiente:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
S3_BUCKET_NAME=gestorplus-files
```

#### Opção B: Alternativas ao S3

- **DigitalOcean Spaces**: Compatível com S3 API
- **Cloudinary**: Ótimo para imagens
- **Backblaze B2**: Mais barato que S3
- **Armazenamento Local**: Para ambientes de desenvolvimento

#### Opção C: Armazenamento Local (Desenvolvimento)

```typescript
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function storagePut(key: string, data: Buffer | Uint8Array | string, contentType?: string) {
  const filePath = path.join(UPLOAD_DIR, key);
  const dir = path.dirname(filePath);
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, data);

  return {
    key,
    url: `/uploads/${key}`,
  };
}
```

---

## 4. Variáveis de Ambiente

### 4.1 Criar Arquivo `.env`

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/gestorplus

# Autenticação
JWT_SECRET=chave-secreta-super-segura-mude-em-producao-use-string-longa-aleatoria

# Aplicação
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=Gestor+ - Seu Gestor Financeiro
VITE_APP_LOGO=/logo.png

# Armazenamento (se usar S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
S3_BUCKET_NAME=gestorplus-files

# URLs
FRONTEND_URL=https://seudominio.com
BACKEND_URL=https://api.seudominio.com

# Opcional: Integrações
# SMTP para emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

### 4.2 Remover Dependências da Plataforma Manus

Arquivos que precisam ser modificados ou removidos:

| Arquivo | Ação |
|---------|------|
| `server/_core/oauth.ts` | Remover ou substituir por nova autenticação |
| `server/_core/llm.ts` | Remover se não usar LLM, ou integrar OpenAI diretamente |
| `server/_core/notification.ts` | Implementar sistema próprio de notificações |
| `server/_core/imageGeneration.ts` | Remover ou integrar com DALL-E/Stable Diffusion |
| `server/_core/voiceTranscription.ts` | Remover ou integrar com Whisper API |
| `server/_core/map.ts` | Implementar Google Maps API diretamente |

---

## 5. Build e Deploy

### 5.1 Build do Projeto

```bash
# Instalar dependências
pnpm install

# Build do frontend e backend
pnpm build

# Estrutura após build:
# - dist/client/  → Arquivos estáticos do frontend
# - dist/server/  → Código do servidor compilado
```

### 5.2 Deploy em cPanel

#### Passo 1: Upload dos Arquivos

1. Compacte a pasta `dist/` em um arquivo ZIP
2. Faça upload via FTP ou File Manager do cPanel
3. Extraia os arquivos no diretório `public_html` ou subdiretório

#### Passo 2: Configurar Node.js no cPanel

1. No cPanel, vá em **Setup Node.js App**
2. Crie nova aplicação:
   - **Node.js version**: 18.x ou superior
   - **Application root**: Caminho onde extraiu os arquivos
   - **Application URL**: Seu domínio
   - **Application startup file**: `dist/server/index.js`

3. Adicione variáveis de ambiente no painel

4. Clique em **Start App**

#### Passo 3: Configurar Proxy Reverso (se necessário)

Se o frontend e backend estiverem separados, configure `.htaccess`:

```apache
RewriteEngine On

# Redirecionar /api para o servidor Node.js
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Servir arquivos estáticos do frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

### 5.3 Deploy em VPS (Ubuntu/Debian)

#### Passo 1: Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 para gerenciar processo
npm install -g pm2

# Instalar MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

#### Passo 2: Configurar Projeto

```bash
# Clonar/copiar projeto
cd /var/www
sudo mkdir gestorplus
sudo chown $USER:$USER gestorplus
cd gestorplus

# Upload dos arquivos (via git, scp, rsync, etc.)

# Instalar dependências
pnpm install

# Criar arquivo .env com as configurações

# Build
pnpm build

# Executar migrations
pnpm db:push
```

#### Passo 3: Iniciar com PM2

```bash
# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'gestorplus',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

#### Passo 4: Configurar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/gestorplus
```

Adicione:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Frontend (arquivos estáticos)
    root /var/www/gestorplus/dist/client;
    index index.html;

    # Servir arquivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/gestorplus /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### Passo 5: Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Renovação automática já está configurada
```

---

## 6. Checklist de Migração

Use este checklist para garantir que todos os passos foram concluídos:

- [ ] Banco de dados MySQL criado e configurado
- [ ] Migrations executadas (`pnpm db:push`)
- [ ] Sistema de autenticação implementado (JWT, OAuth, ou sessões)
- [ ] Tabela `user_credentials` criada para armazenar senhas
- [ ] Armazenamento de arquivos configurado (S3, local, ou alternativa)
- [ ] Arquivo `.env` criado com todas as variáveis necessárias
- [ ] Dependências da plataforma Manus removidas ou substituídas
- [ ] Código de autenticação OAuth Manus substituído
- [ ] Frontend atualizado com formulários de login/registro
- [ ] Build do projeto executado (`pnpm build`)
- [ ] Aplicação testada localmente
- [ ] Deploy realizado (cPanel, VPS, ou outro)
- [ ] Nginx/Apache configurado como proxy reverso
- [ ] SSL/HTTPS configurado
- [ ] PM2 ou similar configurado para manter aplicação rodando
- [ ] Backups automáticos do banco de dados configurados
- [ ] Monitoramento de erros configurado (opcional: Sentry)

---

## 7. Solução de Problemas Comuns

### Erro: "Database not available"

**Causa**: Conexão com banco de dados falhou.

**Solução**:
1. Verificar se MySQL está rodando: `sudo systemctl status mysql`
2. Verificar credenciais no `.env`
3. Testar conexão: `mysql -u usuario -p -h localhost gestorplus`
4. Verificar se usuário tem permissões corretas

### Erro: "JWT malformed" ou "Invalid token"

**Causa**: Token JWT inválido ou expirado.

**Solução**:
1. Limpar cookies do navegador
2. Verificar se `JWT_SECRET` está configurado corretamente
3. Fazer logout e login novamente

### Erro: "Cannot find module"

**Causa**: Dependências não instaladas ou build não executado.

**Solução**:
```bash
rm -rf node_modules package-lock.json
pnpm install
pnpm build
```

### Aplicação não inicia após deploy

**Causa**: Porta em uso ou permissões incorretas.

**Solução**:
1. Verificar se porta 3000 está livre: `sudo lsof -i :3000`
2. Verificar logs: `pm2 logs gestorplus`
3. Verificar permissões dos arquivos: `sudo chown -R $USER:$USER /var/www/gestorplus`

---

## 8. Recursos Adicionais

### Documentação Útil

- **Drizzle ORM**: https://orm.drizzle.team/docs/overview
- **tRPC**: https://trpc.io/docs
- **JWT**: https://jwt.io/introduction
- **PM2**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx**: https://nginx.org/en/docs/

### Bibliotecas Recomendadas

Para funcionalidades adicionais:

- **Envio de emails**: nodemailer
- **Validação**: zod (já incluído)
- **Criptografia**: bcrypt (para senhas)
- **Rate limiting**: express-rate-limit
- **CORS**: cors
- **Logs**: winston ou pino
- **Monitoramento**: @sentry/node

---

## 9. Considerações de Segurança

Ao migrar para hospedagem própria, certifique-se de:

1. **Nunca commitar** o arquivo `.env` no Git
2. **Usar HTTPS** em produção (SSL/TLS)
3. **Implementar rate limiting** para prevenir ataques de força bruta
4. **Validar todas as entradas** do usuário
5. **Usar prepared statements** (Drizzle já faz isso)
6. **Configurar CORS** adequadamente
7. **Manter dependências atualizadas**: `pnpm update`
8. **Fazer backups regulares** do banco de dados
9. **Usar senhas fortes** para banco de dados e JWT_SECRET
10. **Implementar logs de auditoria** para ações críticas

---

## 10. Suporte e Próximos Passos

Após completar a migração, considere:

1. **Monitoramento**: Configurar ferramentas como Sentry, LogRocket, ou New Relic
2. **Analytics**: Integrar Google Analytics ou alternativas
3. **Testes**: Implementar testes automatizados (Jest, Vitest)
4. **CI/CD**: Configurar pipeline de deploy automático (GitHub Actions, GitLab CI)
5. **Documentação**: Manter documentação atualizada da API
6. **Performance**: Implementar cache (Redis) para queries frequentes
7. **Escalabilidade**: Considerar load balancer se tráfego crescer

---

## Conclusão

A migração do Gestor+ para hospedagem tradicional requer adaptações significativas, principalmente no sistema de autenticação e configuração de infraestrutura. Este guia fornece uma base sólida para realizar essa transição, mas cada ambiente de hospedagem pode ter particularidades específicas.

Caso encontre dificuldades durante o processo, revise a seção de **Solução de Problemas Comuns** ou consulte a documentação oficial das tecnologias envolvidas.

**Boa sorte com sua migração!** 🚀

---

**Nota**: Este guia foi gerado automaticamente com base na estrutura atual do projeto. Sempre teste em ambiente de desenvolvimento antes de aplicar em produção.
