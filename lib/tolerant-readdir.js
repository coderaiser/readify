'use strict';

const fs = require('fs');
const {join} = require('path');
const {promisify} = require('util');

const readdirWithTypes = require('fs-readdir-with-file-types');
const tryToCatch = require('try-to-catch');

const isString = (a) => typeof a === 'string';

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const empty = {
    isSymbolicLink() {
        return false;
    }
};

module.exports = async (dir) => {
    const [e, files] = await tryToCatch(readdirWithTypes, dir, {
        withFileTypes: true
    });
    
    if (!e)
        return files;
    
    const result = [];
    const names = await readdir(dir);
    
    for (const name of names) {
        const full = join(dir, name);
        const [, info = empty] = await tryToCatch(stat, full);
        
        result.push({
            name,
            isSymbolicLink: info.isSymbolicLink,
        });
    }
    
    return result;
}

