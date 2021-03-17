'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'

import XLSX from 'xlsx'


const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1400,
    height: 700,
    // frame: false,
    // titleBarStyle: 'hiddenInset',
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true, //process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }
  })

  // opacity windows basic
  win.setOpacity(0.95)


  //Menu
  // win.excludedFromShownWindowsMenu = true
  // const menu = Menu.buildFromTemplate(templateMenu)
  // Menu.setApplicationMenu(menu)


  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// const templateMenu = [
//   {
//     label: 'Archivo',
//     submenu: [
//       {
//         label: 'Subir Excel         Ctrl+N',
//         acclerator: 'Ctrl+N',
//         click() {
//           const obt = {
//             name: 'tony'
//           }
//           ipcMain.send('openDialogExcel', obt)
//         }
//       }
//     ]
//   }
// ]


// read file excel
const readExcel = (path) => {
  const workbook = XLSX.readFile(path)
  const workBookSheets = workbook.SheetNames
  const sheet = workBookSheets[0]
  const dataExcel = XLSX.utils.sheet_to_json(
    workbook.Sheets[sheet]
  )

  return dataExcel
}

const excelPathFunc = () => {
  const rootPath = path.dirname(__dirname)
  const excelPath = path.join(rootPath, 'public/DUMMY_DATA_FK.xlsx')
  return excelPath
}

const dataExcelFull = () => {
  const excelPath = excelPathFunc()
  return readExcel(excelPath)
}

const notifications = (event, show=false, text="", color="") => {
  event.reply('sendNotifications', {
    snackbar: show,
    text,
    color,
  })
}

// validate if exist data in frontend, else not send data
// faltantes: validar si existe el archivo con la extension .xlsx
// mandar mensajes de confirmacion si existe o su formato del file
ipcMain.on('verificationData', (event, args) => {
  if (args) {
    console.log('existe data, no cargar nada en el front');
  } else {
    const data = dataExcelFull()
    event.reply('dtaExcel', data)
  }
})

// delete row in excel
// faltantes, validar si en el excel se elimina y enviar mensaje de confirmacion
ipcMain.on('deleteRow', (event, args) => {
  const data = dataExcelFull()
  data.splice(data[args], 1)
  //send notifications
  notifications(event, true, "Se eliminó correctamente.", "green lighten-1")
})

// edit row in excel
// faltantes, validar si en el excel se editó y enviar mensaje de confirmacion
ipcMain.on('editRow', (event, args) => {
  const { index, dataChanged } = args
  const data = dataExcelFull()
  Object.assign(data[index], dataChanged);

  //send notifications
  notifications(event, true, "Se editó correctamente.", "green lighten-1")
})

// item new row in excel
// faltantes, validar si en el excel se guardó y enviar mensaje de confirmacion
ipcMain.on('productNewRow', (event, args) => {
  const data = dataExcelFull()
  data.push(args)

  //send notifications
  notifications(event, true, "Se guardó correctamente.", "green lighten-1")
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {


  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
