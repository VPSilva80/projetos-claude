# Multiverso dos Criativos — Estratégia, Copy e Implementação

Dois arquivos HTML prontos, autocontidos (só precisam de internet para as fontes do Google).

| Arquivo | Função | Onde vive | Preço |
|---|---|---|---|
| `lp1-imersao.html` | Vender a imersão ao vivo | Pública (tráfego, bio, stories) | R$ 19,90 |
| `lp2-passe-premium.html` | Upgrade para quem já pagou e não pegou o order bump | **Dentro da área de membros**, permanente | R$ 137,90 |

> **A LP2 não é página de pós-evento.** Ela fica dentro da plataforma desde o instante em que a pessoa paga os R$ 19,90. O cenário principal é: ela acabou de comprar, entra na área de membros, ainda **não assistiu nada** — e decide ali. A página também continua válida durante e depois da imersão, sem prazo falso.

---

## 1. Decisões que tomei (e onde trocar)

### Data
Você pediu setembro, sábado e domingo. O briefing colado dizia "25 e 26 de agosto".
**Usei 19 e 20 de setembro de 2026** como placeholder.

Opções de fim de semana em setembro/2026:

| Fim de semana | Avaliação |
|---|---|
| 5 e 6 | Semana de contas do mês. Evitar. |
| 12 e 13 | Boa. |
| **19 e 20** | **Melhor.** Pós-pagamento, longe do fechamento do mês. Recomendada. |
| 26 e 27 | Fim de mês, dinheiro apertado. |

**Horário sugerido:** 19h às 22h (Brasília), nos dois dias. Bom para quem trabalha e não compete com o sábado à tarde. Se seu público for majoritariamente autônomo, 9h–12h também funciona.

**As datas aparecem agora nestes lugares:**

`lp1-imersao.html`
1. **Faixa de datas no hero** (nova): `📅 19 e 20 de setembro · Sábado e domingo · 🕗 19h às 22h`
2. `<script type="application/ld+json">`: campos `startDate` e `endDate`
3. `<div class="dia-data">` no programa (dois blocos, Dia 1 e Dia 2)
4. `CONFIG.fimInscricoes` no script do rodapé
5. FAQ "Não tenho tempo"

`lp2-passe-premium.html`
6. **Faixa de datas no hero** (nova), logo abaixo da headline
7. `CONFIG.inicioImersao` no script do rodapé
8. Seção "Como funciona o acesso": gravações publicadas a partir de 21 de setembro
9. FAQ "Quando as gravações ficam disponíveis?"

Para trocar tudo de uma vez, use localizar e substituir em `19 de setembro`, `20 de setembro` e `21 de setembro`.

### Acesso às gravações: 3 meses — onde está escrito
Você pediu para **não frisar** o prazo, mas deixar escrito de forma justa. Como você não encontrou na primeira versão, aumentei a visibilidade sem transformar em manchete. Agora aparece em **6 lugares**:

| Onde | Página | Como aparece |
|---|---|---|
| Linha abaixo do preço no hero | LP2 | *"Pagamento único · Gravações liberadas por 3 meses"* |
| Rodapé do card de oferta | LP2 | Uma frase, texto menor, com "3 meses" em destaque |
| Seção "Como funciona o acesso" | LP2 | Item da lista, com data de publicação |
| FAQ "Por quanto tempo tenho acesso?" | LP2 | Resposta completa |
| Rodapé legal | LP2 | Regra completa |
| Aviso do order bump + FAQ "fica gravada?" | LP1 | *"...que inclui as gravações por 3 meses"* |

Continua fora da headline e do corpo principal, então não compete com a oferta. Mas quem procurar acha sem esforço. **Esconder por completo seria propaganda enganosa** (CDC art. 31) e viraria pedido de reembolso no mês 4, que custa mais caro que a venda.

Também dividi assim, o que sobe o valor percebido sem te custar nada:
- **Vídeos** → 3 meses
- **Prompts, checklist e templates** → download, sem prazo

Some a sensação de "aluguel", e é verdade: arquivo baixado é do aluno.

### ⚠️ Uma definição que falta: quando os 3 meses começam a contar
Como a pessoa compra **antes** do evento, isso importa. Escrevi na página que os 3 meses contam **a partir da publicação das gravações** (logo após a imersão), não da data da compra.

É a única regra justa: se contasse da compra, quem comprasse hoje perderia dias de acesso esperando o evento acontecer — e reclamaria com razão. Se você preferir outra regra, me diga que eu ajusto os quatro pontos.

### LP2 = Passe Premium (adotei sua sugestão)
Concordo integralmente. Vender "a gravação" por R$ 137,90 gera resistência de preço; vender "a versão Premium da imersão" reposiciona a mesma entrega. A LP2 usa esse enquadramento do título ao rodapé.

---

## 2. Estrutura da LP1 — seção a seção

| # | Bloco | Função psicológica | CTA? |
|---|---|---|---|
| 0 | Topbar escassez | Ancoragem de urgência antes de qualquer leitura | — |
| 1 | **Hero** | Abre pela **dor**, não pelo Canva. Headline + preço + countdown + barra de vagas | ✅ |
| 2 | **Os dois grupos** | Identidade e tribo (Schwartz). "Em qual eu estou?" | ✅ |
| 3 | **Checklist de dores** | 12 frases literais do ICP. Efeito "isso foi escrito pra mim" | — |
| 4 | **4 Portais** | O método. Transforma aula em sistema (Brunson) | — |
| 5 | **Programa dos 2 dias** | Especificidade = credibilidade | ✅ |
| 6 | **Entregáveis** | Resultado tangível, não currículo | — |
| 7 | **Provas** | Depoimentos + antes/depois | — |
| 8 | **Para quem é / não é** | Desqualificar aumenta desejo | — |
| 9 | **Oferta + value stack** | Ancoragem R$ 905 → R$ 19,90 (Hormozi) + menção discreta ao bump | ✅ |
| 10 | **Garantia** | Reversão de risco | — |
| 11 | **FAQ** | 10 objeções, uma por pergunta | — |
| 12 | **CTA final** | Custo da inação | ✅ |
| — | **Sticky mobile** | Aparece depois do hero, some no desktop | ✅ |

**7 pontos de conversão** no total (5 CTAs + sticky + preço no hero).

### Por que a abertura é pela dor
Sua sugestão estava certa. O hero abre com:

> *Enquanto alguns criadores publicam 10 vezes mais conteúdo usando Inteligência Artificial, outros ainda gastam 3 horas para montar um único post. Em qual desses dois grupos você está hoje?*

Isso é Eugene Schwartz puro: entra na conversa que já está na cabeça da pessoa. "Canva" só aparece na subheadline, depois que a pessoa já se posicionou emocionalmente.

---

## 3. Estrutura da LP2 — seção a seção

| # | Bloco | Função | CTA? |
|---|---|---|---|
| 0 | Topbar | "Oferta exclusiva para quem já garantiu a vaga" — contexto imediato | — |
| 1 | **Hero** | Badge verde **"Sua vaga está confirmada"** + headline + preço + contador até a imersão | ✅ |
| 2 | **Três cenários** | As 3 coisas que vão acontecer no fim de semana. A dor no **futuro** | — |
| 3 | **Curva do esquecimento** | O que acontece depois. Gráfico animado (Ebbinghaus) | ✅ |
| 4 | **O que está incluso** | 5 itens com valor avulso ao lado | — |
| 5 | **Como você vai usar** | 8 usos concretos | — |
| 6 | **Oferta + stack** | R$ 905 → R$ 137,90 + linha fina do prazo | ✅ |
| 7 | **Como funciona o acesso** | 6 regras transparentes, incluindo os 3 meses | — |
| 8 | **Garantia** | 7 dias | — |
| 9 | **FAQ** | 10 perguntas, agora no tempo verbal certo | — |
| 10 | **CTA final** | "Entre no sábado sabendo que nada vai se perder" | ✅ |

### A jogada central da LP2
A pessoa **ainda não assistiu nada**. Então não dá para argumentar "você viu como é bom" — ela não viu. O que ela tem é **uma expectativa** e uma agenda de fim de semana.

Então a página ataca em duas ondas:

**Onda 1 — o que vai dar errado ao vivo (seção 2).** Três coisas que acontecem com praticamente todo mundo numa aula prática de 6h: um imprevisto atravessa o fim de semana, é impossível executar e assistir ao mesmo tempo, e detalhes passam rápido demais. Nenhuma delas é culpa do aluno — e todas são resolvidas pelo passe. Isso funciona **antes** de o evento acontecer, que é exatamente o momento em que ela lê.

**Onda 2 — o que vai acontecer depois (seção 3).** A curva do esquecimento. Reformulada no futuro: *"Duas semanas depois de uma aula, ninguém lembra do passo a passo"*.

O benefício mais forte da página está escondido no primeiro item da seção "Como você vai usar":

> **Assiste ao vivo sem correria.** Sabendo que está gravado, você presta atenção em vez de anotar desesperadamente.

Esse é o argumento que só existe na compra **antecipada**. Quem compra depois já perdeu esse benefício — e é por isso que ele justifica decidir agora, sem precisar de prazo falso.

### O contador: até a imersão, não até um prazo inventado
Como o link fica permanente na plataforma, um countdown de "oferta encerra em X" seria mentira — e ela descobre no dia seguinte que a página continua lá.

O contador marca **o tempo até a imersão começar**. É verdadeiro, cria urgência natural ("decide antes do sábado") e, quando o evento passa, **o contador some sozinho** e o texto vira *"Disponível a qualquer momento na sua área de membros"*. A mesma página funciona antes, durante e depois, sem você mexer em nada.

---

## 4. Copy do Order Bump (checkout da LP1)

Cole no campo de order bump da sua plataforma (Kiwify, Hotmart, Eduzz, Ticto).

**Título:**
> ☑ SIM! Quero adicionar o Passe Premium por + R$ 137,90

**Corpo:**
> A imersão é ao vivo e não fica disponível depois.
>
> Com o **Passe Premium** você leva:
> • As gravações completas dos 2 dias
> • Todos os materiais usados nas aulas
> • A biblioteca de prompts exclusivos
> • O checklist de execução
>
> Assista quantas vezes quiser por 3 meses, reveja qualquer técnica e não perca nenhum detalhe — inclusive o que passar rápido demais na hora.
>
> *Adicionando agora, sai por R$ 137,90. Depois da imersão, o valor é o mesmo — mas só quem adiciona aqui garante acesso desde o primeiro dia.*

**Microcopy da checkbox:** `Adicionar ao meu pedido — R$ 137,90`

> ⚠️ Se você fizer campanha de "preço menor no bump", **precisa** cumprir. Como a LP2 vende pelo mesmo R$ 137,90, a copy acima usa o benefício de **antecipação** (acesso desde o dia 1) em vez de desconto — que é verdadeiro e não te obriga a nada.

---

## 4B. Regra de escrita: nada de travessões

Removi **todos os travessões (—)** da copy das duas páginas. É um vício de escrita de IA e denuncia texto gerado, o que é o oposto do que uma landing precisa transmitir.

O que usei no lugar, por contexto:

| Antes | Depois |
|---|---|
| "não é criatividade — é método" | "não é criatividade. É método." |
| "Dia 1 — Canva com IA" | "Dia 1: Canva com IA" |
| "os materiais — prompts e checklist — você baixa" | "os materiais (prompts e checklist) você baixa" |
| "Grupo 1 — ficando para trás" | "Grupo 1 · ficando para trás" |
| "sem cortes — incluindo as dúvidas" | "sem cortes, incluindo as dúvidas" |

**Frase curta seguida de ponto final é sempre mais forte que travessão.** "Com o Passe, você assiste depois. Inteiro." bate mais que a versão com travessão.

Só restaram travessões dentro de **comentários do código** (o que o visitante nunca vê), servindo para você se localizar ao editar. Se você escrever textos novos, mantenha a regra.

---

## 4C. LP1: layout clean e efeitos

A LP1 foi reconstruída no estilo das páginas de venda da Hotmart: **coluna única, tudo centralizado, muito respiro**.

### Layout
- Container de **1000px**, com respiro lateral de **24px no mobile e 40px no desktop**
- Blocos de texto travados em **680px** de largura, que é o limite de leitura confortável
- Respiro vertical de **78px no mobile e 118px no desktop** entre seções
- Divisor dourado de 64px abaixo de cada eyebrow, marcando o início de cada seção
- Todo card com conteúdo centralizado: ícone, título e texto no eixo
- Único bloco fora da regra: a lista de preços da oferta e o FAQ, alinhados à esquerda porque valores e perguntas em coluna centralizada ficam ilegíveis

### Aurora boreal
O grid saiu. No lugar entraram **5 faixas de luz** em posição fixa atrás de todo o conteúdo, cada uma com sua própria animação:

| Faixa | Cor | Ciclo |
|---|---|---|
| f1 | Roxo | 26s |
| f2 | Azul neon | 32s |
| f3 | Dourado | 38s |
| f4 | Rosa neon | 30s |
| f5 | Roxo + azul | 34s |

Ciclos com durações diferentes e sem divisor comum, então o padrão **nunca se repete de forma perceptível**. Usam `mix-blend-mode: screen` e `blur(90px)`, que é como a luz da aurora real se comporta ao se sobrepor. Por cima, um véu de estrelas que pisca em 7s.

Os cards têm `backdrop-filter: blur()` para a aurora aparecer por trás sem atrapalhar a leitura.

### Cursor: alienígena montado no foguete

O cursor virou um personagem desenhado em **SVG puro** (nada de imagem externa, então não pesa nem borra em tela retina). Ele está montado no foguete como quem monta a cavalo.

**O que se move nele, cada coisa no seu ritmo:**

| Parte | Movimento | Ciclo |
|---|---|---|
| Perninha | Balança pendendo pela lateral da nave | 0,6s |
| Braço de trás | Acena dando tchau | 0,46s |
| Braço da frente | Fixo, apoiado na nave | sem animação |
| Anteninhas | Balançam de leve dentro do capacete | 1,5s |
| Chama | Pisca e estica | 0,13s |
| Corpo inteiro | Flutua de leve para cima e para baixo | 2,4s |

Ciclos com durações diferentes fazem o personagem parecer vivo em vez de robótico, porque nada sincroniza.

**A pose:** ele está **sentado de lado**, montado na nave como quem monta a cavalo. O tronco é estreito e virado para a frente do foguete, o braço da frente se apoia na nave e o de trás acena. A **cabeça continua de frente** para quem olha, que é a convenção de desenho animado que mantém o personagem expressivo mesmo com o corpo de perfil.

**Só uma perninha aparece**, balançando pela lateral. A outra está do lado oposto da nave, escondida — que é exatamente como funciona de verdade.

**Como ele é:** alienígena verde de olhos grandes com brilho, bochechas rosadas e boca aberta rindo com a linguinha aparecendo. Traje de astronauta branco com painel lateral, mochila nas costas, luvas e botas douradas, e capacete de vidro com reflexo. As anteninhas ficam dentro do capacete, com bolinhas azul neon e rosa neon.

**O foguete** tem bico rosa neon, aletas roxas, faixa dourada, escotilha com aro dourado e chama saindo atrás.

**Comportamento:**
- Segue o mouse com **atraso suave** (22%), o que dá sensação de peso em vez de grudar no ponteiro
- **Vira de lado** conforme a direção, em vez de cambalhotar. A transição passa pelo zero e produz um giro rápido, como se ele desse meia-volta. O alienígena **nunca fica de cabeça para baixo**
- **Inclina no máximo 24°** ao subir ou descer
- Solta fumaça colorida **atrás** dele, do lado oposto ao que aponta

**Ele nunca some.** Fica visível parado, ao sair da janela e antes do primeiro movimento do mouse.

**A fumaça** é canvas com `globalCompositeOperation = 'lighter'`: as partículas somam luz ao se sobrepor, exatamente como neon de verdade. Cores sorteadas entre roxo, azul neon, rosa e dourado. Cada partícula expande, desacelera e some em cerca de 1 segundo. Teto de 420 para não pesar.

**Desliga sozinho quando:**
- O dispositivo é touch (`hover: hover and pointer: fine`), porque celular não tem cursor
- O visitante pediu menos animação no sistema (`prefers-reduced-motion`). Isso é acessibilidade real: para quem tem enxaqueca vestibular, esse tipo de efeito provoca sintoma

Nesses casos o cursor normal volta e nada quebra.

> **Vale medir depois de publicar.** O personagem tem 62px, bem maior que um cursor comum, o que pode atrapalhar na hora de clicar em links pequenos. Se a conversão cair, o ajuste mais simples é reduzir para 44px em `#foguete{width:...}` (lembrando de mudar o offset `posX-30` no script proporcionalmente). Para desligar de vez, apague as linhas `<canvas id="fumaca">` e o bloco `<div id="foguete">`.

---

## 5. Paleta e sistema visual

```
Fundos       #04030A  preto profundo
             #0A0816  preto secundário (cards)
             #110D22  preto elevado

Dourado      #F2C14E  primário
             #FFE29A  claro (gradiente)
             #B8862B  escuro (gradiente)

Roxo         #A855F7 / #6D28D9
Azul neon    #22D3FF
Rosa neon    #FF2ED1

CTA verde    #00E27A → #00B863
Texto        #F4F2FF / #B7B2CC / #7C7793
```

**Tipografia:** Sora (display, 700–800) + Inter (corpo, 400–600). Sora tem o corte geométrico-futurista que combina com o material gráfico que você já tem.

**Elementos futuristas usados:** grade em perspectiva no hero (com máscara radial), glows radiais desfocados, bordas neon de 1px, gradientes em texto, pulso no CTA, reveal ao rolar.

**Espaço em branco:** 70px de padding vertical no mobile, 104–110px no desktop. É o que dá a sensação "Apple" — nada colado.

---

## 6. Imagens que você precisa produzir

Crie uma pasta `assets/` ao lado dos arquivos HTML e jogue tudo lá dentro.

| Onde | Arquivo | Tamanho | O que deve mostrar |
|---|---|---|---|
| **Capa da LP1** ⭐ | `assets/capa-multiverso.jpg` | 1656×943 (16:9) | **A arte horizontal que você mandou.** É a primeira coisa que a página exibe |
| **Logo (as duas LPs)** | `assets/logo.png` | 600px largura, **PNG transparente** | Ver observação abaixo |
| Arte do evento (LP2) | `assets/arte-evento.jpg` | 1080×1080 | A arte quadrada que você já tem |
| Antes/Depois | 2 arquivos | 1200×750 | Mesma peça: feita do jeito antigo vs. com Canva+IA |
| Depoimentos | prints | livre | Print de WhatsApp/DM converte mais que texto formatado |
| OG social | `assets/og-multiverso.jpg` | 1200×630 | A arte horizontal |
| Favicon | `favicon.png` | 512×512 | O cérebro neon isolado no preto |

### Sobre a logo
Você não chegou a mandar um arquivo de logo, então **coloquei um fallback tipográfico** no topo das duas páginas: "IMERSÃO" em letras espaçadas, e "MULTIVERSO DOS CRIATIVOS" em dourado, na fonte Sora. Funciona bem e não parece um espaço vazio esperando imagem.

Quando tiver o arquivo, é só trocar o bloco. Em ambas as páginas, procure por `▼ LOGO DO EVENTO` e substitua:

```html
<div class="logo-topo"><img src="assets/logo.png" alt="Multiverso dos Criativos"></div>
```

Se você quiser extrair a logo direto da arte que já tem: recorte só o letreiro "MULTIVERSO DOS CRIATIVOS" da imagem horizontal, remova o fundo preto (o próprio Canva faz isso) e exporte em PNG.

### Sobre a capa da LP1
Salve a arte horizontal como `assets/capa-multiverso.jpg` ao lado do HTML. **Enquanto o arquivo não existir, aparece um placeholder** com moldura neon dizendo onde salvar. Quando o arquivo entrar na pasta, ele some sozinho e a arte assume o lugar. Não precisa mexer no código.

Exporte em JPG com qualidade 80. A arte tem muito preto e neon, então o JPG segura bem e o carregamento fica rápido no 4G.

### Roteiro do vídeo do hero (45–60s)
1. **0–5s** — Você na tela: *"Se você gasta mais de uma hora para fazer um post, presta atenção nos próximos 40 segundos."*
2. **5–20s** — Gravação de tela: ideia solta → carrossel pronto, acelerado.
3. **20–35s** — Gravação de tela: vídeo bruto → editado com legendas.
4. **35–50s** — Você: *"Isso é o que a gente faz nos dois dias, ao vivo, junto. Sábado e domingo, 19h."*
5. **50–60s** — Card final: preço + "clique no botão abaixo".

Sem música alta, sem corte frenético. O tom da página é premium, não infoprodutor gritando.

---

## 7. O que trocar antes de publicar

Busque e substitua nos dois arquivos:

- [ ] `https://CHECKOUT.com.br/multiverso` → seu link de checkout da imersão
- [ ] `https://CHECKOUT.com.br/passe-premium` → seu link de checkout do passe
- [ ] `https://SEUDOMINIO.com.br` → seu domínio
- [ ] `[SUA EMPRESA]` e `[00.000.000/0001-00]` → razão social e CNPJ
- [ ] `SEU@EMAIL.com` → e-mail de suporte
- [ ] `SEU NOME AQUI` no JSON-LD
- [ ] `[X] alunos` e `[X,X]` na prova social do hero — **se não tiver números reais, apague a linha inteira**
- [ ] Os 3 depoimentos `[DEPOIMENTO REAL — …]` — **se não tiver, apague a seção `.depos` inteira**
- [ ] `CONFIG.fimInscricoes` (LP1) e `CONFIG.inicioImersao` (LP2) — as datas dos contadores
- [ ] `CONFIG.vagasPreenchidas` — atualize manualmente conforme vender

### Sobre prova social — leia isto
Deixei os depoimentos e as notificações de compra **com placeholder e desligados por padrão** de propósito. Depoimento inventado e notificação de venda falsa são propaganda enganosa (CDC art. 37) e, na prática, o público reconhece. Uma página sem depoimento converte melhor que uma com depoimento óbvio-falso.

Se você não tem prova ainda, o caminho é: rode a primeira turma, colete os prints, e a segunda turma já vende com prova real.

Para ativar as notificações depois, com dados reais: em `lp1-imersao.html`, mude `notificacoesAtivas: true` e alimente o array `compras` via webhook do seu checkout.

---

## 8. Ancoragem de preço — por que R$ 905

O stack soma R$ 905 e o preço é R$ 19,90. Isso é ancoragem clássica de Hormozi, mas com um cuidado: **não usei preço riscado falso** ("de R$ 297 por R$ 19,90"). Preço riscado que nunca existiu é problema jurídico e o público já não acredita.

O que a página faz em vez disso:
- Compara com o custo real de mercado: *"uma peça de freelancer custa R$ 80 a R$ 200"* — verificável.
- Precifica cada componente do stack pelo que valeria avulso.
- Compara com o cotidiano: *"menos que um lanche"*.

Se você **de fato** já vendeu esses módulos avulsos por esses valores, aí sim pode usar preço riscado.

---

## 9. SEO e técnica

**LP1** — indexável, com:
- `<title>` de 58 caracteres, `<meta description>` de 155
- Open Graph completo para WhatsApp e Instagram
- **JSON-LD Schema.org `Event`** — faz o Google exibir data, preço e "evento online" no resultado de busca. Poucos concorrentes fazem isso.
- `<link rel="canonical">`

**LP2** — `noindex, nofollow`. É página de acesso restrito, não pode aparecer no Google.

**Performance:**
- Zero JS externo, zero framework. Uma requisição de fonte.
- `preconnect` para o Google Fonts
- Animações com `transform`/`opacity` (não causam reflow)
- `prefers-reduced-motion` respeitado — acessibilidade e evita enjoo em quem é sensível
- Sem imagem no HTML por padrão: a página abre instantânea mesmo em 4G ruim

**Tracking já embutido:** os CTAs disparam `InitiateCheckout` no Meta Pixel e `begin_checkout` no GA4 automaticamente. Você só precisa colar o snippet do pixel no `<head>`.

---

## 10. Mobile vs. Desktop

| | Mobile (<900px) | Desktop (≥900px) |
|---|---|---|
| Hero | Coluna única, mídia embaixo | 2 colunas, mídia à direita |
| Sticky CTA | Aparece após o hero | Oculto |
| Grids | 1 coluna (entregáveis: 2) | 2–4 colunas |
| Padding vertical | 70px | 104px |
| H1 | 30px → escala com `clamp()` | até 60px |
| Countdown | 4 blocos lado a lado, compactos | idem, maiores |

Tudo com `clamp()` — não existe quebra entre breakpoints. Testado de 320px a 2560px.

O `padding-bottom: 84px` no `body` (mobile) garante que o sticky CTA nunca cubra o rodapé.

---

## 11. Funil completo

```
Anúncio / Stories / Bio
        ↓
   LP1 (R$ 19,90)
        ↓
    Checkout ──────► ORDER BUMP: Passe Premium +R$ 137,90
        ↓                          │
        │                          │ não pegou
        ▼                          ▼
  ÁREA DE MEMBROS ──────────► LP2 (R$ 137,90)
        │                     banner fixo, sempre visível
        ├─ Check-in                │
        ├─ Grupo de alunos         │ pode comprar a qualquer
        ├─ Link do Zoom            │ momento: antes, durante
        │                          │ ou depois da imersão
        ▼                          │
  Imersão ao vivo (2 dias) ◄───────┘
        ↓
  Oferta VIP no dia 2
        ↓
     Mentoria
```

### Onde colocar o link da LP2 dentro da plataforma

A LP2 tem **três momentos de exibição**, do mais para o menos importante:

| Momento | Onde | Copy do botão/banner |
|---|---|---|
| **1. Logo após a compra** ⭐ | Página de obrigado / primeiro acesso à área de membros | *"Antes de fechar: quer levar tudo gravado? → Ver o Passe Premium"* |
| **2. Permanente** | Banner fixo no topo da área de membros, até ela comprar | *"⭐ Adicionar o Passe Premium — gravações, materiais e prompts"* |
| **3. Lembrete** | E-mail de véspera (D-1) e mensagem no grupo na sexta | *"Amanhã começa. Já garantiu as gravações?"* |

O momento **1 é o que mais converte** — a pessoa está com o cartão na mão, acabou de decidir a favor, e o custo psicológico de um segundo "sim" é baixíssimo. É o mesmo princípio do order bump, só que numa segunda janela.

**Esconda o banner de quem já comprou.** Nada irrita mais um cliente do que continuar sendo vendido para algo que ele já pagou. Se sua plataforma permite tags/segmentação, use.

### Sequência de lembretes sugerida

| Envio | Quando | Ângulo |
|---|---|---|
| 1 | Imediatamente após a compra | Página de obrigado com a oferta |
| 2 | D-3 antes da imersão | "Vai conseguir estar nos dois dias?" → cenário do imprevisto |
| 3 | D-1 (véspera) | "Amanhã começa. Assista tranquilo, sem anotar correndo." |
| 4 | Domingo à noite, fim do dia 2 | "Em uma semana você lembra ~44%." → curva do esquecimento |

**Não invente prazo de encerramento.** O link fica permanente na plataforma, então "encerra hoje" seria desmentido no dia seguinte pela própria página. A urgência aqui é real e não precisa de teatro: quem compra antes assiste ao vivo sem a pressão de anotar tudo.

---

## 12. Como testar agora

Abra os arquivos direto no navegador (duplo clique). Para testar responsivo: `F12` → ícone de celular → escolha "iPhone 12 Pro".

Checklist rápido:
- [ ] Countdown está contando (se a data já passou, mostra 00:00:00:00)
- [ ] Sticky CTA aparece ao rolar no mobile e some no desktop
- [ ] FAQ abre e fecha
- [ ] Barras da curva do esquecimento animam ao entrar na tela (LP2)
- [ ] Nenhum scroll horizontal em 320px de largura

---

## 13. Três testes A/B que valem a pena depois

1. **Hero: vídeo vs. imagem estática.** Costuma dar 15–30% de diferença. Teste primeiro.
2. **CTA: "Quero garantir minha vaga" vs. "Quero aprender IA".** O primeiro é de posse, o segundo é de aprendizado. Depende do quão consciente do problema é o seu tráfego.
3. **LP2: abrir pelos três cenários vs. abrir pelo que está incluso.** A hipótese é que a dor antecipada (o imprevisto, a impossibilidade de executar e assistir junto) vence a lista de features — mas confirme com o seu público.

Teste **um por vez**, com no mínimo 300 visitantes por variação. Abaixo disso o resultado é ruído.
