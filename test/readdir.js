'use strict';

const fs = require('fs');
const test = require('tape');
const noop = () => {};

let readdir = require('../lib/readdir');

test('readdir: empty dir', (t) => {
    const {readdir:readdirFS} = fs;
    
    fs.readdir = (dir, cb) => {
        cb(null, []);
    };
    
    update();
    
    readdir('.', (e, result) => {
        t.deepEqual(result, [], 'should return empty array');
        fs.readdir = readdirFS;
        t.end();
    });
});

test('readdir: result', (t) => {
    const {readdir:readdirFS, stat} = fs;
    
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
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode
    }];
    
    update();
    
    readdir('.', (error, result) => {
        t.deepEqual(expected, result, 'should get raw values');
        
        fs.readdir = readdirFS;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});

function update() {
    delete require.cache[require.resolve('../lib/readdir')];
    readdir = require('../lib/readdir');
}

