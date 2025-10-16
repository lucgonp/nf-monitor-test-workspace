// Importe no main.ts quando ELECTRON_TEST for true e registre o IPC abaixo:
import { ipcMain, Tray, nativeImage, BrowserWindow } from 'electron';
// import { scanDirectories } from '../src/core/scan'; // sua função real

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;

export function registerTestIpc() {
  ipcMain.handle('test:scanNow', async (_evt, dir?: string) => {
    // await scanDirectories({ baseDir: dir, includeSent: true });
    return { ok: true };
  });

  // Handler para simular cliques na bandeja
  ipcMain.handle('test:simulateTrayClick', async () => {
    if (mainWindow) {
      mainWindow.webContents.send('tray-click');
    }
    return { event: 'tray-click', timestamp: Date.now() };
  });

  ipcMain.handle('test:simulateTrayRightClick', async () => {
    if (mainWindow) {
      mainWindow.webContents.send('tray-right-click');
    }
    return { event: 'tray-right-click', timestamp: Date.now() };
  });

  // Handler para processar NFE e gerar notificação
  ipcMain.handle('test:processNFE', async (_evt, nomeArquivo: string) => {
    // Simula processamento de NFE
    const resultado = {
      arquivo: nomeArquivo,
      status: 'processado',
      timestamp: new Date().toISOString(),
      sucesso: true
    };

    // Envia notificação para o renderer
    if (mainWindow) {
      mainWindow.webContents.send('nfe-processada', resultado);
    }

    return resultado;
  });

  // Handler para criar/gerenciar tray de teste
  ipcMain.handle('test:createTray', async () => {
    if (!tray) {
      // Cria um ícone básico para teste (você deve ter um ícone real)
      const icon = nativeImage.createEmpty();
      tray = new Tray(icon);
      
      tray.setToolTip('NF Monitor - Teste');
      tray.setContextMenu(null);

      // Eventos de clique na bandeja
      tray.on('click', () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      });

      tray.on('right-click', () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray-context-menu');
        }
      });
    }
    return { trayCreated: true };
  });

  // Handler para obter status da janela
  ipcMain.handle('test:getWindowStatus', async () => {
    const windows = BrowserWindow.getAllWindows();
    mainWindow = windows[0] || null;
    
    return {
      windowCount: windows.length,
      isVisible: mainWindow?.isVisible() || false,
      isMinimized: mainWindow?.isMinimized() || false,
      isFocused: mainWindow?.isFocused() || false
    };
  });
}