'use strict';

var app = require('electron').app;
var BrowserWindow = require('electron').BrowserWindow;
var mainWindow = null;
var ipc = require('electron').ipcMain;
var os = require('os');
var {dialog} = require('electron');
const { autoUpdater } = require('electron-updater');

ipc.on('close-main-window', function() {
    app.quit();
});

app.on('ready', function() {
    autoUpdater.checkForUpdatesAndNotify();

    mainWindow = new BrowserWindow({
        resizable: false,
        autoHideMenuBar: true,
        height: 600,
        width: 800,
        webPreferences:{
          nodeIntegration:true,
          contextIsolation: false
        },
        icon: 'icon.png' // sets window icon
    });

mainWindow.loadURL('file://' + __dirname + '/main.html');
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});



ipc.on('open-file-dialog-for-file', function (event) {
    console.log("button pressed")
    console.log(os.platform())
    if(os.platform() === 'linux' || os.platform() === 'win32'){

        dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
                { name: 'All Files', extensions: ['*'] }
              ]
          }).then(result => {
            console.log(result.filePaths)
            event.sender.send("selected-file",result.filePaths[0])
          }).catch(err => {
            console.log(err)
          })
   } else {
       dialog.showOpenDialog({
           properties: ['openFile', 'openDirectory']
       }, function (files) {
           if (files) event.sender.send('selected-file', files[0]);
       });
   }});