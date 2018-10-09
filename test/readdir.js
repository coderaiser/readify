'use strict';

const fs = require('fs');
const test = require('tape');
const mockRequire = require('mock-require');
const {reRequire} = mockRequire;
const tryToCatch = require('try-to-catch');

const noop = () => {};

test('readdir: empty dir', async (t) => {
    mockRequire('fs-readdir-with-file-types', async () => []);
    
    const readdir = reRequire('../lib/readdir');
    
    const [, result] = await tryToCatch(readdir, '.');
    
    mockRequire.stop('fs-readdir-with-file-types');
    t.deepEqual(result, [], 'should return empty array');
    t.end();
});

test('readdir: empty stat', async (t) => {
    const statFS = fs.stat;
    
    fs.stat = (name, cb) => {
        cb(Error('some'));
    };
    
    mockRequire('fs-readdir-with-file-types', async () => [{
        name: 'hello',
        isSymbolicLink: () => false,
    }]);
    
    const readdir = reRequire('../lib/readdir');
    
    const [, result] = await tryToCatch(readdir, '/');
    
    fs.stat = statFS;
    
    const expected = [{
        name: 'hello',
        size: 0,
        date: 0,
        owner: 0,
        mode: 0,
        type: 'file',
    }];
    
    mockRequire.stop('fs-readdir-with-file-types');
   
    t.deepEqual(result, expected, 'should return empty array');
    t.end();
});

test('readdir: result', async (t) => {
    const {
        stat,
    } = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: noop,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    mockRequire('fs-readdir-with-file-types', async () => [{
        name,
        isSymbolicLink: () => false,
    }]);
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: 'file',
    }];
    
    const readdir = reRequire('../lib/readdir');
    const [e, result] = await tryToCatch(readdir, '.');
    
    fs.stat = stat;
    mockRequire.stop('fs-readdir-with-file-types');
    
    t.notOk(e, e && e.message || 'should not receive error');
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});

test('readdir: result: directory link', async (t) => {
    const {
        stat,
    } = fs;
    
    const name = 'hello';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: () => true,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    mockRequire('fs-readdir-with-file-types', async () => [{
        name,
        isSymbolicLink: () => true,
    }]);
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: 'directory-link',
    }];
    
    const readdir = reRequire('../lib/readdir');
    const [e, result] = await tryToCatch(readdir, '.');
    
    fs.stat = stat;
    mockRequire.stop('fs-readdir-with-file-types');
    
    t.notOk(e, e && e.message || 'should not receive error');
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});
