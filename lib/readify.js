'use strict';

const format = require('format-io');
const exec = require('execon');
const squad = require('squad');
const shortdate = require('shortdate');
const promisify = require('es6-promisify');
const currify = require('currify');
const zames = require('zames/legacy');

const WIN = process.platform === 'win32';
const BROWSER = typeof window !== 'undefined';

const sort = currify((fn, array) => array.sort(fn));
const getStat = currify(_getStat);
const parseAllStats = currify(_parseAllStats);

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

/* sorting on Win and node v0.8.0 */
const sortFiles = sort((a, b) => {
    return a.name > b.name ? 1 : -1;
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
        isDirectory : () => {}
    };
}

function _getStat(name, path, callback) {
    fs.stat(path, (error, data = emptyStat()) => {
        data.name = name;
        
        callback(null, data);
    });
}

function _parseAllStats(type, array) {
    return array.map((item) => {
        return parseStat(type, item);
    });
}

function parseStat(type, stat) {
    const isDir = stat.isDirectory();
    const size = isDir ? 'dir' : stat.size;
    
    if (type === 'raw')
        return {
            name: stat.name,
            size: size,
            date: stat.mtime,
            owner: stat.uid,
            mode: stat.mode
        };
     
    /* Переводим права доступа в 8-ричную систему */
    const modeStr = Number(stat.mode).toString(8);
    const owner = stat.uid || '';
    const mode = Number(modeStr) || '';
    const mtime = !stat.mtime ? '' : shortdate(stat.mtime, {
        order: 'little'
    });
    
    return {
        name: stat.name,
        size: format.size(size),
        date: mtime,
        owner: owner,
        mode: mode && format.permissions.symbolic(mode)
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
        json.files = files;
        callback(null, json);
    });
}

function changeUIDToName(json, callback) {
    if (!nicki)
        callback(null, json.files);
    else
        nicki((error, names) => {
            let files;
            
            if (error)
                files = json.files.slice();
            else
                files = json.files.map((file) => {
                    const owner = file.owner;
                    
                    if (names[owner])
                        file.owner   = names[owner];
                    
                    return file;
                });
            
            callback(error, files);
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

