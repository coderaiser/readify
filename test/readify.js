(function() {
    'use strict';
    
    let readify = require('..'),
        os      = require('os'),
        fs      = require('fs'),
        test    = require('tape'),
        exec    = require('execon');
    
    test('path: wrong', t => {
        readify('/wrong/path', (error) => {
            t.ok(error, error.message);
            t.end();
        });
    });
    
    test('path: correct', t => {
        readify('.', (error, json) => {
            t.notOk(error, 'no error');
            
            t.ok(json, 'json');
            t.equal(typeof json.path, 'string');
            t.ok(Array.isArray(json.files));
            
            t.end();
        });
    });
    
    test('result: should be sorted by name folders then files', function(t) {
        readify('.', (error, json) => {
            t.notOk(error, 'no error');
            
            let all   = json.files,
                
                isDir   = file => file.size === 'dir',
                
                not     = function(fn) {
                    return function() {
                        fn.apply(null, arguments);
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
    
    test('result: files should have fields name, size, owner, mode', t => {
        readify('.', (error, json) => {
            let files       = json.files,
                length      = files.length,
                check       = () =>
                    files.filter((file) =>
                        Object.keys(file).join(':') === 'name:size:owner:mode'
                    ).length;
            
            t.notOk(error, 'no error');
            
            t.equal(check(), length, 'files array do not have fields: name, size, owner, mode');
        
        t.end();
        });
    });
    
    test('result: file names should not be empty', t => {
        readify('.', (error, json) => {
            let files       = json.files,
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
        var noCallback = exec.with(readify, '.');
        
       t.throws(noCallback, /callback should be function!/, 'should throw when no callback');
       t.end();
    });
})();
