# Gollinho WMS — Web Mobile (operador)

Versão web (HTML + CSS + JavaScript puro + Bootstrap 5) das telas que o
operador usa no chão de fábrica — a mesma responsabilidade descrita no
`PROMPT_3_MOBILE_REACT_NATIVE`, só que rodando no navegador do celular em
vez de um app nativo. Sem build, sem npm: abra o `index.html` e funciona.

Pasta irmã de `angular-hackathon` (retaguarda/dashboard) e `hackathon`
(backend Spring Boot).

## Por que existir junto do app React Native

O app RN continua sendo o app "de verdade" do projeto. Esta versão web serve
para:

- Testar o fluxo operacional (conferência cega → armazenagem) em qualquer
  celular, sem precisar instalar o Expo Go nem estar na mesma rede.
- Ter um plano B pronto pra demo caso o app nativo trave.
- Rodar em **qualquer tipo de celular** — Android, iPhone, tablets — porque é
  só uma página responsiva com Bootstrap, sem nada nativo.

Pode ser aberta direto no navegador (Chrome/Safari) ou instalada como app
("Adicionar à tela inicial") graças ao `manifest.webmanifest`.

## Como rodar

Não precisa de servidor. Duas opções:

1. **Abrir direto**: dois cliques no `index.html`.
2. **Com um servidor local** (recomendado, evita bloqueios de CORS/fetch em
   alguns navegadores):
   ```bash
   cd web-mobile-hackathon
   npx serve .
   # ou: python -m http.server 5500
   ```
   Depois abra `http://SEU-IP-NA-REDE:5500` no celular (mesma Wi-Fi do PC).

## Login de teste (modo offline)

```
operador / 123
```

Qualquer usuário/senha funciona no modo mock — não há validação real
enquanto `USAR_MOCK = true`.

## Integração com o backend (Spring Boot)

Único arquivo que muda: **`assets/js/config.js`**

```js
const API_URL = 'http://192.168.x.x:8080/api'; // IP da máquina do backend
const USAR_MOCK = false;                        // desliga os dados falsos
```

`localhost` não funciona no celular — use o IP da máquina que está rodando o
Spring Boot, com o CORS liberado (`@CrossOrigin(origins = "*")`, já previsto
no contrato).

Os métodos de `assets/js/api.js` seguem exatamente o contrato congelado da
equipe (mesmos endpoints, mesmos campos do `PROMPT_3` / `ESPECIFICACAO_WMS`):

```
POST /auth/login
GET  /docas
GET  /notas-fiscais?docaId=&status=
GET  /notas-fiscais/{id}
POST /notas-fiscais/{id}/conferencia
GET  /paletes?docaId=&status=
GET  /posicoes/livres?rua=
GET  /posicoes/sugestao?paleteId=
POST /paletes/{id}/armazenar   → trata o 409 POSICAO_OCUPADA
```

## Estrutura

```
web-mobile-hackathon/
├── index.html          login
├── docas.html           seleção da doca (1 a 4)
├── notas.html            NFs aguardando conferência na doca
├── conferencia.html       conferência cega + observação se divergir
├── paletes.html            paletes EM_DOCA prontos pra guardar
├── armazenagem.html         rua → andar → posição, com sugestão e 409
├── manifest.webmanifest
└── assets/
    ├── css/style.css    tema escuro industrial (mesma paleta do Angular)
    ├── js/config.js      constantes de negócio (192 posições, litros etc.)
    ├── js/mock.js          dados e regras falsas (USAR_MOCK = true)
    ├── js/api.js            camada HTTP (troca mock ↔️ real num só lugar)
    ├── js/app.js             sessão (sessionStorage), guarda de rota, UI
    └── icons/               ícones do PWA
```

## Decisões técnicas

- **Sem framework, sem build.** Multi-page HTML puro + Bootstrap 5 via CDN.
  Cada tela é um arquivo; a navegação é `window.location.href`.
- **Sessão em `sessionStorage`**: usuário logado, doca escolhida, nota e
  palete em andamento. Zera ao fechar a aba — sem persistir credencial.
- **Bootstrap 5 com tema escuro** (`data-bs-theme="dark"`) e as cores da
  marca sobrescritas via CSS variables (`--bs-primary`, `--bs-danger`...),
  então os componentes prontos do Bootstrap (`btn`, `card`, `badge`,
  `alert`, `form-control`) já saem na paleta do Gollinho sem CSS extra.
- **Mobile-first e responsivo pra "todo tipo de celular"**: grid do
  Bootstrap + `grade-botoes` em CSS Grid, botões com no mínimo 64px de
  altura (regra do PROMPT_3 pra chão de fábrica com luva), `viewport-fit=cover`
  e `env(safe-area-inset-*)` pra não esconder nada atrás do notch/gestos do
  iPhone, e layout centralizado até 540px pra não esticar feio em tablet.
- **O 409 de posição ocupada é um overlay de tela cheia** (`mostrarAlertaCheio`
  em `app.js`), impossível de não notar — é exatamente o critério que mais
  pesa na nota (RN03, 15%).
- **Conferência cega**: `conferencia.html` nunca lê nem exibe
  `fardosEsperados`; ele só existe no mock pra calcular divergência, do
  mesmo jeito que o backend real vai fazer.
- **Modo mock usa a mesma semente do Angular** (posições `R01-A01-P01` e
  `R01-A01-P02` já ocupadas, docas e sabores iguais), então dá pra testar o
  alerta de posição ocupada e ver os dois front-ends "batendo" mesmo sem o
  backend no ar.
