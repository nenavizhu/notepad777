const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 900, height: 650,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    backgroundMaterial: 'acrylic',
    resizable: true,
    minWidth: 400,
    minHeight: 300,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    show: false,
    hasShadow: true,
  })

  win.loadFile('index.html')
  win.once('ready-to-show', () => {
    win.show()
    const [w, h] = win.getSize()
    setTimeout(() => { win.setSize(w + 1, h, false); win.setSize(w, h, false) }, 100)
  })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

ipcMain.handle('open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog(win, {
    filters: [{ name: 'Текст', extensions: ['txt','md','js','py','json','html','css'] }]
  })
  if (!filePaths.length) return null
  return { path: filePaths[0], content: fs.readFileSync(filePaths[0], 'utf-8') }
})

ipcMain.handle('save-file', async (e, { filePath, content }) => {
  if (filePath) { fs.writeFileSync(filePath, content, 'utf-8'); return filePath }
  const { filePath: p } = await dialog.showSaveDialog(win, {
    filters: [{ name: 'Текст', extensions: ['txt','md'] }]
  })
  if (!p) return null
  fs.writeFileSync(p, content, 'utf-8'); return p
})

ipcMain.on('minimize', () => win.minimize())
ipcMain.on('maximize', () => { win.setResizable(true); win.isMaximized() ? win.unmaximize() : win.maximize(); setTimeout(()=>win.setResizable(false),300) })
ipcMain.on('close', () => win.close())
ipcMain.handle('get-bounds', () => win.getBounds())
ipcMain.on('set-position', (e, { x, y }) => win.setPosition(x, y, false))
ipcMain.on('set-ontop', (e, val) => win.setAlwaysOnTop(val))
