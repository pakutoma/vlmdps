const marked = require('marked');
const fs = require('fs');
const path = require('path');

var slides = [];

function isMarkdown(element,index,array) {
    return path.extname(element) === '.md';
}

function findmd(dirpath) {
    return new Promise(function(resolve) {
        fs.readdir(dirpath,function(err,files) {
            if (err === null) {
                resolve(files
                        .filter(isMarkdown)
                        .map((value)=>{
                            return dirpath+'/'+value;
                        })
                );
            }
        });
    });
}

function loadmd(filepath,filename) {
    return new Promise(function(resolve) {
        fs.readFile(filepath,'utf8',function(err,text) {
            if (err === null) {
                resolve([marked(text),filename]);
            }
        });
    });
};
var load = function(dirpath) {
    return new Promise(function(resolve) {
        findmd(dirpath)
            .then(function(result) {
                const promises = [];
                for(const value of result) {
                    promises.push(loadmd(value, path.basename(value,'.md')));
                }
                return Promise.all(promises);
            })
            .then(function(result) {
                resolve(
                    result.sort(([,a],[,b])=>{
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    })
                );
            });
    });
};
module.exports = load;
