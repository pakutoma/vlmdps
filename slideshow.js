const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
const Menu = remote.Menu;

window.addEventListener("DOMContentLoaded",function(e) {
    ipcRenderer.send('get-slide-data');
});
ipcRenderer.on('get-slide-data-reply',function(event,arg) {
    const sheetwrap = document.querySelector('.sheetwrap');
    while (sheetwrap.firstChild) {
        sheetwrap.removeChild(sheetwrap.firstChild);
    }
    sheetwrap.insertAdjacentHTML('beforeend',arg);
    ipcRenderer.send('get-slide-data');
});
const contextmenu = Menu.buildFromTemplate([{
    label: 'スライドショーを閉じる',
    click: ()=>ipcRenderer.send('close-slideshow')
}])
window.addEventListener('contextmenu',e=>{
        e.preventDefault();
        contextmenu.popup(remote.getCurrentWindow());
});
