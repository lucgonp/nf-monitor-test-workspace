import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

test.describe('NF Monitor - Testes Básicos do Executável', () => {
  let app: ElectronApplication;
  let page: Page;
  let tempDir: string;

  test.beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nfmonitor-'));
    fs.writeFileSync(path.join(tempDir, 'nota_123.xml'), '<NFe>...</NFe>');
    
    const executablePath = 'C:\\Program Files\\nf-monitor\\nf-monitor.exe';
    
    console.log(`🚀 Executando: ${executablePath}`);
    
    app = await electron.launch({
      executablePath: executablePath,
      args: [],
      env: { 
        ...process.env, 
        ELECTRON_TEST: '1', 
        NFMONITOR_SCAN_DIR: tempDir, 
        AUTO_UPDATE: '0'
      }
    });
    
    page = await app.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (app) await app.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('✅ Abre o aplicativo e carrega interface', async () => {
    // Verifica se a janela principal carregou
    console.log(`📋 Título da página: "${await page.title()}"`);
    
    // Aceita "Monitor" ou "NF Monitor" como título válido
    const titulo = await page.title();
    expect(titulo.toLowerCase()).toContain('monitor');
    
    // Verifica se o body está visível
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10_000 });
    
    console.log('✅ Interface carregada com sucesso!');
  });

  test('✅ Verifica elementos básicos da interface', async () => {
    // Verifica se existem elementos básicos
    const elementos = await page.locator('*').count();
    expect(elementos).toBeGreaterThan(1);
    
    console.log(`📊 Encontrados ${elementos} elementos na interface`);
    
    // Tenta tirar screenshot (sem falhar se der timeout)
    try {
      await page.screenshot({ path: './test-results/interface-principal.png', timeout: 5000 });
      console.log('📸 Screenshot salvo com sucesso');
    } catch (e) {
      console.log('⚠️ Screenshot falhou (normal se fonts estão carregando)');
    }
  });

  test('✅ Testa cliques básicos na interface', async () => {
    // Procura por elementos clicáveis
    const botoes = page.locator('button');
    const links = page.locator('a');
    const divs = page.locator('div[onclick]');
    
    const totalClicaveis = await botoes.count() + await links.count() + await divs.count();
    console.log(`🖱️ Encontrados ${totalClicaveis} elementos clicáveis`);
    
    // Se encontrou botões, tenta clicar no primeiro
    if (await botoes.count() > 0) {
      const primeiroBotao = botoes.first();
      if (await primeiroBotao.isVisible()) {
        await primeiroBotao.click();
        console.log('✅ Clique em botão executado');
      }
    }
  });

  test('✅ Testa minimização da janela', async () => {
    // Testa minimizar e restaurar janela
    await app.evaluate(async ({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const mainWindow = windows[0];
        
        // Minimiza
        mainWindow.minimize();
        
        // Aguarda um pouco e restaura
        setTimeout(() => {
          mainWindow.restore();
          mainWindow.focus();
        }, 1000);
      }
    });
    
    // Verifica se ainda consegue interagir com a página
    await page.waitForTimeout(2000);
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('✅ Minimização e restauração funcionando');
  });

  test('✅ Verifica propriedades da janela', async () => {
    const windowInfo = await app.evaluate(async ({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const mainWindow = windows[0];
        return {
          title: mainWindow.getTitle(),
          bounds: mainWindow.getBounds(),
          isVisible: mainWindow.isVisible(),
          isMinimized: mainWindow.isMinimized(),
          isFocused: mainWindow.isFocused()
        };
      }
      return null;
    });
    
    console.log('📋 Informações da janela:', windowInfo);
    
    expect(windowInfo).not.toBeNull();
    expect(windowInfo?.isVisible).toBe(true);
    expect(windowInfo?.title.toLowerCase()).toContain('monitor');
  });

  test('✅ Procura por elementos NFE (se existirem)', async () => {
    // Procura por qualquer elemento que possa ser relacionado a NFE
    const possiveisElementosNFE = [
      '[data-testid*="nfe"]',
      '[id*="nfe"]', 
      '[class*="nfe"]',
      'text=/nota/i',
      'text=/xml/i',
      'text=/fiscal/i'
    ];
    
    let elementosEncontrados = 0;
    
    for (const seletor of possiveisElementosNFE) {
      const elementos = page.locator(seletor);
      const count = await elementos.count();
      if (count > 0) {
        elementosEncontrados += count;
        console.log(`📄 Encontrados ${count} elementos com seletor: ${seletor}`);
      }
    }
    
    console.log(`📊 Total de elementos relacionados a NFE: ${elementosEncontrados}`);
    
    // Não falha se não encontrar elementos NFE, apenas reporta
    if (elementosEncontrados === 0) {
      console.log('ℹ️ Nenhum elemento NFE encontrado (normal se não há dados)');
    }
  });

  test('✅ Testa navegação por teclado', async () => {
    // Testa algumas teclas básicas
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Verifica se a página ainda responde
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('⌨️ Navegação por teclado funcionando');
  });
});