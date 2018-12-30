'use strict';

const path = require('path');
const fs = require('fs');
const {promisify} = require('util');

const currify = require('currify');
const tryToCatch = require('try-to-catch');

const tolerantReaddir = require('./tolerant-readdir');

const noop = () => {};
const stat = promisify(fs.stat);
const getStat = currify(_getStat);

module.exports = async (dir) => {
    const files = await tolerantReaddir(dir);
    
    const filesData = files.map(isLink);
    const stats = await getAllStats(dir, filesData)
    const parsed = parseAllStats(stats);
    
    return parsed;
};

function isLink(dirent) {
    return {
        name: dirent.name,
        isLink: dirent.isSymbolicLink(),
    }
}

async function getAllStats(dir, files) {
    const {length} = files;
    
    if (!length)
        return [];
    
    const getStatsPromises = files.map(getStat(dir));
    
    return Promise.all(getStatsPromises);
}

function emptyStat(isLink) {
    return {
        isLink,
        mode        : 0,
        size        : 0,
        mtime       : 0,
        uid         : 0,
        isDirectory : noop,
    };
}

async function _getStat(dir, file) {
    const {name, isLink} = file;
    const fullPath = path.join(dir, name);
    
    const [,
        data = emptyStat(isLink)
    ] = await tryToCatch(stat, fullPath);
    
    return Object.assign(data, {
        name,
        isLink,
    });
}

function parseAllStats(array) {
    return array.map(parseStat);
}

function parseStat(stat) {
    const isDir = stat.isDirectory();
    const size = stat.size;
    const isLink = stat.isLink;
    
    return {
        name: stat.name,
        size,
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

