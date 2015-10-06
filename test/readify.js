(function() {
    'use strict';
    
    let readify = require('..'),
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
