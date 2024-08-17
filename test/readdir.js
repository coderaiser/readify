'use strict';

const fs = require('node:fs');

const {test, stub} = require('supertape');
const mockRequire = require('mock-require');

const tryToCatch = require('try-to-catch');
const {reRequire, stopAll} = mockRequire;
const noop = () => {};

test('readdir: empty dir', async (t) => {
    const {readdir} = fs.promises;
    
    fs.promises.readdir = async () => [];
    
    const _readdir = reRequire('../lib/readdir');    
    const [, result] = await tryToCatch(_readdir, '.');
    
    fs.promises.readdir = readdir;
    
    t.deepEqual(result, [], 'should return empty array');
    t.end();
});

test('readdir: empty stat', async (t) => {
    const {readdir} = fs.promises;
    
    mockRequire('superstat', async () => {
        throw Error('some');
    });
    
    fs.promises.readdir = async () => ['hello'];
    
    const _readdir = reRequire('../lib/readdir');
    
    const [, result] = await tryToCatch(_readdir, '/');
    
    fs.promises.readdir = readdir;
    
    const expected = [{
        name: 'hello',
        size: 0,
        date: 0,
        owner: 0,
        mode: 0,
        type: 'file',
    }];
    
    stopAll();
    
    t.deepEqual(result, expected, 'should return empty array');
    t.end();
});

test('readdir: result', async (t) => {
    const {readdir} = fs.promises;
    
    const name = 'hello.txt';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.promises.readdir = async () => [name];
    
    mockRequire('superstat', async () => ({
        isDirectory: noop,
        isSymbolicLink: noop,
        name,
        mode,
        size,
        mtime,
        uid,
    }));
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: 'file',
    }];
    
    const _readdir = reRequire('../lib/readdir');
    const [, result] = await tryToCatch(_readdir, '.');
    
    fs.promises.readdir = readdir;
    stopAll();
    
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});

test('readdir: result: no error', async (t) => {
    const {readdir} = fs.promises;
    
    const name = 'hello.txt';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.promises.readdir = () => [name];
    
    mockRequire('superstat', async () => ({
        isDirectory: noop,
        isSymbolicLink: noop,
        name,
        mode,
        size,
        mtime,
        uid,
    }));
    
    const _readdir = reRequire('../lib/readdir');
    const [e] = await tryToCatch(_readdir, '.');
    
    stopAll();
    fs.promises.readdir = readdir;
    
    t.notOk(e, e?.message || 'should not receive error');
    t.end();
});

test('readdir: result: directory link', async (t) => {
    const {readdir} = fs.promises;
    
    const name = 'hello';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.promises.readdir = () => [name];
    
    const info = {
        isDirectory: stub().returns(true),
        isSymbolicLink: stub().returns(true),
        name,
        mode,
        size,
        mtime,
        uid,
        ino: 1337,
        dev: 1337,
    };
    
    mockRequire('superstat', async () => info);
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: 'directory-link',
    }];
    
    const _readdir = reRequire('../lib/readdir');
    const [, result] = await tryToCatch(_readdir, '.');
    
    fs.promises.readdir = readdir;
    stopAll();
    
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});

test('readdir: result: zip link', async (t) => {
    const name = 'hello.zip';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    const readdir = () => [name];
    
    const info = {
        isDirectory: stub().returns(false),
        isSymbolicLink: stub().returns(true),
        name,
        mode,
        size,
        mtime,
        uid,
        ino: 1337,
        dev: 1337,
    };
    
    mockRequire('fs/promises', {
        readdir,
    });
    mockRequire('superstat', async () => info);
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: 'archive-link',
    }];
    
    const _readdir = reRequire('../lib/readdir');
    const [, result] = await tryToCatch(_readdir, '.');
    
    stopAll();
    
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});

test('readdir: result: directory link: no error', async (t) => {
    const {readdir} = fs.promises;
    
    const name = 'hello';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.promises.readdir = () => [name];
    
    mockRequire('superstat', async () => ({
        isDirectory: stub.returns(true),
        isSymbolicLink: stub.returns(true),
        name,
        mode,
        size,
        mtime,
        uid,
    }));
    
    const _readdir = reRequire('../lib/readdir');
    const [e] = await tryToCatch(_readdir, '.');
    
    stopAll();
    fs.promises.readdir = readdir;
    
    t.notOk(e, e?.message || 'should not receive error');
    t.end();
});
