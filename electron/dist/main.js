"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var udp_client_1 = require("./udp_client");
var tcp_client_1 = require("./tcp_client");
var db_management_1 = require("./db_management");
var jsondb_management_1 = require("./jsondb_management");
function createWindow() {
    // Create the browser window.
    var mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '/preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, '/icon.png')
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "/../../dist/nach-electron/index.html"));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    //  Remove menu
    //   mainWindow.removeMenu();
    var tcpClient = new tcp_client_1.TCPClient();
    tcpClient.start(mainWindow);
    var udpClient = new udp_client_1.UDPClient();
    udpClient.start(mainWindow);
    db_management_1.connectToMongoDB();
    jsondb_management_1.start();
    console.log('in create window function');
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.whenReady().then(function () {
    // ipcMain.on('test', (event, message) => {
    //   console.log('got an IPC message', event, message);
    // });
    console.log('before create window');
    createWindow();
    console.log('after create window');
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
//# sourceMappingURL=main.js.map