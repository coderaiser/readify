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
        
        const all   = json.files,
            isDir   = file => file.size === 'dir',
            not     = (fn) => {
                return (...args) => {
                    fn(...args);
                };
            },
            
            isFile  = not(isDir),
            
            files   = all.filter(isFile),
            dirs    = all.filter(isDir),
            
            names   = dirs
                .concat(files)
                .map(file =>
                    file.name
                ),
                
            sorted = names.sort((a, b) =>
                a > b ? 1 : -1
            );
        
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

test('readify: result: "raw"', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        delete require.cache[require.resolve('../lib/readdir')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
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
    
    const expected = {
        path: './',
        files: [{
            name,
            size,
            date: mtime,
            owner: uid,
            mode
        }]
    };
    
    update();
    
    readify('.', {type: 'raw'}, (error, result) => {
        t.deepEqual(expected, result, 'should get raw values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});

test('readify: result: "raw": dir', (t) => {
    const {readdir, stat} = fs;
    
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
            isDirectory: () => true,
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
            size: 'dir',
            date: mtime,
            owner: uid,
            mode
        }]
    };
    
    before();
    
    const type = 'raw';
    readify('.', {type}, (error, result) => {
        t.deepEqual(expected, result, 'should get raw values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        t.end();
    });
});

test('readify: type: wrong', (t) => {
    const fn = () => readify('.', {type: 1}, () => {});
    
    t.throws(fn, /type should be a string or not to be defined!/, 'should throw when type has wrong type');
    t.end();
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
        t.deepEqual(result, expected, 'should get raw values');
        
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
    delete require.cache[require.resolve('..')];
    delete require.cache[require.resolve('../lib/readdir')];
    readify = require('..');
}

