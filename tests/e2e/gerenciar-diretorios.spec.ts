import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';

test.describe('NF Monitor - Validação de Diretórios', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeAll(async () => {
    const executablePath = 'C:\\Program Files\\nf-monitor\\nf-monitor.exe';
    
    console.log(`🚀 Executando: ${executablePath}`);
    
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
  });

  test('✅ Valida diretórios existentes e interface', async () => {
    console.log('📂 Navegando para Selecionar Diretórios...');
    
    // Clica no menu "Selecionar Diretórios" - usa first() para evitar ambiguidade
    const menuDiretorios = page.locator('button', { hasText: 'Selecionar Diretórios' }).first();
    await expect(menuDiretorios).toBeVisible();
    await menuDiretorios.click();
    
    console.log('✅ Menu Selecionar Diretórios acessado');
    await page.waitForTimeout(3000);
    
    // Verifica se chegou na página correta
    const tituloSecao = page.getByText('Selecionar diretórios para envio de notas');
    await expect(tituloSecao).toBeVisible({ timeout: 10000 });
    
    console.log('📋 Interface de diretórios carregada');
    
    // Valida os diretórios esperados
    const diretoriosEsperados = [
      { nome: 'notas', caminho: 'C:/Users/New User/Downloads/notas', data: '10/09/2025' },
      { nome: 'Certificados (2)', caminho: 'C:/Users/New User/Downloads/Certificados (2)', data: '01/09/2025' },
      { nome: 'certificadoV3', caminho: 'C:/Users/New User/Downloads/certificadoV3', data: '04/09/2025' }
    ];
    
    let diretoriosEncontrados = 0;
    
    for (const dir of diretoriosEsperados) {
      // Verifica se o caminho existe na interface
      const elementoCaminho = page.getByText(dir.caminho, { exact: false });
      const elementoData = page.getByText(dir.data, { exact: false });
      
      const caminhoVisivel = await elementoCaminho.isVisible();
      const dataVisivel = await elementoData.isVisible();
      
      if (caminhoVisivel && dataVisivel) {
        diretoriosEncontrados++;
        console.log(`✅ Diretório validado: ${dir.nome} (${dir.data})`);
      } else if (caminhoVisivel) {
        diretoriosEncontrados++;
        console.log(`✅ Diretório encontrado: ${dir.nome} (data não confirmada)`);
      } else {
        console.log(`❌ Diretório não encontrado: ${dir.nome}`);
      }
    }
    
    console.log(`📊 Diretórios validados: ${diretoriosEncontrados}/${diretoriosEsperados.length}`);
    expect(diretoriosEncontrados).toBeGreaterThanOrEqual(2);
  });

  test('� Verifica botões de ação disponíveis', async () => {
    console.log('� Analisando botões de ação...');
    
    // Acessa o menu primeiro
    const menuDiretorios = page.locator('button', { hasText: 'Selecionar Diretórios' }).first();
    await menuDiretorios.click();
    await page.waitForTimeout(3000);
    
    // Verifica botão de selecionar para notas
    const btnNotas = page.getByText('Selecionar diretórios para envio de notas');
    const notasVisivel = await btnNotas.isVisible();
    console.log(`📁 Botão "Selecionar para notas": ${notasVisivel ? '✅ Encontrado' : '❌ Não encontrado'}`);
    
    // Verifica botão de selecionar para documentos
    const btnDocumentos = page.getByText('Selecionar diretórios para envio de documentos de cadastro');
    const documentosVisivel = await btnDocumentos.isVisible();
    console.log(`� Botão "Selecionar para documentos": ${documentosVisivel ? '✅ Encontrado' : '❌ Não encontrado'}`);
    
    // Procura por botões de exclusão na tabela
    const botoesTabela = page.locator('table button, tbody button, tr button');
    const countBotoes = await botoesTabela.count();
    console.log(`🗑️ Botões na tabela: ${countBotoes}`);
    
    // Lista classes dos botões para identificar tipos
    for (let i = 0; i < Math.min(countBotoes, 5); i++) {
      const botao = botoesTabela.nth(i);
      const classes = await botao.getAttribute('class');
      const ariaLabel = await botao.getAttribute('aria-label');
      const title = await botao.getAttribute('title');
      
      console.log(`   Botão ${i + 1}: classes="${classes?.substring(0, 50)}..." title="${title}" aria="${ariaLabel}"`);
    }
    
    expect(notasVisivel || documentosVisivel).toBe(true);
  });

  test('📊 Analisa conteúdo das tabelas', async () => {
    console.log('📊 Analisando tabelas de diretórios...');
    
    // Acessa o menu
    const menuDiretorios = page.locator('button', { hasText: 'Selecionar Diretórios' }).first();
    await menuDiretorios.click();
    await page.waitForTimeout(3000);
    
    // Analisa primeira tabela (envio de notas)
    const tabelaNotas = page.locator('table').first();
    const linhasNotas = tabelaNotas.locator('tr');
    const countNotas = await linhasNotas.count();
    
    console.log(`📋 Tabela de notas: ${countNotas} linhas`);
    
    // Analisa segunda tabela (documentos de cadastro)
    const tabelaDocumentos = page.locator('table').nth(1);
    if (await tabelaDocumentos.isVisible()) {
      const linhasDocumentos = tabelaDocumentos.locator('tr');
      const countDocumentos = await linhasDocumentos.count();
      
      console.log(`� Tabela de documentos: ${countDocumentos} linhas`);
      
      // Lista o conteúdo das linhas da tabela de documentos
      for (let i = 1; i < Math.min(countDocumentos, 4); i++) { // Pula header
        const linha = linhasDocumentos.nth(i);
        const texto = await linha.textContent();
        console.log(`   Linha ${i}: "${texto?.trim()}"`);
      }
    }
    
    expect(countNotas).toBeGreaterThan(0);
  });

  test('� Valida estrutura específica esperada', async () => {
    console.log('� Validando estrutura específica...');
    
    // Acessa o menu
    const menuDiretorios = page.locator('button', { hasText: 'Selecionar Diretórios' }).first();
    await menuDiretorios.click();
    await page.waitForTimeout(3000);
    
    // Valida elementos específicos da interface
    const elementos = [
      'Lista dos diretórios para envio de notas',
      'Lista dos diretórios para envio de documentos de cadastro'
    ];
    
    let elementosEncontrados = 0;
    
    for (const elemento of elementos) {
      const found = page.getByText(elemento, { exact: false });
      if (await found.isVisible()) {
        elementosEncontrados++;
        console.log(`✅ Encontrado: "${elemento}"`);
      } else {
        console.log(`❌ Não encontrado: "${elemento}"`);
      }
    }
    
    // Verifica colunas da tabela (usando first() para evitar ambiguidade)
    const colunaDiretorio = page.getByText('Diretório', { exact: true }).first();
    const colunaModificacao = page.getByText('Modificação', { exact: true }).first();
    const colunaAcoes = page.getByText('Ações', { exact: true }).first();
    
    if (await colunaDiretorio.isVisible()) {
      elementosEncontrados++;
      console.log(`✅ Encontrado: "Diretório" (coluna)`);
    }
    if (await colunaModificacao.isVisible()) {
      elementosEncontrados++;
      console.log(`✅ Encontrado: "Modificação" (coluna)`);
    }
    if (await colunaAcoes.isVisible()) {
      elementosEncontrados++;
      console.log(`✅ Encontrado: "Ações" (coluna)`);
    }
    
    console.log(`📊 Elementos da interface: ${elementosEncontrados}/${elementos.length}`);
    
    // Verifica dados específicos esperados
    const dadosEsperados = [
      '10/09/2025',
      '01/09/2025', 
      '04/09/2025'
    ];
    
    let datasEncontradas = 0;
    
    for (const data of dadosEsperados) {
      const elementoData = page.getByText(data);
      if (await elementoData.isVisible()) {
        datasEncontradas++;
        console.log(`� Data encontrada: ${data}`);
      }
    }
    
    console.log(`📊 Datas validadas: ${datasEncontradas}/${dadosEsperados.length}`);
    
    expect(elementosEncontrados).toBeGreaterThanOrEqual(3);
    expect(datasEncontradas).toBeGreaterThanOrEqual(2);
  });
});