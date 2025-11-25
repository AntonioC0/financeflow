# Gestor+

Plataforma completa de gestão financeira pessoal com todas as funcionalidades dos principais apps do mercado.

## Funcionalidades

- **Gestão de Contas**: Gerencie todas suas contas bancárias, poupança e carteiras digitais
- **Controle de Cartões**: Acompanhe faturas, limites e vencimentos dos seus cartões de crédito
- **Transações**: Registre receitas e despesas com categorização inteligente
- **Orçamentos**: Crie orçamentos mensais por categoria com alertas de limite
- **Metas Financeiras**: Defina objetivos e acompanhe seu progresso
- **Investimentos**: Gerencie ações, fundos, renda fixa, criptomoedas e imóveis
- **Lembretes**: Nunca mais perca vencimentos com alertas automáticos
- **Relatórios Avançados**: Gráficos interativos e análises detalhadas
- **Modo Escuro/Claro**: Interface adaptável às suas preferências

## Tecnologias

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express + tRPC
- **Banco de Dados**: MySQL/TiDB com Drizzle ORM
- **Autenticação**: OAuth integrado (Google, Apple ID)
- **Gráficos**: Recharts para visualizações interativas

## Como Executar

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

## Estrutura do Projeto

```
client/          # Frontend React
  src/
    pages/       # Páginas da aplicação
    components/  # Componentes reutilizáveis
    lib/         # Configurações e utilitários
server/          # Backend Node.js
  routers.ts     # Rotas tRPC
  db.ts          # Queries do banco de dados
drizzle/         # Schema e migrações do banco
  schema.ts      # Definição das tabelas
```

## Licença

MIT
