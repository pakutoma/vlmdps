"use strict";

const app = require("app");
const BrowserWindow = require("browser-window");
const Menu = require('menu');
const electron = require('electron');
const ipcMain = electron.ipcMain;
const EventEmitter = require('events').EventEmitter;
const mdevent = new EventEmitter();
const chokidar = require('chokidar');
const loadmd = require('./lib/loadmd');

let mainWindow = null;
let watcher = null;

ipcMain.on('get-slide-data-index',(getevent,getarg) => {
    mdevent.once('diropen',dir => {
        loadmd(dir)
            .then(result => getevent.sender.send('get-slide-data-index-reply',result));
        watcher = chokidar.watch(dir,{
            ignored: /[\/\\]\./,
            persistent: true
        });
        watcher
            .on('add', path => console.log(path))
            .on('change', path => console.log(path))
            .on('unlink', path => console.log(path));
    });
});

function openSlideshowWindow(display) {
    let slideshowWindow = new BrowserWindow({x: display.bounds.x,y: display.bounds.y,fullscreen: true,autoHideMenuBar: true});
    slideshowWindow.loadURL("file://" + __dirname + "/slideshow.html");
    slideshowWindow.on("closed",() => {
        slideshowWindow.null;
        ipcMain.removeAllListeners('get-slide-data');
        ipcMain.removeAllListeners('post-slide-data');
    });
    ipcMain.on('get-slide-data', (getevent,getarg) => {
        ipcMain.once('post-slide-data', (postevent,postarg) => {
            getevent.sender.send('get-slide-data-reply',postarg);
        });
    });
    ipcMain.once('close-slideshow', e => slideshowWindow.close());
}

app.on("window-all-closed", () => {
    if(process.platform != "darwin") {
        app.quit();
    }
});

const menu = Menu.buildFromTemplate([{
        label: 'ファイル',
        submenu: [{
            label: '開く',
            accelerator: 'Control+O',
            click: () => {
                require('dialog').showOpenDialog(
                    {
                        properties: ['openDirectory']
                    },
                    baseDir => {
                        if (baseDir && baseDir[0]) {
                            const dir = baseDir[0];
                            process.nextTick(() => mdevent.emit('diropen',dir));
                        }
                    }  
                );     
            }          
        },{
            label: '終了',
            accelerator: 'Control+Q',
            click: () => app.quit()
        }]                  
    },{                      
        label: 'スライドショー',
        submenu: [{
            label: '開始(ディスプレイ1)',
            accelerator: 'Control+1',
            click: () => {
                const electronScreen = electron.screen;
                const displays = electronScreen.getAllDisplays();
                if (displays[0]) {
                    openSlideshowWindow(displays[0]);
                }
            }
        },{
            label: '開始(ディスプレイ2)',
            accelerator: 'Control+2',
            click: () => {
                const electronScreen = electron.screen;
                const displays = electronScreen.getAllDisplays();
                if (displays[1]) {
                    openSlideshowWindow(displays[1]);
                }
            }
        }]
    },{                      
        label: '表示',
        submenu: [{
            label: 'リロード',
            accelerator: 'Control+R',
            click: () => BrowserWindow.getFocusedWindow().reloadIgnoringCache()
        },{
            label: '開発者ツールの表示/非表示',
            accelerator: 'Control+Shift+I',
            click: () => BrowserWindow.getFocusedWindow().toggleDevTools()
        }]
    }
]);                        

app.on("ready", () => {
    mainWindow = new BrowserWindow({});
    mainWindow.setMenu(menu);
    mainWindow.loadURL("file://" + __dirname + "/index.html");
    mainWindow.on("closed",() => mainWindow.null);
});

