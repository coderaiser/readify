'use strict';

const {join, extname} = require('node:path');
const {readdir} = require('node:fs/promises');

const tryToCatch = require('try-to-catch');
const superstat = require('superstat');
const currify = require('currify');

const noop = () => {};
const {assign} = Object;

const stat = currify(async (dir, name) => {
    const full = join(dir, name);
    const [, info = empty()] = await tryToCatch(superstat, full);
    
    return assign(info, {
        name,
    });
});

module.exports = async (dir) => {
    const names = await readdir(dir);
    
    const statsPromises = names.map(stat(dir));
    const stats = await Promise.all(statsPromises);
    
    return stats.map(parseStat);
};

function empty(name) {
    return {
        name,
        uid: 0,
        mode: 0,
        size: 0,
        mtime: 0,
        isDirectory: noop,
        isSymbolicLink: noop,
    };
}

function parseStat(stat) {
    const {name} = stat;
    const isDir = stat.isDirectory();
    const isLink = stat.isSymbolicLink();
    
    return {
        name,
        size: stat.size,
        date: stat.mtime,
        owner: stat.uid,
        mode: stat.mode,
        type: getType({
            name,
            isDir,
            isLink,
        }),
    };
}

function getType({name, isDir, isLink}) {
    let type;
    
    if (isDir)
        type = 'directory';
    else if (extname(name) === '.zip')
        type = 'archive';
    else
        type = 'file';
    
    const link = isLink ? '-link' : '';
    
    return `${type}${link}`;
}
