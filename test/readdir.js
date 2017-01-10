'use strict';

const fs = require('fs');
const test = require('tape');

let readdir = require('../lib/readdir');

test('readdir: empty dir', (t) => {
    const {readdir:readdirFS} = fs;
    
    fs.readdir = (dir, cb) => {
        cb(null, []);
    };
    
    before();
    
    readdir('.', (e, result) => {
        t.deepEqual(result, [], 'should return empty array');
        fs.readdir = readdirFS;
        t.end();
    });
});

function before() {
    delete require.cache[require.resolve('../lib/readdir')];
    readdir = require('../lib/readdir');
}

