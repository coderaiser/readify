'use strict';

const {join} = require('path');
const {readdir} = require('fs').promises;

const tryToCatch = require('try-to-catch');
const superstat = require('superstat');
const currify = require('currify');

const noop = function() {};
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

