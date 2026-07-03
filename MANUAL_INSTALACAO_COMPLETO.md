# MANUAL COMPLETO - Dashboard Patinetes v17
# COMPLETE MANUAL - Scooter Dashboard v17
# ПОЛНОЕ РУКОВОДСТВО - Панель управления самокатами v17

> **Trilingual / Trilingual / Трёхъязычное руководство**
> Este documento contém instruções em Português, English e Русский.

---

# ========================================================
# PARTE 1 - PORTUGUÊS (PT) 🇧🇷
# ========================================================

---

## 📋 ÍNDICE

1. [Instalação](#pt-instalacao)
2. [Primeira Execução](#pt-primeira-execucao)
3. [Implantação (Deploy)](#pt-implantacao)
4. [Primeiro Login](#pt-primeiro-login)
5. [Configurar Cidades](#pt-configurar-cidades)
6. [Upload de Dados](#pt-upload-dados)
7. [Formatos de Arquivo](#pt-formatos-arquivo)
8. [Usando o Dashboard](#pt-usando-dashboard)
9. [Integração GoJet](#pt-integracao-gojet)
10. [Gerenciamento de Usuários](#pt-gerenciamento-usuarios)
11. [Atualização](#pt-atualizacao)
12. [Solução de Problemas](#pt-solucao-problemas)

---

<a id="pt-instalacao"></a>
## 1. 🔧 INSTALAÇÃO

### Pré-requisitos
- Conta Google (Gmail)
- Navegador atualizado (Chrome recomendado)
- Arquivos do projeto: `Codigo_Dashboard.gs` e `dashboard.html`

### Passo a Passo

**Passo 1 - Criar a Planilha**
1. Acesse [sheets.google.com](https://sheets.google.com)
2. Clique em **"+"** para criar uma nova planilha em branco
3. Renomeie a planilha para: **"Dashboard Movimentacoes Patinetes"**
   - Clique no título "Planilha sem título" no canto superior esquerdo
   - Digite o novo nome e pressione Enter

```
┌──────────────────────────────────────────────────────┐
│  📄 Dashboard Movimentacoes Patinetes                │
│  ┌────────────────────────────────────────────────┐  │
│  │  Arquivo  Editar  Ver  Inserir  Formatar ...   │  │
│  ├────────────────────────────────────────────────┤  │
│  │     A     │     B     │     C     │     D      │  │
│  │           │           │           │            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Passo 2 - Abrir o Editor de Scripts**
1. No menu superior, clique em **Extensões** → **Apps Script**
2. Uma nova aba será aberta com o editor de código

**Passo 3 - Inserir o Código Principal**
1. No editor, você verá um arquivo chamado `Código.gs` com conteúdo padrão
2. **Apague todo o conteúdo** padrão (selecione tudo com Ctrl+A e delete)
3. Abra o arquivo `Codigo_Dashboard.gs` do projeto em um editor de texto
4. Copie **todo** o conteúdo (Ctrl+A, Ctrl+C)
5. Cole no editor do Apps Script (Ctrl+V)

**Passo 4 - Criar o Arquivo HTML**
1. No painel lateral esquerdo do Apps Script, clique no ícone **"+"** ao lado de "Arquivos"
2. Selecione **"HTML"**
3. Nomeie o arquivo como **"dashboard"** (sem a extensão .html - ela é adicionada automaticamente)
4. **Apague todo o conteúdo padrão** do arquivo HTML criado
5. Abra o arquivo `dashboard.html` do projeto
6. Copie **todo** o conteúdo e cole no editor

```
┌─────────────────────────────────────────────┐
│  Apps Script Editor                         │
│  ┌──────────┬──────────────────────────┐    │
│  │ Arquivos │                          │    │
│  │          │  // Cole o código aqui   │    │
│  │ ▶ Código │                          │    │
│  │   .gs    │  function doGet(e) {     │    │
│  │          │    ...                   │    │
│  │ + dashbo │  }                       │    │
│  │   ard.ht │                          │    │
│  │   ml     │                          │    │
│  │          │                          │    │
│  └──────────┴──────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Passo 5 - Salvar**
1. Pressione **Ctrl+S** ou clique no ícone de disquete 💾
2. Verifique se ambos os arquivos foram salvos (sem asterisco no nome)

> ⚠️ **IMPORTANTE:** O nome do arquivo HTML deve ser exatamente **"dashboard"** (minúsculo, sem extensão). O código procura por esse nome específico.

---

<a id="pt-primeira-execucao"></a>
## 2. 🚀 PRIMEIRA EXECUÇÃO

A primeira execução autoriza o script e cria a estrutura da planilha automaticamente.

**Passo 1 - Selecionar a Função**
1. No editor do Apps Script, localize o seletor de funções na barra de ferramentas (dropdown)
2. Clique no dropdown e selecione a função **"autorizar"**

```
┌─────────────────────────────────────────────┐
│  [ autorizar        ▼ ]  [ ▶ Executar ]     │
└─────────────────────────────────────────────┘
```

**Passo 2 - Executar**
1. Clique no botão **▶ Executar** (Run)
2. O Google exibirá um popup: **"Autorização necessária"**

**Passo 3 - Conceder Permissões**
1. Clique em **"Analisar permissões"** / **"Review Permissions"**
2. Selecione sua conta Google
3. ⚠️ Aparecerá um aviso: "Google não verificou este app"
4. Clique em **"Avançado"** / **"Advanced"**
5. Clique em **"Acessar Dashboard Movimentacoes (não seguro)"**
   - Isso é normal para scripts personalizados!
6. Clique em **"Permitir"** / **"Allow"**

```
┌─────────────────────────────────────────────┐
│       ⚠️ Google não verificou este app       │
│                                             │
│  Este app solicita acesso à sua conta...    │
│                                             │
│        [ Avançado ]                         │
│                                             │
│  Acessar Dashboard Movimentacoes            │
│  (não seguro)                               │
│                                             │
│     [ Cancelar ]      [ Permitir ]          │
└─────────────────────────────────────────────┘
```

**Passo 4 - Verificar o Log**
1. Após a execução, verifique o **Log de execução** na parte inferior
2. Você deve ver mensagens como:
   - `"IBGE OK!"`
   - Informações sobre a planilha criada
3. Isso confirma que a estrutura foi criada com sucesso

> 💡 **DICA:** Volte à planilha do Google Sheets. Você verá que novas abas/sheets foram criadas automaticamente (Usuarios, Cidades, Historico, etc.)

---

<a id="pt-implantacao"></a>
## 3. 🌐 IMPLANTAÇÃO (DEPLOY)

**Passo 1 - Iniciar Deploy**
1. No Apps Script, clique em **"Implantar"** → **"Nova implantação"**

**Passo 2 - Configurar**
1. Clique no ícone de engrenagem ⚙️ ao lado de "Selecionar tipo"
2. Selecione **"Aplicativo da Web"**
3. Preencha:
   - **Descrição:** `Dashboard v1`
   - **Executar como:** `Eu` (seu email)
   - **Quem tem acesso:** `Qualquer pessoa`

```
┌─────────────────────────────────────────────┐
│        Nova Implantação                     │
│                                             │
│  Tipo: ⚙️ Aplicativo da Web                │
│                                             │
│  Descrição: [ Dashboard v1              ]   │
│                                             │
│  Executar como: [ Eu (seu@email.com)  ▼ ]   │
│                                             │
│  Quem tem acesso: [ Qualquer pessoa   ▼ ]   │
│                                             │
│              [ Implantar ]                  │
└─────────────────────────────────────────────┘
```

**Passo 3 - Copiar URL**
1. Clique em **"Implantar"**
2. Será exibida a URL do aplicativo web
3. **Copie esta URL** - ela é o link de acesso ao dashboard
4. Abra em uma nova aba do navegador

> ⚠️ **IMPORTANTE:** Guarde esta URL! Ela é o endereço do seu dashboard. Exemplo de formato:
> `https://script.google.com/macros/s/AKfycbx.../exec`

---

<a id="pt-primeiro-login"></a>
## 4. 🔑 PRIMEIRO LOGIN

1. Abra a URL do dashboard no navegador
2. Na tela de login, insira as credenciais padrão:
   - **Usuário:** `admin`
   - **Senha:** `admin123`
3. Clique em **"Entrar"**

```
┌─────────────────────────────────────────────┐
│         🛴 Dashboard Patinetes              │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │  Usuário: [ admin            ]  │      │
│    │  Senha:   [ ********         ]  │      │
│    │                                 │      │
│    │       [ 🔓 Entrar ]            │      │
│    └─────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

> ⚠️ **SEGURANÇA:** Altere a senha imediatamente após o primeiro login!
> 1. Clique no badge do usuário (canto superior direito)
> 2. Clique em **"Alterar Senha"**
> 3. Digite a nova senha e confirme

---

<a id="pt-configurar-cidades"></a>
## 5. 🏙️ CONFIGURAR CIDADES

Antes de carregar dados, é necessário cadastrar as cidades onde sua frota opera.

**Passo 1 - Acessar a aba Cidades**
1. No menu lateral, clique em **"Cidades"**

**Passo 2 - Cadastrar uma Cidade**
1. Selecione o **Estado** no dropdown (lista de UFs brasileiras)
2. Aguarde o carregamento das cidades (via API IBGE)
3. Selecione a **Cidade** desejada
4. Clique em **"Cadastrar Cidade"**

**Passo 3 - Vincular Cidades a Usuários**
1. Na seção inferior da aba Cidades, selecione um usuário
2. Marque as cidades que ele poderá acessar
3. Salve as atribuições

```
┌─────────────────────────────────────────────┐
│  🏙️ CIDADES                                │
│                                             │
│  Estado:  [ SP ▼ ]                          │
│  Cidade:  [ São Paulo           ▼ ]         │
│                                             │
│  [ ➕ Cadastrar Cidade ]                    │
│                                             │
│  Cidades cadastradas:                       │
│  ┌────────────────────────────────────┐     │
│  │ SP - São Paulo          [ 🗑️ ]    │     │
│  │ RJ - Rio de Janeiro     [ 🗑️ ]    │     │
│  │ PR - Curitiba           [ 🗑️ ]    │     │
│  └────────────────────────────────────┘     │
│                                             │
│  📌 Vincular cidades ao usuário:            │
│  Usuário: [ operador1 ▼ ]                   │
│  ☑ SP - São Paulo                           │
│  ☐ RJ - Rio de Janeiro                      │
│  ☑ PR - Curitiba                            │
│  [ 💾 Salvar ]                              │
└─────────────────────────────────────────────┘
```

> 💡 **DICA:** O admin tem acesso a todas as cidades automaticamente. Usuários comuns veem apenas as cidades atribuídas.

---

<a id="pt-upload-dados"></a>
## 6. 📤 UPLOAD DE DADOS

A ordem de upload é importante para o correto funcionamento do dashboard.

### Ordem Correta de Upload

```
  ① Selecionar Data, Estado e Cidade
          │
          ▼
  ② Pontos Monitores (.csv)
          │
          ▼
  ③ Todos os Pontos (.xlsx) OU "Buscar GoJet"
          │
          ▼
  ④ Movimentações (.xlsx) ← dados principais
          │
          ▼
  ⑤ Baterias (.xlsx)
          │
          ▼
  ⑥ Mapa de Zonas (.csv) ← opcional
          │
          ▼
  ⑦ "Salvar no Histórico"
```

**Detalhamento:**

1. **Selecione a Data, Estado e Cidade** nos campos do topo da página
   - A data define o dia dos dados
   - Estado e Cidade definem a localização

2. **Upload de Pontos Monitores** (.csv)
   - Clique em "Pontos Monitores" → selecione o arquivo .csv
   - Define quais pontos são monitorados na operação

3. **Upload de Todos os Pontos** (.xlsx) OU **"Buscar GoJet"**
   - Opção A: faça upload manual do arquivo .xlsx com todos os pontos
   - Opção B: clique em **"Buscar GoJet"** para importar automaticamente da API

4. **Upload de Movimentações** (.xlsx)
   - Este é o arquivo principal com os dados de movimentação dos patinetes
   - Contém informações de deslocamento, alocação e recolhimento

5. **Upload de Baterias** (.xlsx)
   - Dados de troca de bateria dos patinetes

6. **Upload de Mapa de Zonas** (.csv) - *Opcional*
   - Arquivo com polígonos WKT para análise geográfica por zonas

7. **Salvar no Histórico**
   - Clique em **"Salvar no Histórico"** para preservar os dados carregados
   - Isso permite acessá-los futuramente na aba de Histórico

> ⚠️ **IMPORTANTE:** Sempre selecione Data, Estado e Cidade ANTES de fazer uploads. Caso contrário, os dados não serão associados corretamente.

> ⚠️ **IMPORTANTE:** Não esqueça de clicar em "Salvar no Histórico" após o upload. Dados não salvos serão perdidos ao fechar a página.

---

<a id="pt-formatos-arquivo"></a>
## 7. 📁 FORMATOS DE ARQUIVO

### 7.1 Movimentações (.xlsx)
Arquivo exportado do sistema de movimentação de patinetes. Colunas esperadas incluem informações de:
- Identificação do patinete
- Tipo de movimentação (alocação, recolhimento, realocação)
- Ponto de origem e destino
- Horário da movimentação
- Operador responsável

> 💡 **DICA:** O sistema aceita tanto o formato em português quanto o formato russo de colunas de movimentação.

### 7.2 Baterias (.xlsx)
Arquivo de troca de baterias contendo:
- Identificação do patinete
- Nível de bateria anterior e novo
- Data/hora da troca
- Operador

### 7.3 Pontos Monitores (.csv)
Formato com separador ponto-e-vírgula (;). Colunas:
```
city_id;city_name;schedule_id;schedule_name;parking_id;parking_name;lat;lng;capacity
```

Exemplo:
```
1234;São Paulo;1;Manhã;5001;Praça da Sé;-23.5505;-46.6333;15
1234;São Paulo;1;Manhã;5002;Av Paulista;-23.5613;-46.6560;20
```

### 7.4 Todos os Pontos (.xlsx)
Colunas obrigatórias:
```
Nome | LAT | LNG
```

Exemplo:
```
Praça da Sé    | -23.5505 | -46.6333
Av Paulista    | -23.5613 | -46.6560
Parque Ibirapuera | -23.5874 | -46.6576
```

### 7.5 Mapa de Zonas (.csv)
Formato com polígonos WKT (Well-Known Text):
```
nome_zona,wkt
Centro,"POLYGON((-46.64 -23.54, -46.63 -23.54, -46.63 -23.55, -46.64 -23.55, -46.64 -23.54))"
```

---

<a id="pt-usando-dashboard"></a>
## 8. 📊 USANDO O DASHBOARD

### 8.1 Aba Movimentações
Possui sub-abas:

| Sub-aba | Descrição |
|---------|-----------|
| **Dashboard** | KPIs principais, gráficos de pizza e barras (Chart.js) |
| **Pontos** | Tabela detalhada de pontos com status |
| **Mapa** | Mapa interativo com marcadores (Leaflet.js) |
| **Comparativo** | Comparação entre períodos |
| **Eficiência** | Métricas de eficiência operacional |
| **Mapa Movimentos** | Visualização geográfica das movimentações |

### 8.2 Aba Baterias
- Análise de trocas de bateria
- Gráficos de distribuição de nível de bateria
- KPIs de eficiência de troca

### 8.3 Comparativos Múltiplos
- Selecione vários dias do histórico
- Compare métricas entre diferentes datas
- Visualize médias calculadas automaticamente

### 8.4 Aba Funcionários
- Gestão de funcionários/operadores
- Métricas de produtividade por operador

### 8.5 Alternância de Idiomas
No cabeçalho do dashboard há três botões de idioma:
```
[ PT ] [ EN ] [ RU ]
```
- Clique para alternar toda a interface entre Português, Inglês e Russo

### 8.6 Exportação
- **Excel:** Clique no botão de exportação para gerar arquivo .xlsx
- **PDF:** Clique no botão PDF para gerar relatório em formato PDF

---

<a id="pt-integracao-gojet"></a>
## 9. 🔗 INTEGRAÇÃO GOJET

O botão **"Buscar GoJet"** permite importar pontos de estacionamento automaticamente da API GoJet.

**Como usar:**
1. Selecione o **Estado** e a **Cidade** desejados
2. Clique no botão **"Buscar GoJet"**
3. Aguarde o carregamento (pode levar alguns segundos para cidades grandes)
4. Os pontos serão carregados com paginação automática
5. Após o carregamento, os pontos aparecerão na lista

```
  [ Estado: SP ▼ ]  [ Cidade: São Paulo ▼ ]

  [ 🔄 Buscar GoJet ]  ← Clique aqui

  Carregando... ████████░░ 80%

  ✅ 245 pontos carregados com sucesso!
```

> 💡 **DICA:** Se a cidade não retornar pontos, tente variações do nome (ex: "Sao Paulo" em vez de "São Paulo").

> ⚠️ **NOTA:** A integração GoJet requer permissão de UrlFetchApp. Se houver erro 403, execute novamente a função `autorizar()` no Apps Script.

---

<a id="pt-gerenciamento-usuarios"></a>
## 10. 👥 GERENCIAMENTO DE USUÁRIOS

### Perfis de Acesso

| Perfil | Descrição |
|--------|-----------|
| **Admin** | Acesso total, gerencia usuários e todas as cidades |
| **Usuário** | Acesso limitado às cidades atribuídas |

### Criar Novo Usuário (Admin)
1. Acesse a aba **"Funcionários"** ou painel de administração
2. Clique em **"Novo Usuário"**
3. Preencha: nome de usuário, senha, perfil (admin/user)
4. Atribua as cidades permitidas

### Redefinir Senha
- O admin pode redefinir a senha de qualquer usuário
- Cada usuário pode alterar sua própria senha pelo badge do usuário

---

<a id="pt-atualizacao"></a>
## 11. 🔄 ATUALIZAÇÃO

Quando uma nova versão do código estiver disponível:

1. Acesse o **Apps Script** da planilha (Extensões → Apps Script)
2. **Substitua** o conteúdo de `Código.gs` pelo novo `Codigo_Dashboard.gs`
3. **Substitua** o conteúdo de `dashboard.html` pelo novo arquivo
4. Salve tudo (Ctrl+S)
5. Vá em **"Implantar"** → **"Gerenciar implantações"**
6. Clique no ícone de lápis ✏️ (Editar)
7. No campo **"Versão"**, selecione **"Nova versão"**
8. Clique em **"Implantar"**

```
┌─────────────────────────────────────────────┐
│  Gerenciar Implantações                     │
│                                             │
│  Implantação ativa:                         │
│  ┌─────────────────────────────────────┐    │
│  │ Aplicativo da Web          [ ✏️ ]   │    │
│  │ URL: https://script.google...       │    │
│  │ Versão: 1                           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ✏️ Editar:                                 │
│  Versão: [ Nova versão ▼ ]                  │
│  [ Implantar ]                              │
└─────────────────────────────────────────────┘
```

> ⚠️ **IMPORTANTE:** A URL do dashboard NÃO muda ao atualizar a versão. Os usuários continuam usando o mesmo link.

---

<a id="pt-solucao-problemas"></a>
## 12. 🛠️ SOLUÇÃO DE PROBLEMAS

| Problema | Causa | Solução |
|----------|-------|---------|
| Cidades do IBGE não carregam | Permissões não concedidas | Execute a função `autorizar()` no Apps Script |
| GoJet não retorna pontos | Cidade não existe na base GoJet | Tente variações do nome da cidade |
| Erro 403 | Permissão de UrlFetchApp negada | Execute `autorizar()` novamente |
| Sessão expirada | Timeout do Google | Faça login novamente |
| Dados não aparecem no histórico | Dados não foram salvos | Clique em "Salvar no Histórico" após upload |
| "Limpar Tudo" não funciona | Cache do navegador | Atualize a página (F5) após limpar |
| Gráficos não renderizam | Biblioteca Chart.js não carregou | Verifique conexão com internet e recarregue |
| Mapa não aparece | Biblioteca Leaflet não carregou | Verifique conexão com internet e recarregue |
| Upload falha | Formato de arquivo incorreto | Verifique se o arquivo segue o formato esperado (seção 7) |
| Tela branca após login | Erro no código HTML | Verifique o console do navegador (F12) para erros |

> 💡 **DICA GERAL:** Se algo não funcionar, tente na seguinte ordem:
> 1. Atualize a página (F5)
> 2. Faça logout e login novamente
> 3. Execute `autorizar()` no Apps Script
> 4. Verifique o console do navegador (F12 → Console)

---
---
---

# ========================================================
# PART 2 - ENGLISH (EN) 🇬🇧
# ========================================================

---

## 📋 TABLE OF CONTENTS

1. [Installation](#en-installation)
2. [First Run](#en-first-run)
3. [Deployment](#en-deployment)
4. [First Login](#en-first-login)
5. [Setting Up Cities](#en-setting-up-cities)
6. [Uploading Data](#en-uploading-data)
7. [File Formats](#en-file-formats)
8. [Using the Dashboard](#en-using-dashboard)
9. [GoJet Integration](#en-gojet-integration)
10. [User Management](#en-user-management)
11. [Updating](#en-updating)
12. [Troubleshooting](#en-troubleshooting)

---

<a id="en-installation"></a>
## 1. 🔧 INSTALLATION

### Prerequisites
- Google account (Gmail)
- Modern web browser (Chrome recommended)
- Project files: `Codigo_Dashboard.gs` and `dashboard.html`

### Step by Step

**Step 1 - Create the Spreadsheet**
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **"+"** to create a new blank spreadsheet
3. Rename the spreadsheet to: **"Dashboard Movimentacoes Patinetes"**
   - Click on "Untitled spreadsheet" in the top-left corner
   - Type the new name and press Enter

```
┌──────────────────────────────────────────────────────┐
│  📄 Dashboard Movimentacoes Patinetes                │
│  ┌────────────────────────────────────────────────┐  │
│  │  File  Edit  View  Insert  Format  ...         │  │
│  ├────────────────────────────────────────────────┤  │
│  │     A     │     B     │     C     │     D      │  │
│  │           │           │           │            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Step 2 - Open the Script Editor**
1. In the top menu, click **Extensions** → **Apps Script**
2. A new tab will open with the code editor

**Step 3 - Insert the Main Code**
1. In the editor, you will see a file called `Code.gs` with default content
2. **Delete all default content** (select all with Ctrl+A and delete)
3. Open the project file `Codigo_Dashboard.gs` in a text editor
4. Copy **all** content (Ctrl+A, Ctrl+C)
5. Paste into the Apps Script editor (Ctrl+V)

**Step 4 - Create the HTML File**
1. In the left side panel of Apps Script, click the **"+"** icon next to "Files"
2. Select **"HTML"**
3. Name the file **"dashboard"** (without the .html extension - it is added automatically)
4. **Delete all default content** from the created HTML file
5. Open the project file `dashboard.html`
6. Copy **all** content and paste into the editor

```
┌─────────────────────────────────────────────┐
│  Apps Script Editor                         │
│  ┌──────────┬──────────────────────────┐    │
│  │ Files    │                          │    │
│  │          │  // Paste code here      │    │
│  │ ▶ Code   │                          │    │
│  │   .gs    │  function doGet(e) {     │    │
│  │          │    ...                   │    │
│  │ + dashbo │  }                       │    │
│  │   ard.ht │                          │    │
│  │   ml     │                          │    │
│  │          │                          │    │
│  └──────────┴──────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Step 5 - Save**
1. Press **Ctrl+S** or click the save icon 💾
2. Verify both files were saved (no asterisk next to the name)

> ⚠️ **IMPORTANT:** The HTML file name must be exactly **"dashboard"** (lowercase, no extension). The code looks for this specific name.

---

<a id="en-first-run"></a>
## 2. 🚀 FIRST RUN

The first run authorizes the script and creates the spreadsheet structure automatically.

**Step 1 - Select the Function**
1. In the Apps Script editor, locate the function selector in the toolbar (dropdown)
2. Click the dropdown and select the function **"autorizar"**

```
┌─────────────────────────────────────────────┐
│  [ autorizar        ▼ ]  [ ▶ Run ]          │
└─────────────────────────────────────────────┘
```

**Step 2 - Execute**
1. Click the **▶ Run** button
2. Google will display a popup: **"Authorization Required"**

**Step 3 - Grant Permissions**
1. Click **"Review Permissions"**
2. Select your Google account
3. ⚠️ A warning will appear: "Google hasn't verified this app"
4. Click **"Advanced"**
5. Click **"Go to Dashboard Movimentacoes (unsafe)"**
   - This is normal for custom scripts!
6. Click **"Allow"**

```
┌─────────────────────────────────────────────┐
│     ⚠️ Google hasn't verified this app       │
│                                             │
│  This app requests access to your           │
│  account...                                 │
│                                             │
│        [ Advanced ]                         │
│                                             │
│  Go to Dashboard Movimentacoes              │
│  (unsafe)                                   │
│                                             │
│     [ Cancel ]        [ Allow ]             │
└─────────────────────────────────────────────┘
```

**Step 4 - Check the Log**
1. After execution, check the **Execution log** at the bottom
2. You should see messages such as:
   - `"IBGE OK!"`
   - Information about the created spreadsheet
3. This confirms the structure was created successfully

> 💡 **TIP:** Go back to the Google Sheets spreadsheet. You will see that new tabs/sheets were created automatically (Usuarios, Cidades, Historico, etc.)

---

<a id="en-deployment"></a>
## 3. 🌐 DEPLOYMENT

**Step 1 - Start Deploy**
1. In Apps Script, click **"Deploy"** → **"New deployment"**

**Step 2 - Configure**
1. Click the gear icon ⚙️ next to "Select type"
2. Select **"Web app"**
3. Fill in:
   - **Description:** `Dashboard v1`
   - **Execute as:** `Me` (your email)
   - **Who has access:** `Anyone`

```
┌─────────────────────────────────────────────┐
│        New Deployment                       │
│                                             │
│  Type: ⚙️ Web app                           │
│                                             │
│  Description: [ Dashboard v1            ]   │
│                                             │
│  Execute as: [ Me (your@email.com)    ▼ ]   │
│                                             │
│  Who has access: [ Anyone             ▼ ]   │
│                                             │
│              [ Deploy ]                     │
└─────────────────────────────────────────────┘
```

**Step 3 - Copy URL**
1. Click **"Deploy"**
2. The web app URL will be displayed
3. **Copy this URL** - it is the access link to the dashboard
4. Open it in a new browser tab

> ⚠️ **IMPORTANT:** Save this URL! It is the address of your dashboard. Example format:
> `https://script.google.com/macros/s/AKfycbx.../exec`

---

<a id="en-first-login"></a>
## 4. 🔑 FIRST LOGIN

1. Open the dashboard URL in the browser
2. On the login screen, enter the default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Click **"Entrar"** (Login)

```
┌─────────────────────────────────────────────┐
│         🛴 Dashboard Patinetes              │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │  User:     [ admin           ]  │      │
│    │  Password: [ ********        ]  │      │
│    │                                 │      │
│    │       [ 🔓 Login ]             │      │
│    └─────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

> ⚠️ **SECURITY:** Change your password immediately after the first login!
> 1. Click the user badge (top-right corner)
> 2. Click **"Alterar Senha"** (Change Password)
> 3. Enter your new password and confirm

---

<a id="en-setting-up-cities"></a>
## 5. 🏙️ SETTING UP CITIES

Before loading data, you need to register the cities where your fleet operates.

**Step 1 - Access the Cities Tab**
1. In the side menu, click **"Cidades"** (Cities)

**Step 2 - Register a City**
1. Select the **Estado** (State) from the dropdown (list of Brazilian states)
2. Wait for cities to load (via IBGE API)
3. Select the desired **Cidade** (City)
4. Click **"Cadastrar Cidade"** (Register City)

**Step 3 - Assign Cities to Users**
1. In the bottom section of the Cities tab, select a user
2. Check the cities they should have access to
3. Save the assignments

> 💡 **TIP:** Admin has access to all cities automatically. Regular users only see data from their assigned cities.

---

<a id="en-uploading-data"></a>
## 6. 📤 UPLOADING DATA

The upload order is important for the dashboard to function correctly.

### Correct Upload Order

```
  ① Select Date, Estado (State), and Cidade (City)
          │
          ▼
  ② Monitor Points (.csv)
          │
          ▼
  ③ All Points (.xlsx) OR click "Buscar GoJet"
          │
          ▼
  ④ Movements file (.xlsx) ← main data
          │
          ▼
  ⑤ Batteries file (.xlsx)
          │
          ▼
  ⑥ Zone Map (.csv) ← optional
          │
          ▼
  ⑦ "Salvar no Histórico" (Save to History)
```

**Detailed Steps:**

1. **Select Date, Estado, and Cidade** at the top of the page
   - The date defines the data day
   - Estado and Cidade define the location

2. **Upload Monitor Points** (.csv)
   - Click "Pontos Monitores" → select the .csv file
   - Defines which points are monitored in the operation

3. **Upload All Points** (.xlsx) OR **"Buscar GoJet"**
   - Option A: manually upload the .xlsx file with all points
   - Option B: click **"Buscar GoJet"** to import automatically from the API

4. **Upload Movements** (.xlsx)
   - This is the main file with scooter movement data
   - Contains displacement, allocation, and collection information

5. **Upload Batteries** (.xlsx)
   - Scooter battery swap data

6. **Upload Zone Map** (.csv) - *Optional*
   - File with WKT polygons for geographic zone analysis

7. **Save to History**
   - Click **"Salvar no Histórico"** to preserve the loaded data
   - This allows accessing them later in the History tab

> ⚠️ **IMPORTANT:** Always select Date, Estado, and Cidade BEFORE uploading files. Otherwise, the data will not be associated correctly.

> ⚠️ **IMPORTANT:** Do not forget to click "Salvar no Histórico" after uploading. Unsaved data will be lost when you close the page.

---

<a id="en-file-formats"></a>
## 7. 📁 FILE FORMATS

### 7.1 Movements (.xlsx)
File exported from the scooter movement system. Expected columns include:
- Scooter identification
- Movement type (allocation, collection, reallocation)
- Origin and destination points
- Movement timestamp
- Responsible operator

> 💡 **TIP:** The system accepts both Portuguese and Russian column formats for movement data.

### 7.2 Batteries (.xlsx)
Battery swap file containing:
- Scooter identification
- Previous and new battery level
- Swap date/time
- Operator

### 7.3 Monitor Points (.csv)
Semicolon-separated format (;). Columns:
```
city_id;city_name;schedule_id;schedule_name;parking_id;parking_name;lat;lng;capacity
```

Example:
```
1234;São Paulo;1;Morning;5001;Praça da Sé;-23.5505;-46.6333;15
1234;São Paulo;1;Morning;5002;Av Paulista;-23.5613;-46.6560;20
```

### 7.4 All Points (.xlsx)
Required columns:
```
Nome | LAT | LNG
```

Example:
```
Praça da Sé       | -23.5505 | -46.6333
Av Paulista       | -23.5613 | -46.6560
Parque Ibirapuera | -23.5874 | -46.6576
```

### 7.5 Zone Map (.csv)
Format with WKT (Well-Known Text) polygons:
```
zone_name,wkt
Downtown,"POLYGON((-46.64 -23.54, -46.63 -23.54, -46.63 -23.55, -46.64 -23.55, -46.64 -23.54))"
```

---

<a id="en-using-dashboard"></a>
## 8. 📊 USING THE DASHBOARD

### 8.1 Movements Tab
Has the following sub-tabs:

| Sub-tab | Description |
|---------|-------------|
| **Dashboard** | Main KPIs, pie and bar charts (Chart.js) |
| **Pontos** | Detailed point table with status |
| **Mapa** | Interactive map with markers (Leaflet.js) |
| **Comparativo** | Period comparison |
| **Eficiência** | Operational efficiency metrics |
| **Mapa Movimentos** | Geographic visualization of movements |

### 8.2 Batteries Tab
- Battery swap analysis
- Battery level distribution charts
- Swap efficiency KPIs

### 8.3 Multi-Day Comparisons
- Select multiple days from history
- Compare metrics across different dates
- View automatically calculated averages

### 8.4 Employees Tab
- Employee/operator management
- Productivity metrics per operator

### 8.5 Language Toggle
In the dashboard header there are three language buttons:
```
[ PT ] [ EN ] [ RU ]
```
- Click to switch the entire interface between Portuguese, English, and Russian

### 8.6 Export
- **Excel:** Click the export button to generate an .xlsx file
- **PDF:** Click the PDF button to generate a PDF report

---

<a id="en-gojet-integration"></a>
## 9. 🔗 GOJET INTEGRATION

The **"Buscar GoJet"** button allows automatic import of parking points from the GoJet API.

**How to use:**
1. Select the desired **Estado** (State) and **Cidade** (City)
2. Click the **"Buscar GoJet"** button
3. Wait for loading (may take a few seconds for large cities)
4. Points are loaded with automatic pagination
5. After loading, points will appear in the list

```
  [ Estado: SP ▼ ]  [ Cidade: São Paulo ▼ ]

  [ 🔄 Buscar GoJet ]  ← Click here

  Loading... ████████░░ 80%

  ✅ 245 points loaded successfully!
```

> 💡 **TIP:** If a city returns no points, try name variations (e.g., "Sao Paulo" instead of "São Paulo").

> ⚠️ **NOTE:** GoJet integration requires UrlFetchApp permission. If you get a 403 error, run the `autorizar()` function in Apps Script again.

---

<a id="en-user-management"></a>
## 10. 👥 USER MANAGEMENT

### Access Profiles

| Profile | Description |
|---------|-------------|
| **Admin** | Full access, manages users and all cities |
| **User** | Limited access to assigned cities only |

### Create New User (Admin)
1. Go to the **"Funcionários"** (Employees) tab or administration panel
2. Click **"Novo Usuário"** (New User)
3. Fill in: username, password, profile (admin/user)
4. Assign the permitted cities

### Reset Password
- Admin can reset any user's password
- Each user can change their own password through the user badge

---

<a id="en-updating"></a>
## 11. 🔄 UPDATING

When a new version of the code is available:

1. Open **Apps Script** from the spreadsheet (Extensions → Apps Script)
2. **Replace** the content of `Code.gs` with the new `Codigo_Dashboard.gs`
3. **Replace** the content of `dashboard.html` with the new file
4. Save everything (Ctrl+S)
5. Go to **"Deploy"** → **"Manage deployments"**
6. Click the pencil icon ✏️ (Edit)
7. In the **"Version"** field, select **"New version"**
8. Click **"Deploy"**

```
┌─────────────────────────────────────────────┐
│  Manage Deployments                         │
│                                             │
│  Active deployment:                         │
│  ┌─────────────────────────────────────┐    │
│  │ Web app                    [ ✏️ ]   │    │
│  │ URL: https://script.google...       │    │
│  │ Version: 1                          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ✏️ Edit:                                   │
│  Version: [ New version ▼ ]                 │
│  [ Deploy ]                                 │
└─────────────────────────────────────────────┘
```

> ⚠️ **IMPORTANT:** The dashboard URL does NOT change when updating the version. Users continue using the same link.

---

<a id="en-troubleshooting"></a>
## 12. 🛠️ TROUBLESHOOTING

| Problem | Cause | Solution |
|---------|-------|----------|
| IBGE cities not loading | Permissions not granted | Run the `autorizar()` function in Apps Script |
| GoJet returns no points | City may not exist in GoJet | Try variations of the city name |
| 403 error | UrlFetchApp permission denied | Run `autorizar()` again |
| Session expired | Google timeout | Log in again |
| Data not showing in history | Data was not saved | Click "Salvar no Histórico" after uploading |
| "Limpar Tudo" not working | Browser cache | Refresh the page (F5) after clearing |
| Charts not rendering | Chart.js library not loaded | Check internet connection and reload |
| Map not displaying | Leaflet library not loaded | Check internet connection and reload |
| Upload fails | Incorrect file format | Verify the file follows the expected format (section 7) |
| White screen after login | Error in HTML code | Check browser console (F12) for errors |

> 💡 **GENERAL TIP:** If something is not working, try in this order:
> 1. Refresh the page (F5)
> 2. Log out and log in again
> 3. Run `autorizar()` in Apps Script
> 4. Check the browser console (F12 → Console)

---
---
---

# ========================================================
# ЧАСТЬ 3 - РУССКИЙ (RU) 🇷🇺
# ========================================================

---

## 📋 СОДЕРЖАНИЕ

1. [Установка](#ru-installation)
2. [Первый запуск](#ru-first-run)
3. [Развёртывание](#ru-deployment)
4. [Первый вход](#ru-first-login)
5. [Настройка городов](#ru-cities)
6. [Загрузка данных](#ru-upload)
7. [Форматы файлов](#ru-file-formats)
8. [Использование панели](#ru-using-dashboard)
9. [Интеграция GoJet](#ru-gojet)
10. [Управление пользователями](#ru-users)
11. [Обновление](#ru-updating)
12. [Устранение неполадок](#ru-troubleshooting)

---

<a id="ru-installation"></a>
## 1. 🔧 УСТАНОВКА

### Предварительные требования
- Аккаунт Google (Gmail)
- Современный браузер (рекомендуется Chrome)
- Файлы проекта: `Codigo_Dashboard.gs` и `dashboard.html`

### Пошаговая инструкция

**Шаг 1 - Создание таблицы**
1. Откройте [sheets.google.com](https://sheets.google.com)
2. Нажмите **"+"** для создания новой пустой таблицы
3. Переименуйте таблицу в: **"Dashboard Movimentacoes Patinetes"**
   - Нажмите на заголовок "Новая таблица" в левом верхнем углу
   - Введите новое имя и нажмите Enter

```
┌──────────────────────────────────────────────────────┐
│  📄 Dashboard Movimentacoes Patinetes                │
│  ┌────────────────────────────────────────────────┐  │
│  │  Файл  Правка  Вид  Вставка  Формат  ...      │  │
│  ├────────────────────────────────────────────────┤  │
│  │     A     │     B     │     C     │     D      │  │
│  │           │           │           │            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Шаг 2 - Открытие редактора скриптов**
1. В верхнем меню нажмите **Расширения** → **Apps Script**
2. Откроется новая вкладка с редактором кода

**Шаг 3 - Вставка основного кода**
1. В редакторе вы увидите файл `Код.gs` с содержимым по умолчанию
2. **Удалите всё содержимое** по умолчанию (выделите всё Ctrl+A и удалите)
3. Откройте файл проекта `Codigo_Dashboard.gs` в текстовом редакторе
4. Скопируйте **всё** содержимое (Ctrl+A, Ctrl+C)
5. Вставьте в редактор Apps Script (Ctrl+V)

**Шаг 4 - Создание HTML-файла**
1. На левой панели Apps Script нажмите значок **"+"** рядом с "Файлы"
2. Выберите **"HTML"**
3. Назовите файл **"dashboard"** (без расширения .html - оно добавляется автоматически)
4. **Удалите всё содержимое по умолчанию** из созданного HTML-файла
5. Откройте файл проекта `dashboard.html`
6. Скопируйте **всё** содержимое и вставьте в редактор

```
┌─────────────────────────────────────────────┐
│  Редактор Apps Script                       │
│  ┌──────────┬──────────────────────────┐    │
│  │ Файлы   │                          │    │
│  │          │  // Вставьте код сюда    │    │
│  │ ▶ Код    │                          │    │
│  │   .gs    │  function doGet(e) {     │    │
│  │          │    ...                   │    │
│  │ + dashbo │  }                       │    │
│  │   ard.ht │                          │    │
│  │   ml     │                          │    │
│  │          │                          │    │
│  └──────────┴──────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Шаг 5 - Сохранение**
1. Нажмите **Ctrl+S** или нажмите значок сохранения 💾
2. Убедитесь, что оба файла сохранены (нет звёздочки рядом с именем)

> ⚠️ **ВАЖНО:** Имя HTML-файла должно быть точно **"dashboard"** (строчными буквами, без расширения). Код ищет именно это имя.

---

<a id="ru-first-run"></a>
## 2. 🚀 ПЕРВЫЙ ЗАПУСК

Первый запуск авторизует скрипт и автоматически создаёт структуру таблицы.

**Шаг 1 - Выбор функции**
1. В редакторе Apps Script найдите выпадающий список функций на панели инструментов
2. Нажмите на список и выберите функцию **"autorizar"**

```
┌─────────────────────────────────────────────┐
│  [ autorizar        ▼ ]  [ ▶ Выполнить ]   │
└─────────────────────────────────────────────┘
```

**Шаг 2 - Выполнение**
1. Нажмите кнопку **▶ Выполнить** (Run)
2. Google покажет всплывающее окно: **"Требуется авторизация"**

**Шаг 3 - Предоставление разрешений**
1. Нажмите **"Просмотреть разрешения"**
2. Выберите свой аккаунт Google
3. ⚠️ Появится предупреждение: "Приложение не проверено Google"
4. Нажмите **"Дополнительно"** / **"Advanced"**
5. Нажмите **"Перейти на страницу Dashboard Movimentacoes (небезопасно)"**
   - Это нормально для пользовательских скриптов!
6. Нажмите **"Разрешить"** / **"Allow"**

```
┌─────────────────────────────────────────────┐
│   ⚠️ Приложение не проверено Google          │
│                                             │
│  Это приложение запрашивает доступ к        │
│  вашему аккаунту...                         │
│                                             │
│        [ Дополнительно ]                    │
│                                             │
│  Перейти на страницу Dashboard              │
│  Movimentacoes (небезопасно)                │
│                                             │
│     [ Отмена ]       [ Разрешить ]          │
└─────────────────────────────────────────────┘
```

**Шаг 4 - Проверка журнала**
1. После выполнения проверьте **Журнал выполнения** внизу
2. Вы должны увидеть сообщения:
   - `"IBGE OK!"`
   - Информация о созданной таблице
3. Это подтверждает успешное создание структуры

> 💡 **СОВЕТ:** Вернитесь к таблице Google Sheets. Вы увидите, что новые вкладки/листы были созданы автоматически (Usuarios, Cidades, Historico и т.д.)

---

<a id="ru-deployment"></a>
## 3. 🌐 РАЗВЁРТЫВАНИЕ (DEPLOY)

**Шаг 1 - Начало развёртывания**
1. В Apps Script нажмите **"Развернуть"** / **"Deploy"** → **"Новое развёртывание"** / **"New deployment"**

**Шаг 2 - Настройка**
1. Нажмите значок шестерёнки ⚙️ рядом с "Выберите тип"
2. Выберите **"Веб-приложение"** / **"Web app"**
3. Заполните:
   - **Описание:** `Dashboard v1`
   - **Запуск от имени:** `Я` (ваш email)
   - **Доступ:** `Все` / `Anyone`

```
┌─────────────────────────────────────────────┐
│        Новое развёртывание                  │
│                                             │
│  Тип: ⚙️ Веб-приложение                    │
│                                             │
│  Описание: [ Dashboard v1              ]    │
│                                             │
│  Запуск от имени: [ Я (ваш@email.com) ▼ ]  │
│                                             │
│  Доступ: [ Все                        ▼ ]   │
│                                             │
│            [ Развернуть ]                   │
└─────────────────────────────────────────────┘
```

**Шаг 3 - Копирование URL**
1. Нажмите **"Развернуть"** / **"Deploy"**
2. Будет показан URL веб-приложения
3. **Скопируйте этот URL** - это ссылка для доступа к панели
4. Откройте в новой вкладке браузера

> ⚠️ **ВАЖНО:** Сохраните этот URL! Это адрес вашей панели управления. Пример формата:
> `https://script.google.com/macros/s/AKfycbx.../exec`

---

<a id="ru-first-login"></a>
## 4. 🔑 ПЕРВЫЙ ВХОД

1. Откройте URL панели управления в браузере
2. На экране входа введите стандартные учётные данные:
   - **Пользователь:** `admin`
   - **Пароль:** `admin123`
3. Нажмите **"Entrar"** (Войти)

```
┌─────────────────────────────────────────────┐
│         🛴 Dashboard Patinetes              │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │  Пользователь: [ admin       ]  │      │
│    │  Пароль:       [ ********    ]  │      │
│    │                                 │      │
│    │       [ 🔓 Войти ]             │      │
│    └─────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

> ⚠️ **БЕЗОПАСНОСТЬ:** Измените пароль сразу после первого входа!
> 1. Нажмите на значок пользователя (правый верхний угол)
> 2. Нажмите **"Alterar Senha"** (Изменить пароль)
> 3. Введите новый пароль и подтвердите

---

<a id="ru-cities"></a>
## 5. 🏙️ НАСТРОЙКА ГОРОДОВ

Перед загрузкой данных необходимо зарегистрировать города, в которых работает ваш парк самокатов.

**Шаг 1 - Переход на вкладку "Города"**
1. В боковом меню нажмите **"Cidades"** (Города)

**Шаг 2 - Регистрация города**
1. Выберите **Estado** (штат) из выпадающего списка (список штатов Бразилии)
2. Дождитесь загрузки городов (через API IBGE)
3. Выберите нужный **Cidade** (город)
4. Нажмите **"Cadastrar Cidade"** (Зарегистрировать город)

**Шаг 3 - Привязка городов к пользователям**
1. В нижней части вкладки "Города" выберите пользователя
2. Отметьте города, к которым он должен иметь доступ
3. Сохраните назначения

```
┌─────────────────────────────────────────────┐
│  🏙️ ГОРОДА                                 │
│                                             │
│  Штат:   [ SP ▼ ]                           │
│  Город:  [ São Paulo           ▼ ]          │
│                                             │
│  [ ➕ Зарегистрировать город ]              │
│                                             │
│  Зарегистрированные города:                 │
│  ┌────────────────────────────────────┐     │
│  │ SP - São Paulo          [ 🗑️ ]    │     │
│  │ RJ - Rio de Janeiro     [ 🗑️ ]    │     │
│  │ PR - Curitiba           [ 🗑️ ]    │     │
│  └────────────────────────────────────┘     │
│                                             │
│  📌 Привязать города к пользователю:        │
│  Пользователь: [ operador1 ▼ ]              │
│  ☑ SP - São Paulo                           │
│  ☐ RJ - Rio de Janeiro                      │
│  ☑ PR - Curitiba                            │
│  [ 💾 Сохранить ]                           │
└─────────────────────────────────────────────┘
```

> 💡 **СОВЕТ:** Администратор автоматически имеет доступ ко всем городам. Обычные пользователи видят только данные назначенных им городов.

---

<a id="ru-upload"></a>
## 6. 📤 ЗАГРУЗКА ДАННЫХ

Порядок загрузки важен для корректной работы панели управления.

### Правильный порядок загрузки

```
  ① Выбрать Дату, Штат (Estado) и Город (Cidade)
          │
          ▼
  ② Точки мониторинга (.csv)
          │
          ▼
  ③ Все точки (.xlsx) ИЛИ нажать "Buscar GoJet"
          │
          ▼
  ④ Перемещения (.xlsx) ← основные данные
          │
          ▼
  ⑤ Батареи (.xlsx)
          │
          ▼
  ⑥ Карта зон (.csv) ← необязательно
          │
          ▼
  ⑦ "Salvar no Histórico" (Сохранить в историю)
```

**Подробные шаги:**

1. **Выберите Дату, Штат и Город** в полях в верхней части страницы
   - Дата определяет день данных
   - Штат и Город определяют местоположение

2. **Загрузка точек мониторинга** (.csv)
   - Нажмите "Pontos Monitores" → выберите файл .csv
   - Определяет, какие точки контролируются в операции

3. **Загрузка всех точек** (.xlsx) ИЛИ **"Buscar GoJet"**
   - Вариант А: загрузите вручную файл .xlsx со всеми точками
   - Вариант Б: нажмите **"Buscar GoJet"** для автоматического импорта из API

4. **Загрузка перемещений** (.xlsx)
   - Это основной файл с данными о перемещении самокатов
   - Содержит информацию о перемещении, распределении и сборе

5. **Загрузка батарей** (.xlsx)
   - Данные о замене батарей самокатов

6. **Загрузка карты зон** (.csv) - *Необязательно*
   - Файл с полигонами WKT для географического анализа по зонам

7. **Сохранение в историю**
   - Нажмите **"Salvar no Histórico"** для сохранения загруженных данных
   - Это позволяет получить к ним доступ позже на вкладке "История"

> ⚠️ **ВАЖНО:** Всегда выбирайте Дату, Штат и Город ПЕРЕД загрузкой файлов. В противном случае данные не будут правильно связаны.

> ⚠️ **ВАЖНО:** Не забудьте нажать "Salvar no Histórico" после загрузки. Несохранённые данные будут потеряны при закрытии страницы.

---

<a id="ru-file-formats"></a>
## 7. 📁 ФОРМАТЫ ФАЙЛОВ

### 7.1 Перемещения (.xlsx)
Файл, экспортированный из системы управления перемещениями самокатов. Ожидаемые столбцы включают:
- Идентификация самоката
- Тип перемещения (распределение, сбор, перераспределение)
- Точка отправления и назначения
- Время перемещения
- Ответственный оператор

> 💡 **СОВЕТ:** Система принимает как португальский, так и русский формат столбцов для данных о перемещениях.

### 7.2 Батареи (.xlsx)
Файл замены батарей, содержащий:
- Идентификация самоката
- Предыдущий и новый уровень заряда батареи
- Дата/время замены
- Оператор

### 7.3 Точки мониторинга (.csv)
Формат с разделителем точка с запятой (;). Столбцы:
```
city_id;city_name;schedule_id;schedule_name;parking_id;parking_name;lat;lng;capacity
```

Пример:
```
1234;São Paulo;1;Manhã;5001;Praça da Sé;-23.5505;-46.6333;15
1234;São Paulo;1;Manhã;5002;Av Paulista;-23.5613;-46.6560;20
```

### 7.4 Все точки (.xlsx)
Обязательные столбцы:
```
Nome | LAT | LNG
```

Пример:
```
Praça da Sé       | -23.5505 | -46.6333
Av Paulista       | -23.5613 | -46.6560
Parque Ibirapuera | -23.5874 | -46.6576
```

### 7.5 Карта зон (.csv)
Формат с полигонами WKT (Well-Known Text):
```
nome_zona,wkt
Centro,"POLYGON((-46.64 -23.54, -46.63 -23.54, -46.63 -23.55, -46.64 -23.55, -46.64 -23.54))"
```

---

<a id="ru-using-dashboard"></a>
## 8. 📊 ИСПОЛЬЗОВАНИЕ ПАНЕЛИ УПРАВЛЕНИЯ

### 8.1 Вкладка "Перемещения" (Movimentações)
Содержит подвкладки:

| Подвкладка | Описание |
|------------|----------|
| **Dashboard** | Основные KPI, круговые и столбчатые диаграммы (Chart.js) |
| **Pontos** | Подробная таблица точек со статусом |
| **Mapa** | Интерактивная карта с маркерами (Leaflet.js) |
| **Comparativo** | Сравнение по периодам |
| **Eficiência** | Метрики операционной эффективности |
| **Mapa Movimentos** | Географическая визуализация перемещений |

### 8.2 Вкладка "Батареи" (Baterias)
- Анализ замены батарей
- Диаграммы распределения уровня заряда
- KPI эффективности замены

### 8.3 Множественные сравнения (Comparativos Múltiplos)
- Выберите несколько дней из истории
- Сравните метрики между разными датами
- Просмотрите автоматически рассчитанные средние значения

### 8.4 Вкладка "Сотрудники" (Funcionários)
- Управление сотрудниками/операторами
- Метрики производительности по операторам

### 8.5 Переключение языка
В заголовке панели управления расположены три кнопки выбора языка:
```
[ PT ] [ EN ] [ RU ]
```
- Нажмите для переключения интерфейса между португальским, английским и русским языками

### 8.6 Экспорт
- **Excel:** Нажмите кнопку экспорта для создания файла .xlsx
- **PDF:** Нажмите кнопку PDF для создания отчёта в формате PDF

---

<a id="ru-gojet"></a>
## 9. 🔗 ИНТЕГРАЦИЯ GOJET

Кнопка **"Buscar GoJet"** позволяет автоматически импортировать парковочные точки из API GoJet.

**Как использовать:**
1. Выберите нужный **Штат** (Estado) и **Город** (Cidade)
2. Нажмите кнопку **"Buscar GoJet"**
3. Дождитесь загрузки (может занять несколько секунд для крупных городов)
4. Точки загружаются с автоматической пагинацией
5. После загрузки точки появятся в списке

```
  [ Штат: SP ▼ ]  [ Город: São Paulo ▼ ]

  [ 🔄 Buscar GoJet ]  ← Нажмите здесь

  Загрузка... ████████░░ 80%

  ✅ 245 точек загружено успешно!
```

> 💡 **СОВЕТ:** Если город не возвращает точек, попробуйте варианты написания названия (например, "Sao Paulo" вместо "São Paulo").

> ⚠️ **ПРИМЕЧАНИЕ:** Интеграция GoJet требует разрешения UrlFetchApp. При ошибке 403 снова запустите функцию `autorizar()` в Apps Script.

---

<a id="ru-users"></a>
## 10. 👥 УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ

### Профили доступа

| Профиль | Описание |
|---------|----------|
| **Admin** | Полный доступ, управление пользователями и всеми городами |
| **User (Пользователь)** | Ограниченный доступ только к назначенным городам |

### Создание нового пользователя (Администратор)
1. Перейдите на вкладку **"Funcionários"** (Сотрудники) или панель администрирования
2. Нажмите **"Novo Usuário"** (Новый пользователь)
3. Заполните: имя пользователя, пароль, профиль (admin/user)
4. Назначьте разрешённые города

### Сброс пароля
- Администратор может сбросить пароль любого пользователя
- Каждый пользователь может изменить свой собственный пароль через значок пользователя

---

<a id="ru-updating"></a>
## 11. 🔄 ОБНОВЛЕНИЕ

Когда доступна новая версия кода:

1. Откройте **Apps Script** из таблицы (Расширения → Apps Script)
2. **Замените** содержимое `Код.gs` новым `Codigo_Dashboard.gs`
3. **Замените** содержимое `dashboard.html` новым файлом
4. Сохраните всё (Ctrl+S)
5. Перейдите в **"Развернуть"** / **"Deploy"** → **"Управление развёртываниями"** / **"Manage deployments"**
6. Нажмите значок карандаша ✏️ (Редактировать)
7. В поле **"Версия"** выберите **"Новая версия"** / **"New version"**
8. Нажмите **"Развернуть"** / **"Deploy"**

```
┌─────────────────────────────────────────────┐
│  Управление развёртываниями                 │
│                                             │
│  Активное развёртывание:                    │
│  ┌─────────────────────────────────────┐    │
│  │ Веб-приложение             [ ✏️ ]   │    │
│  │ URL: https://script.google...       │    │
│  │ Версия: 1                           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ✏️ Редактировать:                          │
│  Версия: [ Новая версия ▼ ]                 │
│  [ Развернуть ]                             │
└─────────────────────────────────────────────┘
```

> ⚠️ **ВАЖНО:** URL панели управления НЕ меняется при обновлении версии. Пользователи продолжают использовать ту же ссылку.

---

<a id="ru-troubleshooting"></a>
## 12. 🛠️ УСТРАНЕНИЕ НЕПОЛАДОК

| Проблема | Причина | Решение |
|----------|---------|---------|
| Города IBGE не загружаются | Разрешения не предоставлены | Запустите функцию `autorizar()` в Apps Script |
| GoJet не возвращает точек | Город может не существовать в GoJet | Попробуйте варианты написания названия города |
| Ошибка 403 | Разрешение UrlFetchApp отклонено | Снова запустите `autorizar()` |
| Сессия истекла | Тайм-аут Google | Войдите снова |
| Данные не отображаются в истории | Данные не были сохранены | Нажмите "Salvar no Histórico" после загрузки |
| "Limpar Tudo" не работает | Кэш браузера | Обновите страницу (F5) после очистки |
| Диаграммы не отображаются | Библиотека Chart.js не загрузилась | Проверьте подключение к интернету и перезагрузите |
| Карта не отображается | Библиотека Leaflet не загрузилась | Проверьте подключение к интернету и перезагрузите |
| Загрузка не удалась | Неправильный формат файла | Проверьте, соответствует ли файл ожидаемому формату (раздел 7) |
| Белый экран после входа | Ошибка в HTML-коде | Проверьте консоль браузера (F12) на наличие ошибок |

> 💡 **ОБЩИЙ СОВЕТ:** Если что-то не работает, попробуйте в следующем порядке:
> 1. Обновите страницу (F5)
> 2. Выйдите и войдите снова
> 3. Запустите `autorizar()` в Apps Script
> 4. Проверьте консоль браузера (F12 → Console)

---
---
---

# ========================================================
# QUICK REFERENCE / REFERÊNCIA RÁPIDA / КРАТКИЙ СПРАВОЧНИК
# ========================================================

## Default Credentials / Credenciais Padrão / Учётные данные по умолчанию

| | |
|---|---|
| **User / Usuário / Пользователь** | `admin` |
| **Password / Senha / Пароль** | `admin123` |

## Upload Order / Ordem de Upload / Порядок загрузки

```
1. Date + State + City    |  Data + Estado + Cidade    |  Дата + Штат + Город
2. Monitor Points (.csv)  |  Pontos Monitores (.csv)   |  Точки мониторинга (.csv)
3. All Points (.xlsx)     |  Todos os Pontos (.xlsx)   |  Все точки (.xlsx)
   OR GoJet               |  OU GoJet                  |  ИЛИ GoJet
4. Movements (.xlsx)      |  Movimentações (.xlsx)     |  Перемещения (.xlsx)
5. Batteries (.xlsx)      |  Baterias (.xlsx)          |  Батареи (.xlsx)
6. Zone Map (.csv)        |  Mapa Zonas (.csv)         |  Карта зон (.csv)
7. Save to History        |  Salvar no Histórico       |  Сохранить в историю
```

## Key Functions / Funções Chave / Ключевые функции

| Function | Purpose | Função | Назначение |
|----------|---------|--------|------------|
| `autorizar()` | First-time setup & permissions | Configuração inicial | Первоначальная настройка |
| `doGet(e)` | Serves the web app | Serve o aplicativo web | Обслуживает веб-приложение |

---

> **Dashboard Patinetes v17** - Scooter Fleet Management System
>
> Built with: Google Apps Script, Chart.js, Leaflet.js
>
> File formats: .xlsx, .csv
>
> Languages: PT / EN / RU
