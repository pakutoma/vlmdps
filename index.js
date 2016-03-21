"use strict";

const ipcRenderer = require('electron').ipcRenderer;
const remote = require('remote');
const chokidar = remote.require('chokidar');
const loadmd = remote.require('./lib/loadmd');

window.addEventListener('DOMContentLoaded',e => ipcRenderer.send('get-slides-dir'));
window.addEventListener('keydown',moveselectd);

ipcRenderer.on('get-slides-dir-reply',(event,path) => {
    ipcRenderer.send('get-slides-dir');
    console.log(path);
    loadmd(path).then(result => initSlideWindow(result));
});

function initSlideWindow(slides) {
    const slider = document.querySelector('.slider');
    while (slider.firstChild) {
        slider.removeChild(slider.firstChild);
    }
    const topelement = document.createElement('div');
    topelement.classList.add('top');
    slider.appendChild(topelement);
    for(const [html,name] of slides) {
        const sheet = document.createElement('div');
        sheet.classList.add('sheet');
        sheet.insertAdjacentHTML('beforeend',html);
        const sheetwrap = document.createElement('div');
        sheetwrap.addEventListener('click',() => copyToView(name));
        sheetwrap.classList.add('sheetwrap');
        sheetwrap.classList.add('sliderchild');
        sheetwrap.classList.add('sheet_' + name);
        sheetwrap.appendChild(sheet);
        slider.appendChild(sheetwrap);
    }
    if (slides.length > 0) {
        const view = document.querySelector('.view');
        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }
        const sheet = document.createElement('div');
        sheet.classList.add('sheet');
        const sheetwrap = document.createElement('div');
        sheetwrap.classList.add('sheetwrap');
        sheetwrap.classList.add('viewchild');
        sheetwrap.appendChild(sheet);
        view.appendChild(sheetwrap);
        copyToView(slides[0][1]);
    }
}

function copyToView(filename) {
    const selected = document.querySelector('.selected');
    if (selected !== null) {
        selected.classList.remove('selected');
    }
    const viewsheet = document.querySelector('.viewchild .sheet');
    while (viewsheet.firstChild) {
        viewsheet.removeChild(viewsheet.firstChild);
    }
    const copyby = document.querySelector('.sheet_'+filename);
    viewsheet.insertAdjacentHTML('beforeend',copyby.innerHTML);
    ipcRenderer.send('post-slide-data',copyby.innerHTML);
    copyby.classList.add('selected');
}

function moveselectd(e) {
    const key = e.keyCode;
    const selected = document.querySelector('.selected');
    const slider = document.querySelectorAll('.sliderchild');
    if (selected === null || slider.length < 2) {
        return;
    }

    if (key === 34/*PgDn*/ || key === 39/*right allow*/) {
        let next = selected;
        while (next.nodeType !== 1 || !next.classList.contains('sheetwrap') || next.classList.contains('selected')) {
            next = (next.nextSibling === null) ? selected.parentNode.firstChild : next.nextSibling;
        }
        copyToView(next.className.match(/sheet_(\S+)/)[1]);
    }

    if (key === 33/*PgUp*/ || key === 37/*left allow*/) {
        let prev = selected;
        while (prev.nodeType !== 1 || !prev.classList.contains('sheetwrap') || prev.classList.contains('selected')) {
            prev = (prev.previousSibling === null) ? selected.parentNode.lastChild : prev.previousSibling;
        }
        copyToView(prev.className.match(/sheet_(\S+)/)[1]);
    }
}
