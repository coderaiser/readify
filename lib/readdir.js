'use strict';

const path = require('path');
const fs = require('fs');
const {promisify} = require('util');

const currify = require('currify');
const tryToCatch = require('try-to-catch');

const noop = () => {};
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const getStat = currify(_getStat);

module.exports = async (dir) => {
    const names = await readdir(dir);
    const stats = await getAllStats(dir, names)
    const parsed = parseAllStats(stats);
    
    return parsed;
};

async function getAllStats(dir, names) {
    const {length} = names;
    
    if (!length)
        return [];
    
    const getStatsPromises = names.map(getStat(dir));
    
    return Promise.all(getStatsPromises);
}

function emptyStat() {
    return {
        mode        : 0,
        size        : 0,
        mtime       : 0,
        uid         : 0,
        isDirectory : noop,
    };
}

async function _getStat(dir, name) {
    const fullPath = path.join(dir, name);
    
    const [,
        data = emptyStat()
    ] = await tryToCatch(stat, fullPath);
    
    return Object.assign(data, {
        name
    });
}

function parseAllStats(array) {
    return array.map(parseStat);
}

function parseStat(stat) {
    const isDir = stat.isDirectory();
    const size = isDir ? 'dir' : stat.size;
    
    return {
        name: stat.name,
        size,
        date: stat.mtime,
        owner: stat.uid,
        mode: stat.mode
    };
}

