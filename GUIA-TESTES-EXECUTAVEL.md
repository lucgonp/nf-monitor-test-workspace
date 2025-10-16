# Guia de Testes do Executável NF Monitor

## Comandos Disponíveis

### Testes Básicos (Recomendado para começar)
```bash
npm run test:e2e:basico
```
- ✅ Testes que funcionam com o app real
- ❌ Não precisa de modificações no app de produção
- 🎯 Foca em funcionalidades básicas

### Testes Avançados (Precisa de integração)
```bash
npm run test:e2e:exe
```
- ⚠️ Requer test harness integrado no app
- 🔧 Testa IPC e funcionalidades específicas
- 🎯 Cobertura completa de funcionalidades

## Interpretação dos Resultados

### ✅ SUCESSOS ESPERADOS

**Teste Básico - O que deve funcionar:**
- Abertura do aplicativo
- Carregamento da interface
- Cliques básicos na UI
- Minimização/restauração de janela
- Navegação por teclado

**Indicadores de sucesso:**
```
📋 Título da página: "Monitor"
📊 Encontrados X elementos na interface
🖱️ Encontrados X elementos clicáveis
✅ Interface carregada com sucesso!
```

### ⚠️ PROBLEMAS COMUNS

**1. Título incorreto:**
```
Expected: "NF Monitor"
Actual: "Monitor"
```
**Solução:** Normal, o teste aceita ambos os títulos.

**2. IPC não disponível:**
```
Cannot read properties of undefined (reading 'invoke')
```
**Solução:** Use `test:e2e:basico` ao invés de `test:e2e:exe`

**3. Elementos NFE não encontrados:**
```
ℹ️ Nenhum elemento NFE encontrado (normal se não há dados)
```
**Solução:** Normal se não há arquivos XML no diretório de monitoramento.

### 🔧 INTEGRAÇÃO COMPLETA

Para habilitar todos os testes avançados, adicione ao app de produção:

**1. No main.ts ou main.js:**
```javascript
if (process.env.ELECTRON_TEST === '1') {
  const { registerTestIpc } = require('./test-harness/ipc-test-hook');
  registerTestIpc();
}
```

**2. No renderer (HTML):**
```html
<!-- Adicione data-testid nos elementos importantes -->
<button data-testid="scan-button">Escanear</button>
<div data-testid="nfe-list">...</div>
<div data-testid="status-bar">...</div>
```

## Debugging

### Screenshots automáticos
Os testes salvam screenshots em `./test-results/` para debugging.

### Logs detalhados
```bash
npm run test:e2e:basico -- --headed
```
Executa com interface visível para debugging.

### Modo interativo
```bash
npm run test:e2e:basico:ui
```
Interface gráfica do Playwright para debug interativo.

## Próximos Passos

1. **✅ Execute primeiro:** `npm run test:e2e:basico`
2. **📊 Analise resultados:** Verifique screenshots e logs
3. **🔧 Se necessário:** Integre test harness para testes avançados
4. **🎯 Expanda:** Adicione mais testes específicos

## Exemplos de Uso

### Teste rápido
```bash
npm run test:e2e:basico
```

### Teste com interface visível
```bash
npm run test:e2e:basico -- --headed
```

### Teste específico
```bash
npx playwright test tests/e2e/electron-basico.spec.ts -g "Abre o aplicativo"
```

### Debug interativo
```bash
npm run test:e2e:basico:ui
```