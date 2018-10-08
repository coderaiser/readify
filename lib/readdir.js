'use strict';

const path = require('path');
const fs = require('fs');
const {promisify} = require('util');

const exec = require('execon');
const currify = require('currify');

const getStat = currify(_getStat);
const getAllStats = promisify(_getAllStats);
const readdir = promisify(fs.readdir);

module.exports = async (dir) => {
    const names = await readdir(dir);
    const stats = await getAllStats(dir, names)
    const parsed = parseAllStats(stats);
    
    return parsed;
};

function _getAllStats(dir, names, callback) {
    const length = names.length;
    
    if (!length)
        return callback(null, []);
    
    const funcs = names.map((name) => {
        return getStat(name, path.join(dir, name));
    });
    
    exec.parallel(funcs, (a, ...args) => {
        callback(null, args);
    });
}

function emptyStat() {
    return {
        mode        : 0,
        size        : 0,
        mtime       : 0,
        uid         : 0,
        isDirectory : () => {}
    };
}

function _getStat(name, path, callback) {
    fs.stat(path, (error, data) => {
        data = data || emptyStat();
        data.name = name;
        
        callback(null, data);
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

