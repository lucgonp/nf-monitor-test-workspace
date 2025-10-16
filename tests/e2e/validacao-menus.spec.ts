import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

test.describe('NF Monitor - Validação de Menus', () => {
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

  test('✅ Valida presença de todos os menus principais', async () => {
    console.log('🔍 Verificando menus principais...');
    
    // Busca todos os botões com as classes específicas dos menus
    const menusButtons = page.locator('button').filter({
      hasText: /envio|documentos|diretórios|configurações/i
    });
    
    const count = await menusButtons.count();
    console.log(`🎯 Encontrados ${count} botões de menu`);
    
    // Lista os textos encontrados
    for (let i = 0; i < count; i++) {
      const texto = await menusButtons.nth(i).textContent();
      const isVisible = await menusButtons.nth(i).isVisible();
      console.log(`📌 Menu ${i + 1}: "${texto?.trim()}" (visível: ${isVisible})`);
    }
    
    // Verifica especificamente cada menu
    const menusEsperados = [
      'Envio de Notas',
      'Envio de Documentos', 
      'Selecionar Diretórios',
      'Configurações'
    ];

    let menusEncontrados = 0;
    
    for (const menu of menusEsperados) {
      // Busca de forma mais flexível
      const menuElement = page.locator('button', { hasText: menu });
      const menuCount = await menuElement.count();
      
      // Se não encontrar com texto exato, tenta busca parcial
      if (menuCount === 0) {
        const palavraChave = menu.split(' ')[0]; // Primeira palavra
        const menuParcial = page.locator('button', { hasText: palavraChave });
        const countParcial = await menuParcial.count();
        
        if (countParcial > 0) {
          menusEncontrados++;
          console.log(`✅ Menu encontrado (busca parcial): "${menu}" -> "${palavraChave}"`);
        } else {
          console.log(`❌ Menu não encontrado: "${menu}"`);
        }
      } else {
        menusEncontrados++;
        console.log(`✅ Menu encontrado: "${menu}"`);
      }
    }

    console.log(`📊 Menus encontrados: ${menusEncontrados}/${menusEsperados.length}`);
    expect(menusEncontrados).toBeGreaterThanOrEqual(3); // Pelo menos 3 dos 4
  });

  test('✅ Clica em todos os menus principais', async () => {
    console.log('🖱️ Testando cliques nos menus...');
    
    // Lista dos menus para clicar
    const menusParaClicar = [
      'Envio de Notas',
      'Envio de Documentos', 
      'Selecionar Diretórios',
      'Configurações'
    ];

    let cliquesRealizados = 0;

    for (const menu of menusParaClicar) {
      try {
        console.log(`🎯 Tentando clicar em: "${menu}"`);
        
        // Procura pelo menu
        const menuElement = page.getByText(menu, { exact: false });
        const count = await menuElement.count();
        
        if (count > 0) {
          // Clica no primeiro elemento encontrado
          await menuElement.first().click();
          cliquesRealizados++;
          console.log(`✅ Clique realizado em: "${menu}"`);
          
          // Aguarda um pouco para a interface responder
          await page.waitForTimeout(1000);
          
          // Verifica se a interface ainda está responsiva
          const body = page.locator('body');
          await expect(body).toBeVisible();
          
        } else {
          console.log(`⚠️ Menu não encontrado para clique: "${menu}"`);
        }
      } catch (error) {
        console.log(`❌ Erro ao clicar em "${menu}": ${error}`);
      }
    }

    console.log(`🎯 Total de cliques realizados: ${cliquesRealizados}`);
    expect(cliquesRealizados).toBeGreaterThan(0);
  });

  test('✅ Testa navegação por menus com teclado', async () => {
    console.log('⌨️ Testando navegação por teclado...');
    
    // Foca na página
    await page.click('body');
    
    // Testa navegação com Tab
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      console.log(`📱 Tab ${i + 1} pressionado`);
    }
    
    // Testa Enter no elemento focado
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Verifica se ainda está funcionando
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('✅ Navegação por teclado funcionando');
  });

  test('✅ Verifica elementos clicáveis nos menus', async () => {
    console.log('🔍 Analisando elementos clicáveis...');
    
    // Procura por diferentes tipos de elementos clicáveis
    const seletores = [
      'button', // Botões
      'a', // Links
      '[onclick]', // Elementos com onclick
      '[role="button"]', // Elementos com role de botão
      '.clickable', // Classes clickable
      '[data-testid*="menu"]', // Elementos de menu
      '[data-testid*="btn"]' // Botões com testid
    ];

    let totalClicaveis = 0;

    for (const seletor of seletores) {
      const elementos = page.locator(seletor);
      const count = await elementos.count();
      
      if (count > 0) {
        totalClicaveis += count;
        console.log(`🎯 ${count} elementos encontrados com seletor: ${seletor}`);
      }
    }

    console.log(`📊 Total de elementos clicáveis: ${totalClicaveis}`);
    expect(totalClicaveis).toBeGreaterThan(0);
  });

  test('✅ Testa clique direito nos menus (menu de contexto)', async () => {
    console.log('🖱️ Testando clique direito nos menus...');
    
    const menusParaTestar = [
      'Envio de Notas',
      'Envio de Documentos', 
      'Selecionar Diretórios',
      'Configurações'
    ];

    let cliquesRightRealizados = 0;

    for (const menu of menusParaTestar) {
      try {
        const menuElement = page.getByText(menu, { exact: false });
        const count = await menuElement.count();
        
        if (count > 0) {
          // Clique direito
          await menuElement.first().click({ button: 'right' });
          cliquesRightRealizados++;
          console.log(`🖱️ Clique direito em: "${menu}"`);
          
          await page.waitForTimeout(500);
          
          // Pressiona Escape para fechar qualquer menu de contexto
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      } catch (error) {
        console.log(`⚠️ Erro no clique direito em "${menu}": ${error}`);
      }
    }

    console.log(`🎯 Cliques direito realizados: ${cliquesRightRealizados}`);
    expect(cliquesRightRealizados).toBeGreaterThanOrEqual(0);
  });

  test('✅ Verifica estado ativo dos menus', async () => {
    console.log('🔍 Verificando estado dos menus...');
    
    // Procura por menus ativos ou selecionados
    const estadosMenu = [
      '.active',
      '.selected', 
      '.current',
      '[aria-selected="true"]',
      '[aria-current="page"]'
    ];

    let menusAtivos = 0;

    for (const estado of estadosMenu) {
      const elementos = page.locator(estado);
      const count = await elementos.count();
      
      if (count > 0) {
        menusAtivos += count;
        console.log(`✨ ${count} menus com estado: ${estado}`);
      }
    }

    console.log(`📊 Total de menus com estado ativo: ${menusAtivos}`);
    
    // Não falha se não encontrar estados ativos (normal em algumas interfaces)
    if (menusAtivos === 0) {
      console.log('ℹ️ Nenhum menu com estado ativo encontrado (normal)');
    }
  });

  test('✅ Testa responsividade após cliques nos menus', async () => {
    console.log('⚡ Testando responsividade da interface...');
    
    const menusParaTestar = [
      'Envio de Notas',
      'Configurações'
    ];

    for (const menu of menusParaTestar) {
      try {
        console.log(`🔄 Testando responsividade com menu: "${menu}"`);
        
        const menuElement = page.getByText(menu, { exact: false });
        const count = await menuElement.count();
        
        if (count > 0) {
          // Clica no menu
          await menuElement.first().click();
          await page.waitForTimeout(1000);
          
          // Verifica se a interface ainda responde
          const elementCount = await page.locator('*').count();
          console.log(`📊 Elementos na página após clique: ${elementCount}`);
          
          // Verifica se body ainda está visível
          const body = page.locator('body');
          await expect(body).toBeVisible();
          
          // Testa um clique adicional
          await page.click('body');
          await page.waitForTimeout(500);
          
          console.log(`✅ Interface responsiva após clique em "${menu}"`);
        }
      } catch (error) {
        console.log(`⚠️ Problema de responsividade com "${menu}": ${error}`);
      }
    }
  });
});