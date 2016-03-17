const app = require("app");
const BrowserWindow = require("browser-window");
const Menu = require('menu');
const electron = require('electron');
const ipcMain = electron.ipcMain;

let mainWindow = null;
let slidedata = "";

function openSlideshowWindow(display) {
    let slideshowWindow = new BrowserWindow({x: display.bounds.x,y: display.bounds.y,fullscreen: true,autoHideMenuBar: true});
    slideshowWindow.loadURL("file://" + __dirname + "/slideshow.html");
    slideshowWindow.on("closed",function() {
        slideshowWindow.null;
        ipcMain.removeAllListeners('get-slide-data');
        ipcMain.removeAllListeners('post-slide-data');
    });
    ipcMain.on('get-slide-data', function(getevent,getarg) {
        ipcMain.once('post-slide-data', function(postevent,postarg) {
            getevent.sender.send('get-slide-data-reply',postarg);
            postevent.sender.send('post-slide-data-reply',true);
        });
    });
    ipcMain.once('close-slideshow', e=>slideshowWindow.close());
}

app.on("window-all-closed", function() {
    if(process.platform != "darwin") {
        app.quit();
    }
});
const menu = Menu.buildFromTemplate([{
        label: 'ファイル',
        submenu: [{
            label: '開く',
            accelerator: 'Control+O',
            click: function() {
                require('dialog').showOpenDialog(
                    {
                        properties: ['openDirectory']
                    },
                    function (baseDir) {
                        if (baseDir && baseDir[0]) {
                            mainWindow.loadURL("file://" + __dirname + "/index.html#baseDir=" + encodeURIComponent(baseDir));
                        }
                    }  
                );     
            }          
        },{
            label: '終了',
            accelerator: 'Control+Q',
            click: function() {
                app.quit();
            }
        }]                  
    },{                      
        label: 'スライドショー',
        submenu: [{
            label: '開始(ディスプレイ1)',
            accelerator: 'Control+1',
            click: function() {
                const electronScreen = electron.screen;
                const displays = electronScreen.getAllDisplays();
                if (displays[0]) {
                    openSlideshowWindow(displays[0]);
                }
            }
        },{
            label: '開始(ディスプレイ2)',
            accelerator: 'Control+2',
            click: function() {
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
            click: function() {
                BrowserWindow.getFocusedWindow().reloadIgnoringCache();
            }
        },{
            label: '開発者ツールの表示/非表示',
            accelerator: 'Control+Shift+I',
            click: function() {
                BrowserWindow.getFocusedWindow().toggleDevTools();
            }
        }]
    }
]);                        

app.on("ready", function() {

    mainWindow = new BrowserWindow({});
    mainWindow.setMenu(menu);
    mainWindow.loadURL("file://" + __dirname + "/index.html");
    mainWindow.on("closed",function() {
        mainWindow.null;
    });
});
