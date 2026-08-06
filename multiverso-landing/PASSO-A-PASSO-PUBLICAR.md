# Publicar na Hostinger + Checkout na Kiwify

Guia completo, na ordem certa. Faça a **Kiwify primeiro**, porque você vai precisar dos links de checkout para colar nas páginas antes de subir.

> **Aviso honesto:** as telas da Hostinger e da Kiwify mudam com frequência. Descrevo pelo **nome das funções**, que muda pouco. Se um botão estiver com outro nome, procure pela palavra-chave que eu destacar.

---

# PARTE 1 — Kiwify

## 1.1 Crie o produto das GRAVAÇÕES primeiro

Parece invertido, mas o order bump só aparece na lista se o produto já existir.

1. Kiwify → **Produtos** → **Criar produto**
2. Tipo: **Curso** (para usar a área de membros) ou **Arquivo** (se for só entregar links)
3. Preencha:

| Campo | Valor |
|---|---|
| Nome | `Passe Premium — Multiverso dos Criativos` |
| Preço | `137,90` |
| Tipo de pagamento | Pagamento único |
| Parcelamento | Até 12x |

4. Em **Garantia**, coloque `7 dias`
5. Salve. **Não publique ainda** — você volta aqui depois.

## 1.2 Crie o produto da IMERSÃO

1. **Produtos** → **Criar produto**
2. Tipo: **Curso**

| Campo | Valor |
|---|---|
| Nome | `Imersão Multiverso dos Criativos` |
| Preço | `19,90` |
| Tipo de pagamento | Pagamento único |
| Garantia | 7 dias |

3. Salve.

## 1.3 Ative o Order Bump

Dentro do produto **Imersão** (o de R$ 19,90):

1. Procure a aba **Checkout** ou **Configurações de checkout**
2. Encontre a seção **Order bump** e ative
3. Em **Produto do order bump**, escolha `Passe Premium`
4. Preencha os textos:

**Título:**
```
☑ SIM! Quero adicionar o Passe Premium por + R$ 137,90
```

**Descrição:**
```
A imersão é ao vivo e não fica disponível depois.

Com o Passe Premium você leva:
• As gravações completas dos 2 dias
• Todos os materiais usados nas aulas
• A biblioteca de prompts exclusivos
• O checklist de execução

Assista quantas vezes quiser por 3 meses, reveja qualquer técnica e não perca
nenhum detalhe — inclusive o que passar rápido demais na hora.
```

5. Salve.

## 1.4 Pegue os dois links de checkout

1. No produto **Imersão** → aba **Checkout** ou **Links** → copie o **link de checkout**
   → Vai ficar mais ou menos assim: `https://pay.kiwify.com.br/xxxxxxxx`
2. Faça o mesmo no produto **Passe Premium**
3. **Guarde os dois em um bloco de notas.** Você vai colar daqui a pouco.

## 1.5 Monte a área de membros

No produto **Imersão**:
- Módulo 1: `Antes de começar` → aula com o **link do Zoom** e o horário
- Módulo 2: `Bônus` → aqui entra o **banner do Passe Premium** (item 1.6)

No produto **Passe Premium**:
- Módulo 1: `Gravações` → suba os dois vídeos depois da imersão
- Módulo 2: `Materiais` → prompts, checklist, templates

## 1.6 Coloque o link da LP2 dentro da área de membros

Esse é o passo que faz a página do Passe Premium funcionar.

Na área de membros do produto **Imersão**, crie uma aula ou banner com:

- **Título:** `⭐ Quer levar tudo gravado?`
- **Botão / link:** `https://SEUDOMINIO.com.br/passe-premium`

Se a Kiwify permitir, coloque também na **página de obrigado** (após a compra). É onde mais converte, porque a pessoa acabou de decidir a favor.

---

# PARTE 2 — Trocar os dados nas páginas

**Faça isso ANTES de subir.** Abra os dois arquivos HTML no Bloco de Notas (ou VS Code) e use `Ctrl + H` (localizar e substituir).

## 2.1 No arquivo `PUBLICAR\index.html`

| Localizar | Substituir por |
|---|---|
| `https://CHECKOUT.com.br/multiverso` | seu link de checkout da imersão |
| `https://SEUDOMINIO.com.br` | seu domínio real |
| `[SUA EMPRESA]` | sua razão social |
| `[00.000.000/0001-00]` | seu CNPJ |
| `SEU@EMAIL.com` | seu e-mail de suporte |
| `SEU NOME AQUI` | seu nome |

## 2.2 No arquivo `PUBLICAR\passe-premium\index.html`

| Localizar | Substituir por |
|---|---|
| `https://CHECKOUT.com.br/passe-premium` | seu link de checkout do passe |
| `https://SEUDOMINIO.com.br` | seu domínio real |
| `[SUA EMPRESA]` | sua razão social |
| `[00.000.000/0001-00]` | seu CNPJ |
| `SEU@EMAIL.com` | seu e-mail |

## 2.3 Confira as datas

Nos dois arquivos, procure por `19 de setembro`, `20 de setembro` e `21 de setembro` e ajuste se a data mudar.

Procure também por:
- `fimInscricoes` (no index.html) — a data do contador
- `inicioImersao` (no passe-premium) — a data do contador

## 2.4 Apague o que você não tem

No `index.html`, se você **ainda não tem depoimentos reais**:
- Procure por `DEPOIMENTO REAL` e apague a seção `<section>` inteira que os contém
- Procure por `[X] alunos` e apague a linha `<div class="prova-linha">`

Prova social inventada é propaganda enganosa (CDC art. 37) e o público reconhece.

---

# PARTE 3 — Subir na Hostinger

## 3.1 Estrutura pronta

Já deixei a pasta `PUBLICAR` montada assim:

```
PUBLICAR/
├── index.html                 ← a landing da imersão
├── assets/                    ← as imagens vão aqui
└── passe-premium/
    └── index.html             ← a landing do passe
```

Com essa estrutura, as URLs ficam limpas:
- `seudominio.com.br` → landing da imersão
- `seudominio.com.br/passe-premium` → landing do passe

## 3.2 Coloque as imagens

Antes de subir, jogue os arquivos dentro de `PUBLICAR\assets\`:
- `capa-multiverso.jpg` (1656×943)
- `og-multiverso.jpg` (1200×630)
- `logo.png` (opcional, fundo transparente)
- `arte-evento.jpg` (1080×1080)

Depois apague o `LEIA-ME.txt` que deixei lá.

## 3.3 Subir pelo painel (mais simples)

1. Entre no **hPanel** da Hostinger
2. Menu **Arquivos** → **Gerenciador de Arquivos**
3. Entre na pasta **`public_html`**
4. **Apague o que estiver lá dentro** (normalmente tem um `default.php` ou `index.html` de exemplo da Hostinger)
5. No seu computador, **selecione o CONTEÚDO da pasta PUBLICAR** — não a pasta em si:
   - `index.html`
   - a pasta `assets`
   - a pasta `passe-premium`
6. Compacte em um **.zip**
7. No Gerenciador de Arquivos, clique em **Upload** e envie o .zip
8. Clique com o botão direito no .zip → **Extrair** (Extract)
9. Apague o .zip depois de extrair

> **Erro mais comum:** subir a pasta `PUBLICAR` inteira. Aí o site fica em `seudominio.com.br/PUBLICAR/` e a home dá erro 404. Suba o **conteúdo**, não a pasta.

## 3.4 Alternativa: FTP

Se preferir, use o **FileZilla**:

1. hPanel → **Arquivos** → **Contas FTP** → anote host, usuário e senha
2. No FileZilla, conecte com esses dados
3. Do lado direito, entre em `public_html`
4. Arraste o conteúdo da pasta `PUBLICAR`

Vantagem: para atualizar depois, é só arrastar o arquivo alterado.

## 3.5 Ative o HTTPS

1. hPanel → **Segurança** → **SSL**
2. Se não tiver certificado, clique em **Instalar SSL** (é gratuito)
3. Ative **Forçar HTTPS**

Sem isso o navegador mostra "Não seguro" e sua conversão despenca.

## 3.6 Teste

Abra no celular e no computador:
- `https://seudominio.com.br`
- `https://seudominio.com.br/passe-premium`

Confira:
- [ ] A capa aparece (se não, o nome do arquivo em `assets` está errado)
- [ ] O contador está rodando
- [ ] O botão verde leva para a Kiwify
- [ ] O cursor foguete aparece no computador
- [ ] No celular não tem barra de rolagem lateral
- [ ] O cadeado de HTTPS está verde

---

# PARTE 4 — Rastreamento (opcional, mas recomendado)

Sem isso você não sabe de onde vêm as vendas.

## 4.1 Pixel do Facebook

1. Pegue o código do pixel no **Gerenciador de Eventos** do Meta
2. Abra os dois arquivos HTML
3. Cole logo **antes** de `</head>`
4. A página já dispara o evento `InitiateCheckout` quando alguém clica no botão verde — não precisa configurar nada a mais

## 4.2 Na Kiwify

Kiwify → produto → **Configurações** → **Pixels e rastreamento**
- Cole o mesmo ID do pixel
- Ative o evento de **compra aprovada**

Assim o Meta fecha o ciclo: clique na landing → compra na Kiwify.

---

# Ordem resumida

1. Criar produto **Passe Premium** na Kiwify (R$ 137,90)
2. Criar produto **Imersão** na Kiwify (R$ 19,90)
3. Ativar o **order bump** dentro da Imersão
4. Copiar os **dois links de checkout**
5. Trocar os placeholders nos dois HTML
6. Colocar as **imagens** em `assets/`
7. Subir o conteúdo de `PUBLICAR` para `public_html`
8. Ativar **SSL**
9. Colocar o link `/passe-premium` **dentro da área de membros**
10. Testar comprando você mesma (dá para estornar depois)

**Faça uma compra teste de verdade.** É a única forma de descobrir se o e-mail de entrega chega, se o order bump aparece e se o acesso é liberado.
