'use strict';

const format = require('format-io');
const shortdate = require('shortdate');
const promisify = require('es6-promisify');
const currify = require('currify/legacy');
const zames = require('zames/legacy');

const sortify = currify(require('@cloudcmd/sortify/legacy'));

const WIN = process.platform === 'win32';

const parseAllStats = currify(_parseAllStats);
const replaceProperty = currify(_replaceProperty);
const fillJSON = zames(_fillJSON);

const nicki = !WIN && require('nicki');

const readdir = promisify(require('./readdir'));
const good = (fn) => (a) => fn(null, a);

module.exports = readify;

function readify(path, options, fn) {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    const type = options.type;
    const order = options.order;
    const sort = options.sort || 'name';
    
    check(path, type, fn);
    checkSort(sort, order);
    
    readdir(path)
        .then(sortify({sort, order}))
        .then(parseAllStats(type))
        .then(fillJSON(path, type))
        .then(good(fn))
        .catch(fn);
}

function check(path, type, callback) {
    const isString = (a) => typeof a === 'string';
    
    const pathMsg = 'path should be string!';
    const typeMsg = 'type should be a string or not to be defined!';
    const callbackMsg = 'callback should be function!';
    
    if (!isString(path))
        throw Error(pathMsg);
    
    if (type && !isString(type))
        throw Error(typeMsg);
    
    if (typeof callback !== 'function')
        throw Error(callbackMsg);
}

function checkSort(sort, order) {
    if (sort && typeof sort !== 'string')
        throw Error('sort should be a string!');
    
    if (order && !/^(asc|desc)$/.test(order))
        throw Error('order can be "asc" or "desc" only!');
}

function replaceDate(stat) {
    const date = !stat.date? '' : shortdate(stat.date, {
        order: 'little'
    });
    
    return Object.assign(stat, {
        date
    });
}

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

function _parseAllStats(type, files) {
    if (type === 'raw')
        return files;
    
    return files
        .map(replaceDate)
        .map(replaceSize)
        .map(replaceMode);
}

function _fillJSON(dir, type, files, callback) {
    const path = format.addSlashToEnd(dir);
    
    if (type === 'raw')
        return callback(null, {path, files});
    
    changeUIDToName(files, (error, newFiles) => {
        const json = {
            path,
            files: newFiles || files
        };
        
        callback(null, json);
    });
}

function changeUIDToName(files, callback) {
    if (!nicki)
        return callback(null, files);
    
    nicki((error, names) => {
        if (error)
            return callback(error);
        
        const replaceOwner = replaceProperty(names, 'owner');
        
        callback(null, files.map(replaceOwner));
    });
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

