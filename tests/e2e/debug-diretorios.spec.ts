import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';

test.describe('NF Monitor - Investigação Interface Diretórios', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeAll(async () => {
    const executablePath = 'C:\\Program Files\\nf-monitor\\nf-monitor.exe';
    
    app = await electron.launch({
      executablePath: executablePath,
      args: [],
      env: { ...process.env, ELECTRON_TEST: '1', AUTO_UPDATE: '0' }
    });
    
    page = await app.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (app) await app.close();
  });

  test('🔍 Investiga interface de diretórios', async () => {
    console.log('📂 Acessando Selecionar Diretórios...');
    
    // Acessa o menu
    const menuDiretorios = page.locator('button', { hasText: 'Selecionar Diretórios' });
    await menuDiretorios.click();
    await page.waitForTimeout(3000);
    
    console.log('🔍 Analisando elementos na interface...');
    
    // Analisa todos os botões visíveis
    const botoes = page.locator('button');
    const countBotoes = await botoes.count();
    
    console.log(`🎯 Total de botões: ${countBotoes}`);
    
    for (let i = 0; i < Math.min(countBotoes, 10); i++) {
      const botao = botoes.nth(i);
      const texto = await botao.textContent();
      const isVisible = await botao.isVisible();
      const classes = await botao.getAttribute('class');
      
      console.log(`   Botão ${i + 1}: "${texto?.trim()}" (visível: ${isVisible})`);
      if (classes) console.log(`      Classes: ${classes.substring(0, 100)}`);
    }
    
    // Procura por tabelas ou listas
    console.log('\n📋 Procurando por tabelas/listas...');
    
    const tabelas = page.locator('table, [role="table"], .table');
    const countTabelas = await tabelas.count();
    console.log(`📊 Tabelas encontradas: ${countTabelas}`);
    
    // Procura por elementos que contenham caminhos
    const elementosCaminhos = await page.locator('*').evaluateAll(elements => {
      return elements
        .filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('downloads') || 
                 text.includes('c:') ||
                 text.includes('certificado') ||
                 text.includes('/') ||
                 text.includes('\\');
        })
        .map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 200),
          id: el.id,
          classes: el.className
        }))
        .slice(0, 10);
    });
    
    console.log('\n🗂️ Elementos com caminhos:');
    elementosCaminhos.forEach((el, i) => {
      console.log(`   ${i + 1}. ${el.tag}: "${el.text}"`);
    });
    
    // Procura por botões de ação específicos
    console.log('\n🔍 Procurando botões de ação...');
    
    const textosBotoes = [
      'Selecionar diretórios para envio de notas',
      'Selecionar diretórios para envio de documentos',
      'adicionar',
      'excluir',
      'remover',
      'delete'
    ];
    
    for (const texto of textosBotoes) {
      const botao = page.getByText(texto, { exact: false });
      const count = await botao.count();
      
      if (count > 0) {
        console.log(`✅ Encontrado: "${texto}" (${count} elementos)`);
      }
    }
    
    // Tira screenshot para análise visual
    try {
      await page.screenshot({ 
        path: './test-results/interface-diretorios-debug.png',
        fullPage: true,
        timeout: 5000
      });
      console.log('\n📸 Screenshot salvo: ./test-results/interface-diretorios-debug.png');
    } catch (error) {
      console.log(`\n⚠️ Erro ao capturar screenshot: ${error}`);
    }
  });

  test('🖱️ Testa cliques nos botões principais', async () => {
    console.log('🖱️ Testando cliques nos botões...');
    
    // Acessa o menu
    const menuDiretorios = page.locator('button', { hasText: 'Selecionar Diretórios' });
    await menuDiretorios.click();
    await page.waitForTimeout(2000);
    
    // Tenta clicar no botão de selecionar diretórios para notas
    const btnSelecionarNotas = page.getByText('Selecionar diretórios para envio de notas');
    
    if (await btnSelecionarNotas.isVisible()) {
      console.log('📁 Clicando em "Selecionar diretórios para envio de notas"...');
      await btnSelecionarNotas.click();
      
      // Aguarda um pouco para ver se abre dialog
      await page.waitForTimeout(3000);
      
      console.log('✅ Clique realizado - aguardando resposta do sistema');
    } else {
      console.log('❌ Botão de selecionar notas não encontrado');
    }
    
    // Tenta clicar no botão de documentos de cadastro
    const btnDocumentos = page.getByText('Selecionar diretórios para envio de documentos de cadastro');
    
    if (await btnDocumentos.isVisible()) {
      console.log('📄 Clicando em "Selecionar diretórios para documentos"...');
      await btnDocumentos.click();
      await page.waitForTimeout(3000);
      console.log('✅ Clique em documentos realizado');
    } else {
      console.log('❌ Botão de documentos não encontrado');
    }
  });
});