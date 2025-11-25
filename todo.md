# Gestor+ - TODO List

## 1. Estrutura do Banco de Dados
- [x] Criar tabela de contas bancárias
- [x] Criar tabela de cartões de crédito
- [x] Criar tabela de categorias
- [x] Criar tabela de subcategorias
- [x] Criar tabela de transações
- [x] Criar tabela de orçamentos
- [x] Criar tabela de metas financeiras
- [x] Criar tabela de investimentos
- [x] Criar tabela de lembretes
- [x] Criar tabela de tags

## 2. Sistema de Contas e Cartões
- [x] CRUD de contas bancárias (criar, listar, editar, excluir)
- [x] CRUD de cartões de crédito
- [x] Visualização de saldos em tempo real
- [x] Controle de limites de cartões
- [x] Gestão de faturas de cartões
- [ ] Transferências entre contas

## 3. Sistema de Transações e Categorias
- [x] CRUD de transações (receitas e despesas)
- [x] Sistema de categorização
- [ ] Sistema de subcategorias
- [ ] Sistema de tags
- [ ] Anexo de comprovantes
- [ ] Transações recorrentes (fixas, variáveis, parceladas)
- [ ] Multicategorias para despesas

## 4. Orçamentos e Planejamento
- [ ] Criação de orçamentos mensais
- [ ] Orçamentos por categoria
- [ ] Orçamentos por período personalizado
- [ ] Alertas de limite de orçamento
- [ ] Acompanhamento de gastos vs orçamento

## 5. Metas e Objetivos Financeiros
- [x] CRUD de metas financeiras
- [x] Acompanhamento de progresso de metas
- [x] Visualização de metas atingidas
- [ ] Notificações de progresso

## 6. Dashboards e Relatórios
- [ ] Dashboard principal com resumo financeiro
- [ ] Gráficos de pizza (despesas por categoria)
- [ ] Gráficos de barras (comparação mensal)
- [ ] Gráficos de linhas (evolução temporal)
- [ ] Fluxo de caixa mensal e anual
- [ ] Relatórios por período
- [ ] Filtros avançados
- [ ] Estatísticas e médias

## 7. Sistema de Investimentos
- [ ] CRUD de investimentos
- [ ] Acompanhamento de rentabilidade
- [ ] Controle de patrimônio total
- [ ] Calculadora de investimentos

## 8. Lembretes e Notificações
- [ ] Sistema de lembretes de contas a pagar
- [ ] Notificações de vencimento
- [ ] Alertas de orçamento excedido
- [ ] Notificações de metas

## 9. Importação e Exportação
- [ ] Exportação para Excel
- [ ] Exportação para PDF
- [ ] Exportação para CSV
- [ ] Importação de arquivos OFX
- [ ] Importação de arquivos CSV
- [ ] Backup de dados

## 10. Interface e Layout
- [x] Página inicial (landing page)
- [x] Layout do dashboard com sidebar
- [x] Página de contas
- [x] Página de cartões
- [x] Página de transações
- [ ] Página de orçamentos
- [x] Página de metas
- [ ] Página de investimentos
- [ ] Página de relatórios
- [ ] Página de configurações
- [x] Modo escuro/claro
- [x] Design responsivo

## 11. Recursos Adicionais
- [ ] Calendário financeiro
- [ ] Controle de dívidas
- [ ] Suporte a múltiplas moedas
- [ ] Compartilhamento com família/parceiro
- [ ] Tutorial de primeiro acesso
- [ ] FAQ e ajuda

## 12. Testes e Ajustes
- [ ] Testar todas as funcionalidades
- [ ] Verificar responsividade
- [ ] Otimizar performance
- [ ] Corrigir bugs encontrados
- [ ] Validar fluxos de usuário

## 13. Novas Funcionalidades Solicitadas
- [x] Página de orçamentos completa
- [x] Página de lembretes completa
- [x] Página de configurações (foto, nome, dados básicos)
- [x] Sistema de upload de foto de perfil
- [x] Edição de dados do usuário

## 14. Bugs Reportados
- [x] Corrigir erro ao adicionar orçamento

## 15. Alterações de Branding
- [x] Mudar nome da plataforma de "FinanceFlow" para "Gestor+"
- [x] Atualizar título em todas as páginas
- [x] Atualizar constantes da aplicação
- [x] Atualizar variáveis de ambiente (via Management UI)

## 16. Tutorial Interativo de Primeiro Uso
- [x] Criar componente de tour/tutorial interativo
- [x] Implementar sistema de detec\u00e7\u00e3o de primeiro acesso
- [x] Criar steps do tutorial (boas-vindas, adicionar conta, registrar transa\u00e7\u00e3o, criar meta)
- [x] Adicionar controles de navega\u00e7\u00e3o (pr\u00f3ximo, anterior, pular)
- [x] Salvar progresso do tutorial no banco de dados
- [x] Adicionar op\u00e7\u00e3o para reexibir tutorial nas configura\u00e7\u00f5es
## 17. Gr\u00e1ficos e Visualiza\u00e7\u00f5es no Dashboard
- [x] Instalar biblioteca Recharts
- [x] Criar gr\u00e1fico de pizza para despesas por categoria
- [x] Criar gr\u00e1fico de linha para evolu\u00e7\u00e3o do patrim\u00f4nio
- [x] Adicionar APIs backend para buscar dados dos gr\u00e1ficos
- [x] Implementar filtros de per\u00edodo (7 dias, 30 dias, 90 dias)
- [x] Adicionar cores personalizadas para cada categoria
## 18. Bugs Reportados
- [x] Corrigir encoding de caracteres especiais nos títulos dos gráficos

## 19. Modo Escuro Aprimorado
- [x] Habilitar alternância de tema no ThemeProvider
- [x] Adicionar botão de alternância de tema no header/sidebar
- [x] Adaptar cores dos gráficos para modo escuro
- [x] Ajustar cores do tema escuro no index.css
- [x] Garantir contraste adequado em todos os componentes
- [x] Salvar preferência de tema no localStorage (já implementado no ThemeContext)

## 20. Página de Investimentos
- [x] Criar tabela de investimentos no banco de dados
- [x] Criar APIs backend para CRUD de investimentos
- [x] Criar página de Investimentos com listagem
- [x] Implementar formulário para adicionar investimento (ações, fundos, renda fixa)
- [x] Adicionar campos: tipo, nome, quantidade, valor investido, valor atual, data de compra
- [x] Calcular rentabilidade automaticamente (valor atual - valor investido)
- [x] Calcular percentual de rentabilidade
- [x] Mostrar patrimônio total investido
- [x] Adicionar gráfico de distribuição por tipo de investimento
- [x] Adicionar rota no App.tsx
- [x] Atualizar menu do DashboardLayout

## 21. Sistema de Transações Recorrentes
- [x] Criar tabela de transações recorrentes no banco de dados
- [x] Adicionar campos: tipo, valor, categoria, conta, dia do mês, data início/fim
- [x] Criar APIs backend para CRUD de transações recorrentes
- [x] Criar página de Transações Recorrentes
- [x] Implementar formulário para adicionar transação recorrente
- [x] Adicionar funcionalidade de processar transações recorrentes pendentes
- [x] Criar endpoint para verificar e criar transações do mês atual
- [x] Adicionar botão manual para processar transações recorrentes
- [x] Mostrar status de processamento (próxima data, última execução)
- [x] Adicionar rota no App.tsx
- [x] Atualizar menu do DashboardLayout

## 22. Ajustes de Branding e Marketing
- [x] Remover todas as menções a "gratuito" ou "de graça"
- [x] Atualizar logo para o novo arquivo fornecido
- [x] Garantir que todos os textos mencionem "Gestor+"
- [x] Atualizar página Home/Landing page
- [x] Verificar todas as páginas do dashboard

## 23. Bugs Encontrados na Verificação
- [x] Página de Recorrentes dando erro 404 - removida temporariamente (será reimplementada depois)

## 24. Melhorias na Página de Configurações
- [x] Expandir lista de moedas suportadas (30 moedas principais)
- [x] Expandir lista de idiomas suportados (30 idiomas)
- [x] Expandir opções de formato de data (6 formatos)
- [x] Implementar funcionalidade real de alteração de moeda
- [x] Implementar funcionalidade real de alteração de idioma
- [x] Implementar funcionalidade real de alteração de formato de data
- [x] Remover seção "Tutorial Interativo" completamente
- [x] Remover botão "Exportar Dados" da Zona de Perigo
- [x] Implementar funcionalidade real de exclusão de conta
- [x] Adicionar confirmação com digitação de "excluir" para exclusão
- [x] Excluir todos os dados do usuário ao confirmar exclusão

## 25. Implementar Funcionalidades Reais de Preferências
- [x] Salvar preferência de moeda no banco de dados ao selecionar
- [x] Salvar preferência de idioma no banco de dados ao selecionar
- [x] Salvar preferência de formato de data no banco de dados ao selecionar
- [x] Criar contexto React de preferências (PreferencesContext)
- [x] Criar hook usePreferences para acessar preferências globalmente
- [x] Criar função de formatação de moeda baseada na preferência
- [x] Criar função de formatação de data baseada na preferência
- [ ] Aplicar formatação de moeda em todas as páginas (Dashboard, Contas, Cartões, Transações, Orçamentos, Metas, Investimentos) - PENDENTE (contexto criado, aplicar gradualmente)
- [ ] Aplicar formatação de data em todas as páginas - PENDENTE (contexto criado, aplicar gradualmente)
- [x] Testar mudança de moeda e verificar se salva corretamente
- [ ] Testar mudança de formato de data e verificar se salva corretamente
- [ ] Fazer verificação completa de todas as páginas

## 26. Simplificar Opções de Idioma
- [x] Reduzir lista de idiomas para apenas 3: Português (Brasil), English (United States), Español (España)

## 27. Simplificar Configurações
- [x] Remover toda a seção de Preferências (Moeda, Idioma, Formato de Data)
- [x] Manter apenas: Foto de Perfil, Informações Pessoais, Informações da Conta, Zona de Perigo

## 28. Remover Seção de Informações Pessoais
- [x] Remover seção "Informações Pessoais" (Nome, E-mail, Salvar Alterações) das Configurações

## 29. Remover Referências a Manus
- [x] Remover todas as referências a "Manus" no código
- [x] Atualizar ManusDialog para AuthDialog
- [x] Atualizar textos de login para português
- [x] Atualizar chave do localStorage (manus-runtime-user-info → gestor-plus-user-info)
- [x] Atualizar nome do projeto no package.json (financeflow → gestor-plus)
- [x] Garantir que "Gestor+" apareça em todos os lugares

## 30. Atualizar Título da Aplicação
- [x] Alterar título de "FinanceFlow - Gestão Financeira Gratuita" para "Gestor+ - Seu Gestor Financeiro" (via Management UI)
- [x] Verificar e atualizar em todas as páginas
- [x] Atualizar metadados HTML (usa variável de ambiente)
- [x] Instruir usuário a atualizar VITE_APP_TITLE no Management UI

## 31. Remover Seção "Por que 100% Gratuito?" da Landing Page
- [x] Remover linha "✨ Sem anúncios • Sem limitações • Sem custos escondidos"
- [x] Remover toda a seção "Por que 100% Gratuito?" com os três cards
- [x] Verificar se não há outras menções a preço ou "gratuito" (removido "Começar Agora - É Grátis")

## 32. Adicionar Botão "Baixar App" no Menu Lateral
- [x] Adicionar item "Baixar App" no menu lateral (sidebar)
- [x] Criar página/rota /download-app
- [x] Adicionar ícone de smartphone/download ao item do menu
- [x] Criar página com links para Play Store (e futuramente App Store)
- [x] Adicionar badges visuais das lojas (Google Play, App Store)

## 33. Ativar Botão da App Store
- [x] Remover opacidade do card iOS
- [x] Habilitar botão "Baixar na App Store"
- [x] Deixar ambos os cards com aparência igual

## 34. Configurar PWA e Ajustar Download
- [x] Remover card/botão iOS da página de download
- [x] Deixar apenas botão Android (Play Store)
- [x] Criar manifest.json para PWA
- [x] Criar service worker para funcionamento offline
- [x] Adicionar ícones PWA em vários tamanhos (README criado com instruções)
- [x] Esconder menu "Baixar App" quando estiver no PWA
- [x] Criar guia de geração de APK
- [x] Criar guia de publicação na Play Store
