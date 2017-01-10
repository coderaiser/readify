'use strict';

const format = require('format-io');
const exec = require('execon');
const squad = require('squad');
const shortdate = require('shortdate');
const promisify = require('es6-promisify');
const currify = require('currify/legacy');
const zames = require('zames/legacy');

const WIN = process.platform === 'win32';
const BROWSER = typeof window !== 'undefined';

const sort = currify((fn, array) => array.sort(fn));
const getStat = currify(_getStat);
const parseAllStats = currify(_parseAllStats);
const replaceProperty = currify(_replaceProperty);

const getAllStats = zames(_getAllStats);

const getFS = () => {
    if (!BROWSER)
        return require('fs');
    
    const Filer = require('filer');
    return new Filer.FileSystem();
};

const fs = getFS();
const nicki = !WIN && !BROWSER && require('nicki/legacy');

const readdir = promisify(fs.readdir, fs);

// http://www.jstips.co/en/sorting-strings-with-accented-characters/
const sortFiles = sort((a, b) => {
    return a.name.localeCompare(b.name);
});

const good = (f) => (...a) => f(null, ...a);

module.exports = readify;

function readify(path, type, fn) {
    if (!fn) {
        fn = type;
        type = '';
    }
    
    check(path, fn);
    
    readdir(path)
        .then(getAllStats(path, type))
        .then(good(fn))
        .catch(fn);
}

function check(path, callback) {
    const pathMsg = 'path should be string!';
    const callbackMsg = 'callback should be function!';
    
    if (typeof path !== 'string')
        throw Error(pathMsg);
    
    if (typeof callback !== 'function')
        throw Error(callbackMsg);
}

/**
 * @param path
 * @param names
 */
function _getAllStats(path, type, names, callback) {
    const length = names.length;
    const dir = format.addSlashToEnd(path);
    
    if (!length)
        return fillJSON(dir, [], type, callback);
    
    const funcs = names.map((name) => {
        return getStat(name, dir + name);
    });
    
    exec.parallel(funcs, (...args) => {
        const files = args.slice(1);
        fillJSON(dir, files, type, callback);
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
    fs.stat(path, (error, data = emptyStat()) => {
        data.name = name;
        
        callback(null, data);
    });
}

function replaceDate(stat) {
    const date = !stat.date? '' : shortdate(stat.date, {
        order: 'little'
    });
    
    return Object.assign(stat, {
        date
    });
};

function replaceMode(stat) {
    const octal = Number(stat.mode).toString(8);
    const mode = format.permissions.symbolic(octal);
    
    return Object.assign(stat, {
        mode
    });
}

function replaceSize(stat) {
    const size = format.size(stat.size);
    
    return Object.assign(stat, {
        size
    });
}

function _parseAllStats(type, array) {
    const parse = (item) => {
        return parseStat(type, item);
    };
    
    const files = array.map(parse);
    
    if (type === 'raw')
        return files;
        
    return files
        .map(replaceDate)
        .map(replaceSize)
        .map(replaceMode);
}

function parseStat(type, stat) {
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

/**
 * Function fill JSON by file stats
 *
 * @param params - { files, stats, path }
 */
function fillJSON(path, stats, type, callback) {
    const processFiles = squad(changeOrder, sortFiles, parseAllStats(type));
    const json = {
        path: '',
        files: processFiles(stats)
    };
    
    json.path = format.addSlashToEnd(path);
    
    if (type === 'raw')
        return callback(null, json);
    
    changeUIDToName(json, (error, files) => {
        json.files = files || json.files;
        callback(null, json);
    });
}

function changeUIDToName(json, callback) {
    if (!nicki)
        return callback(null, json.files);
    
    nicki((error, names) => {
        if (error)
            return callback(error);
        
        const replaceOwner = replaceProperty(names, 'owner');
        const files = json.files.map(replaceOwner);
        
        callback(null, files);
    });
}

function isDir(file) {
    return file.size === 'dir';
}

function not(fn) {
    return (...args) => {
        return !fn(...args);
    };
}

function changeOrder(json) {
    const isFile  = not(isDir);
    const dirs    = json.filter(isDir);
    const files   = json.filter(isFile);
    const sorted  = dirs.concat(files);
    
    return sorted;
}

function _replaceProperty(obj, prop, item) {
    const n = item[prop];
    const data = obj[n];
     
    if (typeof data === 'undefined')
        return item;
    
    return Object.assign(item, {
        [prop]: data
    });
}

