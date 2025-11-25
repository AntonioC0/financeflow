# Guia de Geração de APK do Gestor+

Este guia explica como transformar o site Gestor+ (PWA) em um aplicativo Android (APK) pronto para publicação na Google Play Store.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. ✅ **Site hospedado online** com HTTPS (obrigatório)
   - O PWA precisa estar acessível via URL pública
   - Exemplo: `https://gestorplus.com` ou `https://seu-app.onrender.com`

2. ✅ **Certificado SSL válido** (HTTPS)
   - A maioria dos serviços de hospedagem oferece SSL grátis
   - Render.com, Vercel, Netlify já incluem SSL automaticamente

3. ✅ **PWA configurado corretamente**
   - manifest.json presente e acessível
   - Service worker registrado
   - Ícones nos tamanhos corretos

---

## 🎯 Método 1: PWABuilder (Recomendado - Mais Fácil)

O **PWABuilder** é uma ferramenta oficial da Microsoft que gera APKs de PWAs automaticamente.

### Passo 1: Acessar o PWABuilder

1. Abra seu navegador
2. Acesse: https://www.pwabuilder.com
3. Você verá um campo para inserir a URL do seu site

### Passo 2: Analisar o PWA

1. Digite a URL do seu site hospedado
   - Exemplo: `https://gestorplus.com`
2. Clique em **"Start"**
3. Aguarde a análise (30 segundos a 1 minuto)

O PWABuilder vai verificar:
- ✅ Manifest.json válido
- ✅ Service Worker funcionando
- ✅ HTTPS ativo
- ✅ Ícones presentes

### Passo 3: Revisar Informações

Após a análise, você verá:

- **Nome do app** (do manifest.json)
- **Descrição**
- **Ícones** detectados
- **Pontuação** do PWA (quanto maior, melhor)

**Se houver erros:**
- Corrija os problemas indicados
- Atualize o site
- Volte ao Passo 1

### Passo 4: Gerar o Pacote Android

1. Role a página até a seção **"Publish"**
2. Clique no card **"Android"**
3. Clique em **"Store Package"**

Você verá opções de configuração:

#### Configurações Importantes:

| Campo | Valor Recomendado | Descrição |
|-------|-------------------|-----------|
| **Package ID** | `com.gestorplus.app` | Identificador único (não pode mudar depois) |
| **App name** | `Gestor+` | Nome que aparece no celular |
| **Launcher name** | `Gestor+` | Nome do ícone na tela inicial |
| **Theme color** | `#10b981` | Cor principal (do manifest) |
| **Background color** | `#0f172a` | Cor de fundo |
| **Icon URL** | (detectado automaticamente) | Ícone 512x512px |
| **Start URL** | `/` | Página inicial do app |
| **Display mode** | `standalone` | App em tela cheia |

#### Configurações Avançadas (Opcional):

- **Splash screen**: Tela de carregamento inicial
- **Shortcuts**: Atalhos rápidos (já configurados no manifest)
- **Signing key**: Chave de assinatura (gerar nova ou usar existente)

### Passo 5: Gerar Signing Key

A **signing key** é necessária para assinar o APK (obrigatório pela Google).

1. Na seção **"Signing key"**, clique em **"Generate new"**
2. Preencha os campos:
   - **Full name**: Seu nome ou nome da empresa
   - **Organization**: Nome da empresa (ou deixe igual ao nome)
   - **Organization unit**: Desenvolvimento (ou deixe em branco)
   - **Country code**: BR (Brasil)
3. Clique em **"Generate"**

**⚠️ IMPORTANTE:**
- **Guarde a senha** em local seguro
- **Faça backup do arquivo .keystore** que será gerado
- Se perder, não conseguirá atualizar o app depois!

### Passo 6: Baixar o Pacote

1. Clique em **"Build My Package"**
2. Aguarde 1-2 minutos (geração do APK)
3. Clique em **"Download"**

Você receberá um arquivo ZIP contendo:

- **app-release-signed.apk** - APK pronto para publicar
- **assetlinks.json** - Arquivo de verificação (importante!)
- **signing.keystore** - Chave de assinatura (guarde bem!)
- **README.md** - Instruções adicionais

### Passo 7: Configurar Digital Asset Links

Para que o app abra sem mostrar a barra de navegador, você precisa:

1. Extraia o arquivo **assetlinks.json** do ZIP
2. Faça upload para o seu site em:
   ```
   https://seusite.com/.well-known/assetlinks.json
   ```

**Como fazer:**
- Crie a pasta `.well-known` na raiz do site
- Coloque o arquivo `assetlinks.json` dentro dela
- Certifique-se de que está acessível publicamente

**Testar:**
```
https://seusite.com/.well-known/assetlinks.json
```
Deve retornar o conteúdo JSON (não erro 404).

---

## 🎯 Método 2: Bubblewrap (Avançado - Linha de Comando)

O **Bubblewrap** é uma ferramenta de linha de comando do Google para gerar APKs de PWAs.

### Requisitos:

- Node.js instalado (v14 ou superior)
- Java JDK 8 ou superior
- Android SDK (opcional, mas recomendado)

### Passo 1: Instalar Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

### Passo 2: Inicializar Projeto

```bash
bubblewrap init --manifest https://seusite.com/manifest.json
```

Responda as perguntas:
- **Package name**: `com.gestorplus.app`
- **App name**: `Gestor+`
- **Display mode**: `standalone`
- **Orientation**: `portrait`

### Passo 3: Gerar Signing Key

```bash
bubblewrap build
```

Na primeira vez, será solicitado para criar uma signing key. Forneça:
- Senha da chave
- Nome completo
- Organização
- País (BR)

### Passo 4: Build do APK

```bash
bubblewrap build
```

O APK será gerado em:
```
./app-release-signed.apk
```

### Passo 5: Atualizar (Futuras Versões)

```bash
bubblewrap update
bubblewrap build
```

---

## 🧪 Testar o APK Antes de Publicar

### Opção 1: Instalar no Celular Físico

1. **Ative o modo desenvolvedor** no Android:
   - Vá em Configurações → Sobre o telefone
   - Toque 7 vezes em "Número da versão"
   - Volte e entre em "Opções do desenvolvedor"
   - Ative "Depuração USB"

2. **Transfira o APK** para o celular:
   - Via cabo USB
   - Via Google Drive/Dropbox
   - Via e-mail

3. **Instale o APK**:
   - Abra o arquivo APK no celular
   - Permita "Instalar de fontes desconhecidas" se solicitado
   - Toque em "Instalar"

4. **Teste todas as funcionalidades**:
   - Login/Logout
   - Navegação entre páginas
   - Adicionar/Editar/Excluir dados
   - Gráficos e relatórios
   - Modo offline (desconecte o Wi-Fi)

### Opção 2: Emulador Android Studio

1. Instale o Android Studio
2. Crie um dispositivo virtual (AVD)
3. Arraste o APK para o emulador
4. Teste as funcionalidades

---

## ✅ Checklist Antes de Publicar

Antes de enviar para a Play Store, verifique:

- [ ] APK instalado e testado em dispositivo real
- [ ] Todas as funcionalidades funcionando
- [ ] Modo offline funciona (service worker ativo)
- [ ] Ícones aparecem corretamente
- [ ] Splash screen carrega
- [ ] Notificações funcionam (se implementadas)
- [ ] Digital Asset Links configurado (assetlinks.json)
- [ ] Site com HTTPS válido
- [ ] Manifest.json acessível publicamente
- [ ] Service worker registrado corretamente
- [ ] Backup da signing key feito

---

## 🐛 Problemas Comuns

### Erro: "App não abre, fica na splash screen"

**Causa:** Site não está acessível ou HTTPS inválido

**Solução:**
1. Verifique se o site está online
2. Teste a URL no navegador do celular
3. Certifique-se de que o certificado SSL é válido

### Erro: "Manifest.json não encontrado"

**Causa:** Arquivo manifest não está acessível

**Solução:**
1. Acesse `https://seusite.com/manifest.json` no navegador
2. Deve retornar o JSON, não erro 404
3. Verifique se o caminho está correto no index.html

### Erro: "Service Worker não registra"

**Causa:** HTTPS não está ativo ou SW tem erro

**Solução:**
1. Certifique-se de que o site usa HTTPS
2. Abra o console do navegador (F12)
3. Vá na aba "Application" → "Service Workers"
4. Veja se há erros de registro

### Erro: "Ícones não aparecem"

**Causa:** Ícones não foram gerados ou estão no caminho errado

**Solução:**
1. Gere os ícones usando PWABuilder Image Generator
2. Coloque em `/public/icons/`
3. Verifique se os caminhos no manifest.json estão corretos

### Erro: "Digital Asset Links falhou"

**Causa:** Arquivo assetlinks.json não está acessível

**Solução:**
1. Coloque o arquivo em `/.well-known/assetlinks.json`
2. Teste a URL: `https://seusite.com/.well-known/assetlinks.json`
3. Deve retornar JSON, não 404

---

## 📚 Recursos Adicionais

- **PWABuilder**: https://www.pwabuilder.com
- **Bubblewrap**: https://github.com/GoogleChromeLabs/bubblewrap
- **Digital Asset Links**: https://developers.google.com/digital-asset-links
- **Android App Bundle**: https://developer.android.com/guide/app-bundle
- **Play Console**: https://play.google.com/console

---

## 🎉 Próximos Passos

Após gerar o APK com sucesso:

1. ✅ Teste completamente o app
2. ✅ Prepare os materiais de marketing (screenshots, descrição)
3. ✅ Siga o **GUIA_PUBLICACAO_PLAY_STORE.md**
4. ✅ Publique na Google Play Store!

---

**Dúvidas?** Consulte a documentação oficial ou entre em contato com o suporte.
