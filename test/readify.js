'use strict';

let readify = require('..');

const os = require('os');
const fs = require('fs');
const test = require('tape');
const sinon = require('sinon');
const exec = require('execon');
const shortdate = require('shortdate');

const noop = () => {};

test('path: wrong', t => {
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

test('readify: result: no owner', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        delete require.cache[require.resolve('../lib/readdir')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date('2016-11-23T14:36:46.311Z');
    const uid = 2;
    
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
    
    const expected = {
        path: './',
        files: [{
            name,
            size: '1.00kb',
            date: '23.11.2016',
            /* depends on npm@nicki     */
            /* could be different   */
            /* owner: 'bin',        */
            mode: 'rwx rwx r-x'
        }]
    };
    
    update();
    
    readify('.', (error, result) => {
        delete result.files[0].owner;
        t.deepEqual(result, expected, 'should get values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});

test('readify: result: owner', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date('2016-11-23T14:36:46.311Z');
    const uid = 2;
    
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
    
    update();
    
    readify('.', (error, result) => {
        t.ok(result.files[0].owner, 'should contain owner');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});


test('readify: type: wrong', (t) => {
    const fn = () => readify('.', {type: 1}, () => {});
    
    t.throws(fn, /type should be a string or not to be defined!/, 'should throw when type has wrong type');
    t.end();
});

test('readify: result', (t) => {
    const expected = {
        path: './',
        files: [{
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
    
    const readdir = (name, fn) => {
        fn(null, [{
            name: 'readdir.js',
            size: 1629,
            date: new Date('2017-01-12T08:31:58.308Z'),
            owner: 0,
            mode: 33204
        }, {
            name: 'readify.js',
            size: 3538,
            date: new Date('2017-01-12T09:01:35.288Z'),
            owner: 0,
            mode: 33204
        }]);
    };
     
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
    
    const readdir = (name, fn) => {
        fn(null, [{
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
        }]);
    };
     
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
    
    before();
    
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
    
    before();
    
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

test('result: read empty directory', function(t) {
    var tmp = Math.random(),
        dir = os.tmpdir() + '/readify-' + tmp;
    
    fs.mkdir(dir, function(error) {
        t.notOk(error, 'directory created');
        
        readify(dir, function(error) {
            t.notOk(error, 'successfully read');
            
            fs.rmdir(dir, function(error) {
                t.notOk(error, 'directory removed');
                t.end();
            });
        });
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
    
    require('nicki/legacy');
    require.cache[require.resolve('nicki/legacy')].exports = nicki;
    
    before();
    
    readify(__dirname, () => {
        t.notOk(nicki.called, 'nicki should not be called');
        
        Object.defineProperty(process, 'platform', {
            value: 'linux'
        });
        
        t.end();
    });
});

test('readify: options: order: wrong', (t) => {
    const fn = () => readify('.', {order: 'wrong'}, noop);
    
    t.throws(fn, /order can be "asc" or "desc" only!/, 'should throw when order is wrong');
    t.end();
});

test('readify: options: sortBy: wrong', (t) => {
    const fn = () => readify('.', {sort: 5}, noop);
    
    t.throws(fn, /sort should be a string!/, 'should throw when sortBy not string');
    t.end();
});

test('readify sort: name asc', (t) => {
    const files = [
        '1.txt',
        '2.txt',
        '3.txt'
    ];
    
    readify('./test/fixture/attr_sort', {sort: 'name'}, (error, data) => {
        t.notOk(error, 'no error');
        data.files = data.files.map((file) => {
            return file.name;
        });
        t.deepEqual(data.files, files, 'correct order');
        t.end();
    });
});

test('readify sort: name descending', (t) => {
    const files = [
        '3.txt',
        '2.txt',
        '1.txt'
    ];
    
    readify('./test/fixture/attr_sort', {sort: 'name', order: 'desc'}, (error, data) => {
        t.notOk(error, 'no error');
        data.files = data.files.map((file) => {
            return file.name;
        });
        t.deepEqual(data.files, files, 'correct order');
        t.end();
    });
});

test('readify sort: size asc', (t) => {
    const files = [
        '3.txt',
        '1.txt',
        '2.txt'
    ];
    
    readify('./test/fixture/attr_sort', {sort: 'size', order: 'asc'}, (error, data) => {
        data.files = data.files.map((file) => {
            return file.name;
        });
        
        t.deepEqual(data.files, files, 'correct order');
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
    const nicki = function(callback) {
        fn(e);
        callback(e);
    };
    
    require('nicki/legacy');
    require.cache[require.resolve('nicki/legacy')].exports = nicki;
    
    before();
    
    readify(__dirname, () => {
        t.ok(fn.calledWith(e), 'should call callback when nicki has error');
        t.end();
    });
});

function before() {
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

