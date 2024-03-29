'use strict';

const process = require('node:process');

const format = require('format-io');
const currify = require('currify');
const tryToCatch = require('try-to-catch');

const sortify = require('@cloudcmd/sortify');
const formatify = require('@cloudcmd/formatify');

const readdir = require('./readdir');
const WIN = process.platform === 'win32';
const isUndefined = (a) => typeof a === 'undefined';
const nicki = !WIN && require('nicki');
const replaceProperty = currify(_replaceProperty);
const ifRaw = currify(_ifRaw);
const isString = (a) => typeof a === 'string';

module.exports = readify;

async function readify(path, options = {}) {
    const {
        type,
        order,
        sort = 'name',
    } = options;
    
    check({
        path,
        type,
        sort,
        order,
    });
    
    const names = await readdir(path);
    
    const sorted = sortify({sort, order}, names);
    const formated = ifRaw(type, formatify, sorted);
    
    return await fillJSON(path, type, formated);
}

function check({path, type, sort, order}) {
    if (!isString(path))
        throw Error('path should be string!');
    
    if (type && !isString(type))
        throw Error('type should be a string or not to be defined!');
    
    if (sort && !isString(sort))
        throw Error('sort should be a string!');
    
    if (order && !/^(asc|desc)$/.test(order))
        throw Error('order can be "asc" or "desc" only!');
}

function _ifRaw(type, fn, a) {
    if (type === 'raw')
        return a;
    
    return fn(a);
}

async function fillJSON(dir, type, files) {
    const path = format.addSlashToEnd(dir);
    
    if (type === 'raw')
        return {
            path,
            files,
        };
    
    const newFiles = await changeUIDToName(files);
    
    return {
        path,
        files: newFiles,
    };
}

async function changeUIDToName(files) {
    if (!nicki)
        return files;
    
    const [e, names] = await tryToCatch(nicki);
    
    if (e)
        return files;
    
    const replaceOwner = replaceProperty(names, 'owner');
    
    return files.map(replaceOwner);
}

function _replaceProperty(obj, prop, item) {
    const n = item[prop];
    const data = obj[n];
    
    if (isUndefined(data))
        return item;
    
    return {
        ...item,
        [prop]: data,
    };
}
