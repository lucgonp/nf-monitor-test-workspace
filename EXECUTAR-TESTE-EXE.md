# 🚀 **EXECUTANDO TESTES COM EXECUTÁVEL (.exe)**

## 📋 **Configuração para Testar seu Executável**

### 🎯 **1. Opções de Execução**

#### **A. Configurar Caminho do Executável**

Edite o arquivo `tests/e2e/electron-real.spec.ts` na linha:
```typescript
const executablePath = process.env.ELECTRON_EXE_PATH || 
                      './dist/nf-monitor.exe' ||  // ← MUDE AQUI
                      './build/win-unpacked/nf-monitor.exe' ||
                      './release/nf-monitor.exe';
```

#### **B. Usar Variável de Ambiente**
```bash
# Windows PowerShell
$env:ELECTRON_EXE_PATH="C:\caminho\para\seu\app.exe"
npm run test:e2e:exe

# Windows CMD
set ELECTRON_EXE_PATH=C:\caminho\para\seu\app.exe
npm run test:e2e:exe
```

### 🚀 **2. Comandos Disponíveis**

```bash
# Executar teste do executável
npm run test:e2e:exe

# Interface visual do teste do executável
npm run test:e2e:exe:ui

# Todos os testes E2E (demo + exe)
npm run test:e2e

# Interface visual de todos os testes
npm run test:e2e:ui
```

### 🔧 **3. Caminhos Comuns de Executáveis**

#### **Electron Builder:**
```
./dist/win-unpacked/nf-monitor.exe
./dist/nf-monitor Setup 1.0.0.exe
```

#### **Electron Forge:**
```
./out/nf-monitor-win32-x64/nf-monitor.exe
./out/make/squirrel.windows/x64/nf-monitor-1.0.0 Setup.exe
```

#### **Build Manual:**
```
./build/nf-monitor.exe
./release/nf-monitor.exe
```

### 📊 **4. Exemplo de Execução**

```bash
# 1. Configure o caminho (escolha uma opção):

# Opção A: Editar arquivo (permanente)
# Em tests/e2e/electron-real.spec.ts linha ~15

# Opção B: Variável de ambiente (temporário)
$env:ELECTRON_EXE_PATH="C:\path\to\your\app.exe"

# 2. Execute o teste
npm run test:e2e:exe

# 3. Ou com interface visual
npm run test:e2e:exe:ui
```

### 🎯 **5. O que o Teste Verifica**

#### **🔍 Interface:**
- ✅ Janela principal carrega
- ✅ Elementos com data-testid existem
- ✅ Título da aplicação

#### **📱 Bandeja:**
- ✅ Minimização para bandeja
- ✅ Restauração por clique
- ✅ Eventos de clique direito

#### **📄 NFE:**
- ✅ Clique em ícones NFE
- ✅ Menu de contexto
- ✅ Processamento via IPC

#### **🔄 Funcionalidades:**
- ✅ Scan de diretório
- ✅ Histórico de operações
- ✅ Notificações
- ✅ Limpar histórico

### ⚠️ **6. Requisitos**

Para o teste funcionar, seu executável deve:

1. **Estar compilado** e funcionando
2. **Aceitar variáveis de ambiente**:
   - `ELECTRON_TEST=1`
   - `NFMONITOR_SCAN_DIR=path`
   - `AUTO_UPDATE=0`
3. **Ter elementos com data-testid** na UI
4. **Implementar handlers IPC** do test-harness

### 🔧 **7. Troubleshooting**

#### **Erro: "executable not found"**
```bash
# Verifique se o caminho está correto
ls "C:\caminho\para\seu\app.exe"

# Ou use caminho relativo
ls "./dist/nf-monitor.exe"
```

#### **Erro: "failed to launch"**
```bash
# Teste executar manualmente primeiro
"C:\caminho\para\seu\app.exe"

# Verifique dependências
# - Visual C++ Redistributable
# - .NET Framework (se necessário)
```

#### **Erro: "timeout waiting for page"**
```bash
# Aumente timeout no teste ou
# Verifique se app abre interface gráfica
# Verifique variáveis de ambiente
```

### 🎉 **8. Execução Rápida**

```bash
# Teste rápido (assumindo ./dist/nf-monitor.exe)
npm run test:e2e:exe

# Com interface visual para debug
npm run test:e2e:exe:ui
```

**Status**: ✅ **Pronto para testar seu executável!**