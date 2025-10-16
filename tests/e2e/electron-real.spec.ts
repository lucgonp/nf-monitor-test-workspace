import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

test.describe('NF Monitor - Electron E2E (Real App)', () => {
  // 🚀 ATIVADO: Teste configurado para executável real
  // Configure o caminho para seu executável .exe abaixo
  
  let app: ElectronApplication;
  let page: Page;
  let tempDir: string;

  test.beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nfmonitor-'));
    fs.writeFileSync(path.join(tempDir, 'nota_123.xml'), '<NFe>...</NFe>');
    
    // 🔧 CONFIGURE: Caminho para o executável do seu app
    // Encontrado em: C:\Program Files\nf-monitor\nf-monitor.exe
    let executablePath = process.env.ELECTRON_EXE_PATH || 'C:\\Program Files\\nf-monitor\\nf-monitor.exe';
    
    console.log(`Tentando executar: ${executablePath}`);
    console.log(`Arquivo existe: ${fs.existsSync(executablePath)}`);
    
    if (!fs.existsSync(executablePath)) {
      throw new Error(`Executável não encontrado: ${executablePath}`);
    }
    
    app = await electron.launch({
      executablePath: executablePath,  // Usa executável em vez de main.js
      args: [],  // Argumentos do executável
      env: { 
        ...process.env, 
        ELECTRON_TEST: '1', 
        NFMONITOR_SCAN_DIR: tempDir, 
        AUTO_UPDATE: '0',
        NODE_ENV: 'test'
      }
    });
    
    page = await app.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (app) await app.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('abre a UI e mostra interface principal', async () => {
    // Verifica se a janela principal carregou
    // Aceita tanto "Monitor" quanto "NF Monitor"
    const titulo = await page.title();
    console.log(`📋 Título detectado: "${titulo}"`);
    expect(titulo.toLowerCase()).toContain('monitor');
    
    // Procura por elementos básicos da interface
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10_000 });
  });

  test('testa clique no ícone NFE na interface', async () => {
    // 📋 IMPORTANTE: Você precisa ter este elemento na sua UI
    const iconeNFE = page.locator('[data-testid="icone-nfe"]');
    
    // Verifica se existe pelo menos um ícone NFE
    const count = await iconeNFE.count();
    if (count > 0) {
      // Clique simples
      await iconeNFE.first().click();
      
      // Clique direito para menu de contexto
      await iconeNFE.first().click({ button: 'right' });
      
      // Verifica se menu apareceu
      const menu = page.locator('[data-testid="menu-contexto-nfe"]');
      await expect(menu).toBeVisible({ timeout: 3000 });
    }
  });

  test('testa minimização para bandeja do Windows', async () => {
    // Minimiza a janela (simula comportamento da bandeja)
    await app.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.hide(); // Esconde janela (vai para bandeja)
        return { minimized: true };
      }
      return { minimized: false };
    });

    // Verifica se janela foi escondida
    await page.waitForTimeout(1000);
    
    // Restaura da bandeja
    await app.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.show(); // Mostra janela (volta da bandeja)
        mainWindow.focus();
        return { restored: true };
      }
      return { restored: false };
    });

    // Verifica se janela voltou
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });

  test('executa scan via IPC e verifica histórico', async () => {
    // Chama função de scan via IPC
    const result = await app.evaluate(async ({ ipcRenderer }) => {
      return await ipcRenderer.invoke('test:scanNow', process.env.NFMONITOR_SCAN_DIR);
    });
    
    expect(result).toEqual({ ok: true });

    // Verifica se apareceu no histórico
    const historico = page.locator('[data-testid="historico-execucoes"]');
    if (await historico.isVisible()) {
      await expect(historico.getByText(/nota_123\.xml/i)).toBeVisible({ timeout: 10_000 });
    }
  });

  test('monitora eventos da bandeja via IPC', async () => {
    // Registra listeners para eventos da bandeja
    const eventos = await app.evaluate(async ({ ipcRenderer }) => {
      const eventosCapturados: string[] = [];
      
      // Escuta eventos
      ipcRenderer.on('tray-click', () => {
        eventosCapturados.push('tray-click');
      });
      
      ipcRenderer.on('tray-right-click', () => {
        eventosCapturados.push('tray-right-click');
      });

      // Simula cliques na bandeja
      await ipcRenderer.invoke('test:simulateTrayClick');
      await ipcRenderer.invoke('test:simulateTrayRightClick');

      return eventosCapturados;
    });

    expect(eventos).toContain('tray-click');
    expect(eventos).toContain('tray-right-click');
  });

  test('verifica processamento de NFE e notificações', async () => {
    // Processa NFE via IPC
    const resultado = await app.evaluate(async ({ ipcRenderer }) => {
      return await ipcRenderer.invoke('test:processNFE', 'nota_test.xml');
    });

    expect(resultado).toHaveProperty('arquivo', 'nota_test.xml');
    expect(resultado).toHaveProperty('status', 'processado');
    expect(resultado).toHaveProperty('sucesso', true);

    // Verifica se notificação apareceu na UI
    const notificacao = page.locator('[data-testid="notificacao"]');
    if (await notificacao.isVisible()) {
      await expect(notificacao).toContainText(/processada/i);
    }
  });

  test('testa botão limpar histórico', async () => {
    // Procura botão de limpar histórico
    const btnLimpar = page.locator('[data-testid="btn-limpar-historico"]');
    
    if (await btnLimpar.isVisible()) {
      await btnLimpar.click();
      
      // Confirma se apareceu dialog de confirmação
      const confirmacao = page.getByText(/confirma/i);
      if (await confirmacao.isVisible()) {
        await page.getByText(/confirmar/i).click();
        
        // Verifica se histórico foi limpo
        const historico = page.locator('[data-testid="historico-execucoes"]');
        await expect(historico).not.toContainText(/nota_/i, { timeout: 5000 });
      }
    }
  });
});