# NF Monitor Test Workspace

![Electron Testing](https://img.shields.io/badge/Electron-Testing-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-UI-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Unit-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

Workspace de testes abrangente para aplicações Electron do NF Monitor (Monitor de Notas Fiscais).

## 🎯 **Visão Geral**

Este projeto fornece uma estrutura completa de testes para aplicações Electron que monitoram Notas Fiscais Eletrônicas (NFE). Inclui testes E2E, UI, integração e unitários.

### **Funcionalidades Principais**

- ✅ **Testes E2E com Playwright** para aplicações Electron
- ✅ **Testes UI com Cypress** para componentes web
- ✅ **Testes de Integração** com mock de APIs
- ✅ **Test Harness** para comunicação IPC
- ✅ **Testes contra executável real** (.exe)
- ✅ **Simulação de bandeja do Windows**
- ✅ **Testes de interação NFE**

## 🚀 **Instalação**

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nf-monitor-test-workspace.git

# Navegue para o diretório
cd nf-monitor-test-workspace

# Instale as dependências
npm install

# Configure o Playwright
npx playwright install
```

## 🧪 **Executando os Testes**

### **Testes E2E (Recomendado)**
```bash
# Testes básicos que funcionam com qualquer executável
npm run test:e2e:basico
```

### **Outros Testes**
```bash
# Todos os testes E2E
npm run test:e2e

# Testes de unidade
npm run test:unit

# Testes Cypress UI
npm run test:cypress

# Testes Cypress interativo
npm run test:cypress:open

# Playwright com interface
npm run test:e2e:basico:ui
```

## 📁 **Estrutura do Projeto**

```
📦 nf-monitor-test-workspace
├── 📂 tests/
│   └── 📂 e2e/
│       └── 📄 electron-basico.spec.ts   # Testes básicos E2E
├── 📂 tests-integration/
│   └── 📄 network.spec.ts               # Testes de API com mocks
├── 📂 cypress/
│   ├── 📂 e2e/
│   │   └── 📄 configuracoes.cy.js       # Testes UI Cypress
│   └── 📂 support/
│       ├── 📄 commands.js               # Comandos customizados
│       └── 📄 e2e.js                    # Configurações globais
├── 📂 test-harness/
│   └── 📄 ipc-test-hook.ts              # Handlers IPC para testes
├── 📄 playwright.config.ts              # Configuração Playwright
├── 📄 cypress.config.js                 # Configuração Cypress
├── 📄 vitest.config.ts                  # Configuração Vitest
└── 📄 package.json                      # Dependências e scripts
```

## ⚙️ **Configuração para Seu App**

### **1. Para Integração Completa**

Adicione ao seu `main.ts` ou `main.js`:

```javascript
if (process.env.ELECTRON_TEST === '1') {
  const { registerTestIpc } = require('./test-harness/ipc-test-hook');
  registerTestIpc();
}
```

### **2. Seletores de Teste**

Adicione `data-testid` nos seus elementos:

```html
<button data-testid="scan-button">Escanear</button>
<div data-testid="nfe-list">Lista NFE</div>
<div data-testid="status-bar">Status</div>
```

## 🧭 **Guias de Uso**

- 📖 [**GUIA-TESTES-EXECUTAVEL.md**](./GUIA-TESTES-EXECUTAVEL.md) - Como testar executáveis
- 📖 [**GUIA-TESTES-BANDEJA.md**](./GUIA-TESTES-BANDEJA.md) - Como testar bandeja do Windows
- 📖 [**EXECUTAR-TESTE-EXE.md**](./EXECUTAR-TESTE-EXE.md) - Executar testes contra .exe
- 📖 [**VALIDATION.md**](./VALIDATION.md) - Validação da estrutura

## 🔍 **Tipos de Teste**

### **E2E (End-to-End)**
- ✅ Abertura e fechamento do app
- ✅ Interação com UI real
- ✅ Minimização para bandeja
- ✅ Cliques em ícones NFE
- ✅ Comunicação IPC

### **Integração**
- ✅ APIs mockadas com Nock
- ✅ Teste de rede
- ✅ Processamento de arquivos XML

### **UI (User Interface)**
- ✅ Componentes individuais
- ✅ Formulários
- ✅ Navegação

## 🛠️ **Tecnologias**

| Ferramenta | Versão | Finalidade |
|------------|--------|------------|
| **Playwright** | ^1.47.0 | Testes E2E Electron |
| **Cypress** | ^13.0.0 | Testes UI |
| **Vitest** | ^1.6.0 | Testes unitários |
| **TypeScript** | ^5.0.0 | Tipagem |
| **Nock** | ^13.5.0 | Mock de APIs |

## 📊 **Exemplos de Resultados**

### **✅ Sucesso (7/7 testes passando)**
```
✓ Abre o aplicativo e carrega interface
✓ Verifica elementos básicos da interface (58 elementos)
✓ Testa cliques básicos na interface (7 clicáveis)
✓ Testa minimização da janela
✓ Verifica propriedades da janela (1280x701)
✓ Procura por elementos NFE (2 encontrados)
✓ Testa navegação por teclado

📊 Total: 7 passed (12.7s)
```

## 🐛 **Debugging**

### **Screenshots Automáticos**
Os testes salvam screenshots em `./test-results/` para debug.

### **Modo Debug**
```bash
# Com interface visível
npm run test:e2e:basico -- --headed

# Interface gráfica do Playwright
npm run test:e2e:basico:ui

# Teste específico
npx playwright test -g "nome do teste"
```

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 **Licença**

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 📞 **Suporte**

- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/nf-monitor-test-workspace/issues)
- 📖 **Documentação**: Veja os arquivos `GUIA-*.md`
- 💬 **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/nf-monitor-test-workspace/discussions)

---

**⭐ Se este projeto ajudou você, considere dar uma estrela!**