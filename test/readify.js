'use strict';

let readify = require('..');

const fs = require('fs');

const test = require('tape');
const sinon = require('sinon');
const exec = require('execon');
const shortdate = require('shortdate');

const noop = () => {};

test('path: wrong', (t) => {
    readify('/wrong/path', (error) => {
        t.ok(error, error.message);
        t.end();
    });
});

test('path: correct', (t) => {
    readify('.', (error, json) => {
        t.notOk(error, 'no error');
        
        t.ok(json, 'json');
        t.equal(typeof json.path, 'string');
        t.ok(Array.isArray(json.files));
        
        t.end();
    });
});

test('result: should be sorted by name folders then files', (t) => {
    readify('.', (error, json) => {
        t.notOk(error, 'no error');
        
        const all = json.files;
        const isDir = file => file.size === 'dir';
        const not = (fn) => {
            return (...args) => {
                fn(...args);
            };
        };
        
        const isFile = not(isDir);
        
        const files = all.filter(isFile);
        const dirs = all.filter(isDir);
        const names = dirs
            .concat(files)
            .map((file) => file.name);
            
        const sorted = names.sort((a, b) => {
            return a > b ? 1 : -1;
        });
        
        t.deepEqual(names, sorted);
        
        t.end();
    });
});

test('readify: type: wrong', (t) => {
    const fn = () => readify('.', {type: 1}, () => {});
    
    t.throws(fn, /type should be a string or not to be defined!/, 'should throw when type has wrong type');
    t.end();
});

test('readify: result: should sort by name', (t) => {
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
     
    clean();
    
    require('../lib/readdir');
    stub('../lib/readdir', readdir);
    readify = require('../lib/readify');
    
    readify('.', (error, result) => {
        t.deepEqual(result, expected, 'should get values');
        
        clean();
        readify = require('../lib/readify');
        t.end();
    });
});

test('readify: result: raw', (t) => {
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
     
    clean();
    
    require('../lib/readdir');
    stub('../lib/readdir', readdir);
    readify = require('../lib/readify');
    
    readify('.', {type: 'raw'}, (error, result) => {
        t.deepEqual(result, expected, 'should get values');
        
        clean();
        readify = require('../lib/readify');
        t.end();
    });
});
test('readify: result: uid: 0', (t) => {
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = 0;
    
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
    
    const date = shortdate(mtime, {
        order: 'little'
    });
    
    const expected = {
        path: './',
        files: [{
            name,
            size: 'dir',
            date,
            owner: 'root',
            mode: 'rwx rwx r-x'
        }]
    };
    
    reload();
    
    readify('.', (error, result) => {
        t.deepEqual(result, expected, 'should get raw values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        t.end();
    });
});

test('readify: result: nicki: no name found', (t) => {
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = Math.random();
    
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
    
    const date = shortdate(mtime, {
        order: 'little'
    });
    
    const expected = {
        path: './',
        files: [{
            name,
            size: 'dir',
            date,
            owner: uid,
            mode: 'rwx rwx r-x'
        }]
    };
    
    reload();
    
    readify('.', (error, result) => {
        t.deepEqual(result, expected, 'should get values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        t.end();
    });
});

test('result: files should have fields name, size, date, owner, mode', (t) => {
    readify('.', (error, json) => {
        const files       = json.files,
            length      = files.length,
            check       = () =>
                files.filter((file) =>
                    Object.keys(file).join(':') === 'name:size:date:owner:mode'
                ).length;
        
        t.notOk(error, 'no error');
        
        t.equal(check(), length, 'files array do not have fields: name, size, date, owner, mode');
        
        t.end();
    });
});

test('result: file names should not be empty', t => {
    readify('.', (error, json) => {
        const files       = json.files,
            check       = () =>
                files.filter((file) =>
                    !file.name
                ).forEach(file => {
                    throw Error('Filename should not be empty!\n' + JSON.stringify(file));
                });
        
        t.notOk(error, 'no error');
        t.doesNotThrow(check, 'should not throw');
        t.end();
    });
});

test('arguments: exception when no path', t => {
    t.throws(readify, /path should be string!/, 'should throw when no path');
    t.end();
});

test('arguments: exception when no callback', t => {
    const noCallback = exec.with(readify, '.');
    
    t.throws(noCallback, /callback should be function!/, 'should throw when no callback');
    t.end();
});

test('readify: nicki on win', (t) => {
    Object.defineProperty(process, 'platform', {
        value: 'win32'
    });
    
    const nicki = sinon.spy();
    
    const original = require('nicki');
    require.cache[require.resolve('nicki')].exports = nicki;
    
    reload();
    
    readify(__dirname, () => {
        t.notOk(nicki.called, 'nicki should not be called');
        
        Object.defineProperty(process, 'platform', {
            value: 'linux'
        });
    
        require.cache[require.resolve('nicki')].exports = original;
        
        t.end();
    });
});

test('readify: result: sort: size (with dir)', (t) => {
    const expected = {
        path: './',
        files: [{
            name: 'test',
            size: 'dir',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
        }, {
            name: 'lib',
            size: 'dir',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
        }, {
            name: 'readdir.js',
            size: '1.59kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
        }, {
            name: 'readify.js',
            size: '3.46kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
        }]
    };
    
    const date = new Date('2017-01-12T09:01:35.288Z');
    const readdir = async () => [{
        name: 'readify.js',
        size: 3538,
        date,
        owner: 0,
        mode: 33204
    }, {
        name: 'test',
        size: 'dir',
        date,
        owner: 0,
        mode: 33204
    }, {
        name: 'readdir.js',
        size: 1629,
        date,
        owner: 0,
        mode: 33204
    }, {
        name: 'lib',
        size: 'dir',
        date,
        owner: 0,
        mode: 33204
    }];
     
    clean();
    
    require('../lib/readdir');
    stub('../lib/readdir', readdir);
    const readify = require('../lib/readify');
    
    const sort = 'size';
    readify('.', {sort}, (error, result) => {
        t.deepEqual(result, expected, 'should get values');
        
        clean();
        require('../lib/readify');
        t.end();
    });
});

test('readify: options: order: wrong', (t) => {
    const fn = () => readify('.', {order: 'wrong'}, noop);
    
    t.throws(fn, /order can be "asc" or "desc" only!/, 'should throw when order is wrong');
    t.end();
});

test('readify: options: sort: wrong', (t) => {
    const fn = () => readify('.', {sort: 5}, noop);
    
    t.throws(fn, /sort should be a string!/, 'should throw when sortBy not string');
    t.end();
});

test('readify: options: sort: name', (t) => {
    const files = [
        '1.txt',
        '2.txt',
        '3.txt'
    ];
    
    const sort = 'name';
    readify('./test/fixture/attr_sort', {sort}, (error, data) => {
        const sorted = data.files.map((file) => {
            return file.name;
        });
        
        t.deepEqual(sorted, files, 'should sort by name');
        t.end();
    });
});

test('readify: sort: name: desc', (t) => {
    const files = [
        '3.txt',
        '2.txt',
        '1.txt'
    ];
    
    const sort = 'name';
    const order = 'desc';
    readify('./test/fixture/attr_sort', {sort, order}, (error, data) => {
        t.notOk(error, 'no error');
        data.files = data.files.map((file) => {
            return file.name;
        });
        t.deepEqual(data.files, files, 'should equal');
        t.end();
    });
});

test('readify sort: size asc', (t) => {
    const expected = [
        '3.txt',
        '1.txt',
        '2.txt'
    ];
    
    readify('./test/fixture/attr_sort', {sort: 'size', order: 'asc'}, (error, {files})=> {
        const sorted = files.map((file) => file.name);
        
        t.deepEqual(expected, sorted, 'correct order');
        t.end();
    });
});

test('readify sort: size asc raw', (t) => {
    const files = [
        '3.txt',
        '1.txt',
        '2.txt'
    ];
    
    readify('./test/fixture/attr_sort', {sort: 'size', type: 'raw'}, (error, data) => {
        data.files = data.files.map((file) => {
            return file.name;
        });
        t.deepEqual(data.files, files, 'correct order');
        t.end();
    });
});

test('readify: nicki: error ', (t) => {
    const fn = sinon.stub();
    const e = Error('nicki error');
    const nicki = (callback) => {
        fn(e);
        callback(e);
    };
    
    require('nicki');
    require.cache[require.resolve('nicki')].exports = nicki;
    
    reload();
    
    readify(__dirname, () => {
        t.ok(fn.calledWith(e), 'should call callback when nicki has error');
        t.end();
    });
});

function reload() {
    clean();
    readify = require('..');
}

function clean() {
    delete require.cache[require.resolve('..')];
    delete require.cache[require.resolve('../lib/readdir')];
}

function stub(name, fn) {
    require.cache[require.resolve(name)].exports = fn;
}

