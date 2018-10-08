'use strict';

const format = require('format-io');
const currify = require('currify');
const {promisify} = require('util');

const sortify = currify(require('@cloudcmd/sortify'));
const formatify = require('@cloudcmd/formatify');

const WIN = process.platform === 'win32';

const ifRaw = currify(_ifRaw);
const replaceProperty = currify(_replaceProperty);
const fillJSON = promisify(_fillJSON);

const nicki = !WIN && require('nicki');

const readdir = require('./readdir');

module.exports = readify;

async function readify(path, options = {}) {
    const type = options.type;
    const order = options.order;
    const sort = options.sort || 'name';
    
    check(path, type);
    checkSort(sort, order);
    
    const names = await readdir(path);
    const sorted = sortify({sort,order}, names);
    const formated = ifRaw(type, formatify, sorted);
    
    return await fillJSON(path, type, formated);
}

function check(path, type) {
    const isString = (a) => typeof a === 'string';
    
    const pathMsg = 'path should be string!';
    const typeMsg = 'type should be a string or not to be defined!';
    
    if (!isString(path))
        throw Error(pathMsg);
    
    if (type && !isString(type))
        throw Error(typeMsg);
}

function checkSort(sort, order) {
    if (sort && typeof sort !== 'string')
        throw Error('sort should be a string!');
    
    if (order && !/^(asc|desc)$/.test(order))
        throw Error('order can be "asc" or "desc" only!');
}

function _ifRaw(type, fn, a) {
    if (type === 'raw')
        return a;
    
    return fn(a);
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
    
    return {
        ...item,
        [prop]: data
    };
}

