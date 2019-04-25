'use strict';

const {join} = require('path');
const {promisify} = require('util');
const fs = require('fs');

const tryToCatch = require('try-to-catch');
const superstat = require('superstat');

const noop = function() {};
const readdir = promisify(fs.readdir);

const {assign} = Object;

module.exports = async (dir) => {
    const result = [];
    const names = await readdir(dir);
    
    for (const name of names) {
        const full = join(dir, name);
        const [
            ,
            info = empty(),
        ] = await tryToCatch(superstat, full);
        
        result.push(parseStat(assign(info, {
            name,
        })));
    }
    
    return result;
};

function empty() {
    return {
        uid: 0,
        mode: 0,
        size: 0,
        mtime: 0,
        isDirectory: noop,
        isSymbolicLink: noop,
    };
}

function parseStat(stat) {
    const isDir = stat.isDirectory();
    const isLink = stat.isSymbolicLink();
    
    return {
        name: stat.name,
        size: stat.size,
        date: stat.mtime,
        owner: stat.uid,
        mode: stat.mode,
        type: getType({
            isDir,
            isLink,
        }),
    };
}

function getType({isDir, isLink}) {
    const link = isLink ? '-link' : '';
    const type = isDir ? 'directory' : 'file';
    
    return `${type}${link}`;
}

