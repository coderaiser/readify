'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const tryToCatch = require('try-to-catch');
const mockRequire = require('mock-require');
const shortdate = require('shortdate');
const {reRequire} = mockRequire;

const readify = require('..');

test('readify: path: wrong', async (t) => {
    const [error] = await tryToCatch(readify, '/wrong/path');
    
    t.ok(error, error.message);
    t.end();
});

test('readify: path: correct', async (t) => {
    const [error, json] = await tryToCatch(readify, '.');
    
    t.notOk(error, 'no error');
    t.ok(json, 'json');
    t.equal(typeof json.path, 'string');
    t.ok(Array.isArray(json.files));
    t.end();
});

test('readify: type: wrong', async (t) => {
    const [e] = await tryToCatch(readify, '.', {type: 1});
    
    t.equal(e.message, 'type should be a string or not to be defined!', 'should throw when type has wrong type');
    t.end();
});

test('readify: result: should sort by name', async (t) => {
    const expected = {
        path: './',
        files: [{
            name: '.readify.js',
            size: '3.46kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
        }, {
            name: 'readdir.js',
            size: '1.59kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
        }]
    };
    
    const date = new Date('2017-01-12T08:31:58.308Z');
    const owner = 0;
    const readdir = async () => [{
        name: 'readdir.js',
        size: 1629,
        date,
        owner,
        mode: 33204
    }, {
        name: '.readify.js',
        size: 3538,
        date,
        owner,
        mode: 33204
    }];
    
    mockRequire('../lib/readdir', readdir);
    
    const readify = reRequire('../lib/readify');
    const [, result] = await tryToCatch(readify, '.');
    
    mockRequire.stop('../lib/readdir');
    
    t.deepEqual(result, expected, 'should get values');
    t.end();
});

test('readify: result: raw', async (t) => {
    const date = new Date('2017-01-12T08:31:58.308Z');
    const owner = 0;
    
    const expected = {
        path: './',
        files: [{
            name: 'readdir.js',
            size: 1629,
            date,
            owner,
            mode: 33204
        }, {
            name: 'readify.js',
            size: 3538,
            date,
            owner,
            mode: 33204
        }]
    };
    
    const readdir = async () => [{
        name: 'readdir.js',
        size: 1629,
        date,
        owner,
        mode: 33204
    }, {
        name: 'readify.js',
        size: 3538,
        date,
        owner,
        mode: 33204
    }];
    
    mockRequire('../lib/readdir', readdir);
    const readify = reRequire('../lib/readify');
    
    const result = await readify('.', {type: 'raw'});
    
    mockRequire.stop('../lib/readdir');
    
    t.deepEqual(result, expected, 'should get values');
    t.end();
});

test('readify: result: uid: 0', async(t) => {
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const owner = 0;
    const type = 'directory';
    
    const readdir = async () => [{
        name,
        size,
        date: mtime,
        owner,
        mode,
        type,
    }];
    
    mockRequire('../lib/readdir', readdir);
    
    const date = shortdate(mtime, {
        order: 'little'
    });
    
    const expected = {
        path: './',
        files: [{
            name,
            size: '1.00kb',
            date,
            owner: 'root',
            mode: 'rwx rwx r-x',
            type,
        }]
    };
    
    const readify = reRequire('..');
    const result = await readify('.');
    
    mockRequire.stop('../lib/readdir');
    
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});

test('readify: result: nicki: no name found', async (t) => {
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const owner = Math.random();
    const type = 'file';
    
    const readdir = async () => [{
        name,
        size,
        date: mtime,
        owner,
        mode,
        type,
    }];
    
    mockRequire('../lib/readdir', readdir);
    
    const date = shortdate(mtime, {
        order: 'little'
    });
    
    const expected = {
        path: './',
        files: [{
            name,
            size: '1.00kb',
            date,
            owner,
            mode: 'rwx rwx r-x',
            type: 'file',
        }]
    };
    
    const readify = reRequire('..');
    const result = await readify('.');
    
    mockRequire.stop('../lib/readdir');
    
    t.deepEqual(result, expected, 'should get values');
    t.end();
});

test('result: files should have fields name, size, date, owner, mode, type', async (t) => {
    const json = await readify('.');
    const {files} = json;
    
    const {length} = files;
    const fields = files
        .filter((file) =>
            Object
                .keys(file)
                .join(':') === 'name:size:date:owner:mode:type'
        );
    
    t.equal(fields.length, length, 'files array do not have fields: name, size, date, owner, mode, type');
    t.end();
});

test('result: file names should not be empty', async (t) => {
    const [e, json] = await tryToCatch(readify, '.');
    const {files} = json;
    const check = () =>
        files.filter((file) =>
            !file.name
        ).forEach(file => {
            throw Error('Filename should not be empty!\n' + JSON.stringify(file));
        });
    
    t.notOk(e, 'no error');
    t.doesNotThrow(check, 'should not throw');
    t.end();
});

test('arguments: exception when no path', async (t) => {
    const [e] = await tryToCatch(readify);
    t.equal(e.message, 'path should be string!', 'should throw when no path');
    t.end();
});

test('readify: nicki on win', async (t) => {
    Object.defineProperty(process, 'platform', {
        value: 'win32'
    });
    
    const nicki = stub();
    
    mockRequire('nicki', nicki);
    
    const readify = reRequire('..');
    
    await readify(__dirname);
    
    Object.defineProperty(process, 'platform', {
        value: 'linux'
    });
    
    mockRequire.stop('nicki');
    
    t.notOk(nicki.called, 'nicki should not be called');
    t.end();
});

test('readify: result: sort: size (with dir)', async (t) => {
    const expected = {
        path: './',
        files: [{
            name: 'test',
            size: '4kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
            type: 'directory',
        }, {
            name: 'lib',
            size: '4kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
            type: 'directory',
        }, {
            name: 'readdir.js',
            size: '1.59kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
            type: 'file',
        }, {
            name: 'readify.js',
            size: '3.46kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
            type: 'file',
        }]
    };
    
    const date = new Date('2017-01-12T09:01:35.288Z');
    const readdir = async () => [{
        name: 'readify.js',
        size: 3538,
        date,
        owner: 0,
        mode: 33204,
        type: 'file',
    }, {
        name: 'test',
        size: '4kb',
        date,
        owner: 0,
        mode: 33204,
        type: 'directory',
    }, {
        name: 'readdir.js',
        size: 1629,
        date,
        owner: 0,
        mode: 33204,
        type: 'file',
    }, {
        name: 'lib',
        size: '4kb',
        date,
        owner: 0,
        mode: 33204,
        type: 'directory',
    }];
    
    mockRequire('../lib/readdir', readdir);
    const readify = reRequire('../lib/readify');
    
    const sort = 'size';
    const result = await readify('.', {sort});
    
    mockRequire.stop('../lib/readdir');
    
    t.deepEqual(result, expected, 'should get values');
    t.end();
});

test('readify: options: order: wrong', async (t) => {
    const [e] = await tryToCatch(readify, '.', {order: 'wrong'});
    
    t.equal(e.message, 'order can be "asc" or "desc" only!', 'should throw when order is wrong');
    t.end();
});

test('readify: options: sort: wrong', async (t) => {
    const [e] = await tryToCatch(readify, '.', {sort: 5});
    
    t.equal(e.message, 'sort should be a string!', 'should throw when sortBy not string');
    t.end();
});

test('readify: options: sort: name', async (t) => {
    const files = [
        '1.txt',
        '2.txt',
        '3.txt',
    ];
    
    const sort = 'name';
    const data = await readify('./test/fixture/attr_sort', {sort});
    const sorted = data.files.map((file) => {
        return file.name;
    });
    
    t.deepEqual(sorted, files, 'should sort by name');
    t.end();
});

test('readify: sort: name: desc', async (t) => {
    const files = [
        '3.txt',
        '2.txt',
        '1.txt',
    ];
    
    const sort = 'name';
    const order = 'desc';
    
    const data = await readify('./test/fixture/attr_sort', {sort, order});
    data.files = data.files
        .map((file) => file.name);
    
    t.deepEqual(data.files, files, 'should equal');
    t.end();
});

test('readify sort: size asc', async (t) => {
    const expected = [
        '3.txt',
        '1.txt',
        '2.txt'
    ];
    
    const {files} = await readify('./test/fixture/attr_sort', {sort: 'size', order: 'asc'});
    const sorted = files.map((file) => file.name);
    
    t.deepEqual(expected, sorted, 'correct order');
    t.end();
});

test('readify sort: size asc raw', async (t) => {
    const files = [
        '3.txt',
        '1.txt',
        '2.txt',
    ];
    
    const data = await readify('./test/fixture/attr_sort', {sort: 'size', type: 'raw'});
    data.files = data.files.map((file) => file.name);
    
    t.deepEqual(data.files, files, 'correct order');
    t.end();
});

test('readify: nicki: error ', async (t) => {
    const fn = stub();
    const e = Error('nicki error');
    const nicki = async () => {
        fn(e);
        throw e;
    };
    
    mockRequire('nicki', nicki);
    const readify = reRequire('..');
    
    await readify(__dirname);
    
    mockRequire.stop('nicki');
    
    t.ok(fn.calledWith(e), 'should call callback when nicki has error');
    t.end();
});

