'use strict';

const {join} = require('path');
const {promisify} = require('util');
const fs = require('fs');

const tryToCatch = require('try-to-catch');

const noop = function() {};
const lstat = promisify(fs.lstat);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const {assign} = Object;

module.exports = async (dir) => {
    const result = [];
    const names = await readdir(dir);
    
    for (const name of names) {
        const full = join(dir, name);
        const [
            ,
            info = empty(),
        ] = await tryToCatch(lstat, full);
        
        if (info.isSymbolicLink())
            assign(info, {
                isDirectory: await getOriginalIsDirectory(full),
            });
        
        result.push(parseStat(assign(info, {
            name,
        })));
    }
    
    return result;
};

// symbolic link stat returned by "lstat.isDirectory()" is always false
// to know if a link is a directory we should call "stat.isDirectory"
// "stat.isSymbolicLink()" is always false
// https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_stats_issymboliclink
async function getOriginalIsDirectory(full) {
    const info = await stat(full);
    return info.isDirectory.bind(info);
}

function empty() {
    return {
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

