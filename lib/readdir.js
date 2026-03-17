import {join, extname} from 'node:path';
import {readdir as _readdir} from 'node:fs/promises';
import currify from 'currify';
import {tryToCatch} from 'try-to-catch';
import _superstat from 'superstat';

const noop = () => {};
const {assign} = Object;

const stat = currify(async (superstat, dir, name) => {
    const full = join(dir, name);
    const [, info = empty()] = await tryToCatch(superstat, full);
    
    return assign(info, {
        name,
    });
});

export const readdir = async (dir, overrides = {}) => {
    const {
        readdir = _readdir,
        superstat = _superstat,
    } = overrides;
    
    const names = await readdir(dir);
    
    const statsPromises = names.map(stat(superstat, dir));
    const stats = await Promise.all(statsPromises);
    
    return stats.map(parseStat);
};

const empty = (name) => ({
    name,
    uid: 0,
    mode: 0,
    size: 0,
    mtime: 0,
    isDirectory: noop,
    isSymbolicLink: noop,
});

function parseStat(stat) {
    const {
        name,
        size,
        mtime,
        mode,
        uid,
    } = stat;
    
    const isDir = stat.isDirectory();
    const isLink = stat.isSymbolicLink();
    
    return {
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: getType({
            name,
            isDir,
            isLink,
        }),
    };
}

function getType({name, isDir, isLink}) {
    let type;
    
    if (isDir)
        type = 'directory';
    else if (extname(name) === '.zip')
        type = 'archive';
    else
        type = 'file';
    
    const link = isLink ? '-link' : '';
    
    return `${type}${link}`;
}
