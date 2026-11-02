<div align="center">

# 💸 Planej.ai

**Planeje suas metas financeiras com simulações claras e insights assistidos por inteligência artificial.**

Aplicação web desenvolvida com **React, TypeScript, Vite e Tailwind CSS**, focada em organização de metas, análise estimada do orçamento e acompanhamento de simulações.

[🌐 Acessar demonstração](https://planejai-rosy.vercel.app/) · [💻 Ver código-fonte](https://github.com/AlbericoJr/planejai) · [🐛 Reportar problema](https://github.com/AlbericoJr/planejai/issues)

</div>

---

## 📖 Sobre o projeto

O **Planej.ai** é um projeto de planejamento financeiro pessoal. A partir de informações de renda, despesas, dívidas e uma meta definida pelo usuário, a aplicação organiza os valores, apresenta um resumo da simulação e permite consultar análises textuais geradas por IA.

O objetivo é tornar o planejamento de metas mais visual e acessível, enquanto o projeto explora construção de interfaces com React, tipagem com TypeScript, persistência local e integração com uma API generativa.

> **Estado atual:** projeto frontend em evolução. A integração com a API Gemini é experimental e **foi migrada para uma função serverless, mas ainda exige configuração e validação em produção** antes do uso com credenciais reais em produção.

## 🖥️ Demonstração e capturas

**Aplicação publicada:** https://planejai-rosy.vercel.app/

### Página inicial

![Página inicial do Planej.ai](src/assets/Hero.png)

### Formulário de simulação

![Formulário de simulação financeira](src/assets/simulação.png)

### Histórico de simulações

![Histórico de simulações do Planej.ai](src/assets/Histórico.png)

## ✨ Funcionalidades

- **Simulação em etapas:** preenchimento de renda mensal bruta, custos fixos, dívidas ou parcelas, nome da meta, custo e prazo desejado.
- **Resumo financeiro:** exibição dos principais valores informados e da sobra mensal estimada.
- **Análise assistida por IA:** geração de diagnóstico, sugestões, alternativas de renda extra e orientações textuais relacionadas à meta, quando a integração está configurada e disponível.
- **Conversa contextual com IA:** perguntas adicionais com referência aos dados da simulação, ao diagnóstico gerado e às últimas mensagens.
- **Histórico local:** consulta, abertura e exclusão de simulações armazenadas no navegador.
- **Tema claro e escuro:** preferência visual persistida localmente.
- **Interface responsiva:** layout adaptado para diferentes tamanhos de tela.

### Como o cálculo funciona

O resumo exibe a **sobra mensal estimada** conforme a fórmula atualmente implementada:

```text
Sobra mensal estimada = renda mensal bruta − custos fixos − dívidas/parcelas
```

A estimativa **não equivale necessariamente ao dinheiro disponível para investir ou poupar**: impostos, despesas variáveis e gastos não informados podem alterar o resultado. O valor mensal necessário para a meta é considerado no contexto enviado à IA, mas não substitui um planejamento financeiro detalhado.

## 🛠️ Tecnologias

| Categoria | Tecnologias |
| --- | --- |
| Interface | React 19, TypeScript, React Router |
| Estilização | Tailwind CSS 4, CSS, Lucide React |
| Ferramentas | Vite 8, ESLint, Prettier |
| Experiência visual | React Loading Skeleton |
| Persistência | `localStorage` do navegador |
| IA experimental | API Gemini via função serverless Vercel (`api/gemini.js`) |

**Arquitetura atual:** frontend React com função serverless Vercel para intermediar chamadas à API Gemini. As simulações continuam armazenadas apenas no navegador.

## 🚀 Executando localmente

### Pré-requisitos

- **Node.js 20.19+ ou 22.12+** (ou uma versão posterior compatível com Vite 8).
- **npm**.
- **Git** para clonar o repositório.

### 1. Clone o projeto

```bash
git clone https://github.com/AlbericoJr/planejai.git
cd planejai
```

### 2. Instale as dependências

```bash
npm ci
```

### 3. Inicie a aplicação

```bash
npm run dev
```

Abra a URL exibida no terminal, geralmente **http://localhost:5173/**. A porta poderá ser diferente se a padrão estiver ocupada.

> **Importante:** as telas, o formulário e o histórico local podem ser explorados sem cadastrar uma chave de API. Nesse cenário, a geração de respostas por IA não funcionará corretamente e poderá exibir um erro de integração.

### Configuração da IA e segurança

A integração utiliza a função serverless `api/gemini.js`. O frontend faz requisições relativas a `/api/gemini`, sem receber a credencial do provedor.

1. Configure `GEMINI_API_KEY` **somente nas variáveis de ambiente do projeto na Vercel** (Development, Preview e Production conforme sua necessidade). **Não use prefixo `VITE_`**.
2. Faça o deploy na Vercel. O endpoint `/api/gemini` será executado pelo servidor.
3. Para testar a integração localmente, utilize o ambiente da Vercel com `vercel dev` e as variáveis locais apropriadas, em vez de apenas `npm run dev`. O `vite` isolado não disponibiliza a função serverless `/api/gemini`.

> **Importante:** nunca coloque uma chave real em arquivos com prefixo `VITE_`, no código-fonte ou em commits. Se uma chave já esteve disponível no JavaScript servido ao navegador, **revogue-a e gere outra**.

O endpoint possui verificação de origem, validação simples de tamanho de mensagens e limitação básica em memória. **A limitação em memória não é uma proteção robusta entre múltiplas instâncias serverless:** antes de abrir a aplicação ao público em escala, configure limite centralizado por IP/usuário, verificação de identidade quando aplicável, cotas de uso e monitoramento de custos. O endpoint recebe informações financeiras declaradas nas simulações; não insira dados pessoais sensíveis.

Para desenvolver somente a interface, use `npm run dev`. A geração de insights pode retornar um erro quando a API serverless não estiver disponível.

Referência: [documentação de variáveis de ambiente do Vite](https://vite.dev/guide/env-and-mode).

## 📁 Organização do projeto

```text
planejai/
├── api/gemini.js         # Proxy serverless de IA (Vercel)\n├── public/                # Arquivos públicos
├── src/
│   ├── assets/            # Imagens e recursos visuais
│   ├── components/        # Componentes e funcionalidades de interface
│   ├── context/           # Contexto de tema
│   ├── data/              # Estruturas de dados e prompts de IA
│   ├── hooks/             # Estado e persistência das simulações
│   ├── pages/             # Formulário, resultados e histórico
│   ├── services/          # Cliente HTTP para o endpoint /api/gemini
│   ├── styles/            # Estilos adicionais
│   ├── utils/             # Cálculos e formatação
│   ├── App.tsx
│   ├── router.tsx
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## 🧰 Comandos disponíveis

| Comando | Ação |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Executa a verificação TypeScript e gera o build |
| `npm run preview` | Visualiza o build localmente |
| `npm run lint` | Analisa o código com ESLint |
| `npm run lint:fix` | Aplica correções automáticas possíveis |
| `npm run format` | Formata arquivos com Prettier |

**Verificações sugeridas antes de publicar alterações:**

```bash
npm run lint
npm run build
```

O repositório **ainda não possui um script de testes automatizados** configurado no `package.json` consultado. Os comandos acima verificam análise estática e build, mas não substituem testes funcionais.

## 🔐 Privacidade e limitações atuais

- **Dados armazenados no navegador:** simulações e conversas ficam no `localStorage` do dispositivo, sem conta de usuário e sem sincronização entre dispositivos.
- **Persistência limitada:** limpar os dados do navegador ou usar outro navegador/dispositivo pode eliminar o acesso ao histórico.
- **Envio de dados à IA:** quando a integração é acionada, informações financeiras fornecidas na simulação e trechos da conversa são enviados ao serviço Gemini para geração de respostas.
- **Chave protegida no servidor:** o código React não utiliza mais uma variável \`VITE_GEMINI_API_KEY\`; ainda é necessário configurar \`GEMINI_API_KEY\` na Vercel e revogar credenciais antigas expostas.
- **Resultados estimados:** os cálculos dependem das informações cadastradas, e respostas da IA podem conter imprecisões.
- **Sem recomendação financeira profissional:** o Planej.ai é um projeto educacional e demonstrativo, não uma plataforma de consultoria financeira ou aconselhamento de investimentos.

Evite inserir informações financeiras sensíveis ou identificadores pessoais reais enquanto a integração e os controles de privacidade estiverem em desenvolvimento.

## 🗺️ Próximos passos

- [x] Migrar as chamadas Gemini para uma função serverless (configuração da chave na Vercel ainda necessária).\n- [ ] Implantar rate limiting centralizado e controles contra abuso.
- [ ] Adicionar validação dos dados de entrada e da estrutura de respostas da IA.
- [ ] Corrigir a nomenclatura da sobra mensal e aprimorar os cálculos considerando mais despesas.
- [ ] Implementar testes unitários e de fluxo para simulações, histórico e integração de IA.
- [ ] Melhorar acessibilidade, estados de erro e tratamento de respostas inesperadas.
- [ ] Adicionar opções de exportação e limpeza do histórico local.
- [ ] Configurar validações automatizadas com GitHub Actions.

## 🤝 Como contribuir

Sugestões, melhorias e correções são bem-vindas.

1. Abra uma [issue](https://github.com/AlbericoJr/planejai/issues) explicando a proposta ou o problema.
2. Crie uma branch descritiva, como `feat/nome-da-feature` ou `fix/nome-do-ajuste`.
3. Faça as alterações e execute `npm run lint` e `npm run build`.
4. Abra um pull request descrevendo o que mudou e como validar.

## 📄 Licença

**Ainda não há um arquivo `LICENSE` definido neste repositório.** As condições de reutilização e distribuição devem ser esclarecidas com o autor. Uma licença poderá ser adicionada futuramente.

## 👨‍💻 Autor

**Albérico Júnior** — Desenvolvedor Front-end & Mobile

- [GitHub](https://github.com/AlbericoJr)
- [LinkedIn](https://www.linkedin.com/in/alberico-junior/)
- [Portfólio](https://albericojr-portfolio-xi.vercel.app/)

---

<div align="center">

**Planej.ai — transforme suas metas em planos mais claros.**

</div>
