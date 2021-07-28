import {app, BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';
import {UDPClient} from "./udp_client";
import {TCPClient} from "./tcp_client";
import {connectToMongoDB} from "./db_management";
import {start} from "./jsondb_management";

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '/preload.js'),
      nodeIntegration: true,
      contextIsolation : false
    },
    icon: path.join(__dirname, '/icon.png')
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, `/../../dist/nach-electron/index.html`))

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

//  Remove menu
//   mainWindow.removeMenu();

  const tcpClient = new TCPClient();
  tcpClient.start(mainWindow);

  const udpClient = new UDPClient();
  udpClient.start(mainWindow);

  connectToMongoDB();

  start();

  console.log('in create window function');

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  // ipcMain.on('test', (event, message) => {
  //   console.log('got an IPC message', event, message);
  // });

  console.log('before create window');
  createWindow();
  console.log('after create window');

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
