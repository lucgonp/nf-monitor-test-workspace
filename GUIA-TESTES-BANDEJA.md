# 🔍 **GUIA: Testando Bandeja do Windows e Ícone NFE**

## 📋 **Como Detectar Cliques na Bandeja e NFE**

### 🎯 **1. Configuração Necessária no Main Process**

```typescript
// main.ts - Adicione esta configuração
import { registerTestIpc } from '../test-harness/ipc-test-hook';

const isTest = process.env.ELECTRON_TEST === '1';
if (isTest) {
  registerTestIpc(); // ✅ Registra handlers de teste
}
```

### 🧪 **2. Testes Disponíveis**

#### **✅ A. Testes Demo (Funcionando Agora)**
```bash
# Executar testes demo (sem Electron real)
npm run test:e2e
```
**Status**: ✅ **5 testes passando!**

#### **🔧 B. Testes Electron Real (Para seu app)**
```bash
# Quando tiver app Electron, remova .skip do arquivo:
# tests/e2e/electron-real.spec.ts
```

### 📊 **Resultados dos Testes Atuais:**

```
✅ valida estrutura de arquivos para testes (3ms)
✅ simula processamento de NFE (2ms)  
✅ verifica eventos de bandeja (simulação) (3ms)
✅ testa seletores de UI (data-testid) (5ms)
✅ valida configuração de comunicação IPC (5ms)

🎯 5 passed (718ms)
```

### � **3. Como Implementar no Seu App**

#### **A. Adicione seletores data-testid na UI:**
```html
<!-- Ícone NFE -->
<div data-testid="icone-nfe" onclick="selecionarNFE()">
  <img src="nfe-icon.png" />
  <span>nota_fiscal.xml</span>
</div>

<!-- Menu de Contexto -->
<div data-testid="menu-contexto-nfe" style="display: none;">
  <button data-testid="opcao-visualizar">📄 Visualizar</button>
  <button data-testid="opcao-reenviar">🔄 Reenviar</button>
</div>

<!-- Histórico -->
<div data-testid="historico-execucoes">
  <div data-testid="item-historico">
    <span>nota_123.xml</span>
    <span class="status">✅ Enviado</span>
  </div>
</div>

<!-- Botões -->
<button data-testid="btn-limpar-historico">�️ Limpar</button>
```

#### **B. Configure o main.ts:**
```typescript
// Importe o test harness
import { registerTestIpc } from './test-harness/ipc-test-hook';

// No inicio do app
const isTest = process.env.ELECTRON_TEST === '1';
if (isTest) {
  registerTestIpc();
}
```

#### **C. Ative testes reais:**
```typescript
// Em tests/e2e/electron-real.spec.ts
// Remova o .skip da linha:
test.describe.skip('NF Monitor - Electron E2E (Real App)', () => {
//              ^^^^ remove isto

// Configure o caminho do main.js:
args: ['./dist/main.js'], // ← seu arquivo principal
```

### 🔧 **4. Handlers IPC Disponíveis**

O test harness registra estes handlers:

```typescript
✅ test:scanNow           - Executa scan de NFEs
✅ test:simulateTrayClick - Simula clique na bandeja  
✅ test:simulateTrayRightClick - Clique direito na bandeja
✅ test:processNFE        - Processa NFE específica
✅ test:createTray        - Cria ícone na bandeja
✅ test:getWindowStatus   - Status da janela
```

### 📱 **5. Eventos Monitorados**

```typescript
// Eventos enviados para renderer:
ipcRenderer.on('tray-click', () => {
  console.log('Clique na bandeja!');
});

ipcRenderer.on('tray-right-click', () => {
  console.log('Clique direito na bandeja!');
});

ipcRenderer.on('nfe-processada', (event, dados) => {
  console.log('NFE processada:', dados);
});
```

### 🎯 **6. Próximos Passos**

1. **✅ Testes Demo**: Funcionando perfeitamente
2. **🔧 Adicione data-testids**: Na sua UI atual  
3. **⚙️ Configure main.ts**: Com o test harness
4. **🚀 Ative testes reais**: Remova .skip
5. **▶️ Execute**: `npm run test:e2e`

### 📈 **Status Atual:**

**✅ ESTRUTURA COMPLETA FUNCIONANDO**
- ✅ Testes demo passando (5/5)
- ✅ Test harness configurado
- ✅ Seletores documentados  
- ✅ IPC handlers prontos
- 🔧 Aguardando integração com app real

**Pronto para detectar cliques na bandeja e NFE!** 🎉