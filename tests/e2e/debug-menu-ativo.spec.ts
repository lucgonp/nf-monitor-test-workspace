import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

test.describe('NF Monitor - Investigação Menu Ativo', () => {
  let app: ElectronApplication;
  let page: Page;
  let tempDir: string;

  test.beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nfmonitor-'));
    
    const executablePath = 'C:\\Program Files\\nf-monitor\\nf-monitor.exe';
    
    app = await electron.launch({
      executablePath: executablePath,
      args: [],
      env: { 
        ...process.env, 
        ELECTRON_TEST: '1', 
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

  test('🔍 Investiga menu "Envio de Notas" selecionado', async () => {
    console.log('🕵️ Investigando estado do menu "Envio de Notas"...');
    
    // 1. Busca por diferentes variações do texto
    const variacoesTexto = [
      'Envio de Notas',
      'Envio de nota',
      'envio de notas',
      'ENVIO DE NOTAS',
      'Nota',
      'Notas'
    ];

    for (const variacao of variacoesTexto) {
      const elemento = page.getByText(variacao, { exact: false });
      const count = await elemento.count();
      
      if (count > 0) {
        console.log(`✅ Encontrado texto: "${variacao}" (${count} elementos)`);
        
        // Verifica classes CSS do elemento
        for (let i = 0; i < count; i++) {
          const elementoAtual = elemento.nth(i);
          const classes = await elementoAtual.getAttribute('class');
          const isVisible = await elementoAtual.isVisible();
          
          console.log(`   📋 Elemento ${i + 1}: classes="${classes}", visível=${isVisible}`);
        }
      }
    }

    // 2. Procura por elementos com estados ativos
    console.log('\n🎯 Procurando elementos com estados ativos...');
    
    const seletoresAtivos = [
      '.active',
      '.selected', 
      '.current',
      '.highlighted',
      '[aria-selected="true"]',
      '[aria-current="page"]',
      '[data-active="true"]',
      '.menu-active',
      '.tab-active'
    ];

    for (const seletor of seletoresAtivos) {
      const elementos = page.locator(seletor);
      const count = await elementos.count();
      
      if (count > 0) {
        console.log(`🔥 ${count} elemento(s) com seletor: ${seletor}`);
        
        for (let i = 0; i < count; i++) {
          const elemento = elementos.nth(i);
          const texto = await elemento.textContent();
          const tag = await elemento.evaluate(el => el.tagName);
          
          console.log(`   📌 ${tag}: "${texto?.trim()}"`);
        }
      }
    }

    // 3. Captura todo o HTML da área de menus
    console.log('\n📄 Analisando HTML da área de menus...');
    
    const possiveisContainers = [
      'nav',
      '.menu',
      '.navigation',
      '.tabs',
      '.header',
      '[role="navigation"]'
    ];

    for (const container of possiveisContainers) {
      const elementos = page.locator(container);
      const count = await elementos.count();
      
      if (count > 0) {
        console.log(`📦 Container encontrado: ${container}`);
        
        const html = await elementos.first().innerHTML();
        console.log(`   📋 HTML (primeiros 200 chars): ${html.substring(0, 200)}...`);
      }
    }
  });

  test('🎨 Analisa estilos CSS dos menus', async () => {
    console.log('🎨 Analisando estilos CSS...');
    
    // Procura todos os elementos que podem ser menus
    const elementos = await page.locator('*').evaluateAll(elements => {
      return elements
        .filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('envio') || 
                 text.includes('nota') || 
                 text.includes('documento') || 
                 text.includes('diretório') || 
                 text.includes('config');
        })
        .map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          className: el.className,
          id: el.id,
          styles: {
            backgroundColor: window.getComputedStyle(el).backgroundColor,
            color: window.getComputedStyle(el).color,
            fontWeight: window.getComputedStyle(el).fontWeight,
            textDecoration: window.getComputedStyle(el).textDecoration
          }
        }));
    });

    console.log(`🔍 ${elementos.length} elementos relacionados aos menus encontrados:`);
    
    elementos.forEach((el, index) => {
      console.log(`\n📌 Elemento ${index + 1}:`);
      console.log(`   Tag: ${el.tag}`);
      console.log(`   Texto: "${el.text}"`);
      console.log(`   Classes: "${el.className}"`);
      console.log(`   ID: "${el.id}"`);
      console.log(`   Cor de fundo: ${el.styles.backgroundColor}`);
      console.log(`   Cor do texto: ${el.styles.color}`);
      console.log(`   Peso da fonte: ${el.styles.fontWeight}`);
    });
  });

  test('🔍 Busca por ícones próximos ao texto', async () => {
    console.log('🔍 Procurando por ícones próximos aos menus...');
    
    // Procura por elementos com ícones comuns
    const seletoresIcones = [
      'i',
      '.icon',
      '.fa',
      '.material-icons',
      'svg',
      '[class*="icon"]',
      'img'
    ];

    for (const seletor of seletoresIcones) {
      const icones = page.locator(seletor);
      const count = await icones.count();
      
      if (count > 0) {
        console.log(`🎯 ${count} ícone(s) encontrado(s) com seletor: ${seletor}`);
        
        // Para cada ícone, verifica o texto do elemento pai
        for (let i = 0; i < Math.min(count, 10); i++) {
          const icone = icones.nth(i);
          const pai = icone.locator('xpath=..');
          const textoPai = await pai.textContent();
          
          if (textoPai && textoPai.toLowerCase().includes('envio')) {
            console.log(`   🔥 Ícone relacionado a "Envio": "${textoPai.trim()}"`);
          }
        }
      }
    }
  });

  test('📸 Tira screenshot da área de menus', async () => {
    console.log('📸 Tirando screenshot para análise visual...');
    
    try {
      // Screenshot da página inteira
      await page.screenshot({ 
        path: './test-results/menus-completo.png',
        fullPage: true,
        timeout: 5000
      });
      
      console.log('✅ Screenshot salvo em: ./test-results/menus-completo.png');
      
      // Tenta capturar só a área superior (onde ficam os menus)
      const header = page.locator('header, nav, .header, .navigation, .menu').first();
      
      if (await header.isVisible()) {
        await header.screenshot({ 
          path: './test-results/area-menus.png',
          timeout: 5000
        });
        console.log('✅ Screenshot da área de menus salvo');
      }
      
    } catch (error) {
      console.log(`⚠️ Erro ao tirar screenshot: ${error}`);
    }
  });
});