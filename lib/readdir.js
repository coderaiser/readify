'use strict';

const path = require('path');
const fs = require('fs');

const exec = require('execon');
const promisify = require('es6-promisify').promisify;
const currify = require('currify/legacy');
const zames = require('zames/legacy');

const good = (fn) => (a) => fn(null, a);

const getStat = currify(_getStat);
const getAllStats = zames(_getAllStats);

const readdir = promisify(fs.readdir, fs);

module.exports = (path, fn) => {
    readdir(path)
        .then(getAllStats(path))
        .then(parseAllStats)
        .then(good(fn))
        .catch(fn);
};

function _getAllStats(dir, names, callback) {
    const length = names.length;
    
    if (!length)
        return callback(null, []);
    
    const funcs = names.map((name) => {
        return getStat(name, path.join(dir, name));
    });
    
    exec.parallel(funcs, function() {
        callback(null, Array.from(arguments).slice(1));
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

