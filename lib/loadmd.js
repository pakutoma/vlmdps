const marked = require('marked');
const fs = require('fs');
const path = require('path');

var slides = [];

function isMarkdown(element,index,array) {
    return path.extname(element) === '.md';
}

function findmd(dirpath) {
    return new Promise(resolve => {
        fs.readdir(dirpath,(err,files) => {
            if (err === null) {
                resolve(files
                    .filter(isMarkdown)
                    .map(value => dirpath + '/' + value)
                    );
            }
        });
    });
}
    
function loadmd(filepath,filename) {
    return new Promise(resolve => {
        fs.readFile(filepath,'utf8',(err,text) => {
            if (err === null) {
                resolve([marked(text),filename]);
            }
        });
    });
};

var load = dirpath => {
    return new Promise(resolve => {
        findmd(dirpath)
            .then(result => {
                const promises = [];
                for(const value of result) {
                promises.push(loadmd(value, path.basename(value,'.md')));
            }
            return Promise.all(promises);
        })
        .then(result => {
            resolve(
                result.sort(([,a],[,b]) => {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                })
            );
        });
    });
};
module.exports = load;
