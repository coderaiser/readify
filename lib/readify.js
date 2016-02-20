'use strict';

/* global Filer */

var fs,
    format          = require('format-io'),
    exec            = require('execon'),
    squad           = require('squad'),
    shortdate       = require('shortdate'),
    nicki,
    WIN,
    
    map             = function(fn, array) {
        return array.map(fn);
    },
    
    sort            = function(fn, array) {
        return array.sort(fn);
    };

if (typeof window !== 'undefined') {
    fs              = new Filer.FileSystem();
} else {
    fs              = require('fs');
    WIN             = process.platform === 'win32';
    nicki           = !WIN && require('nicki');
}

module.exports  = readify;

var parseStats  = exec.with(map, parseStat);

/* sorting on Win and node v0.8.0 */
var sortFiles   = exec.with(sort, function(a, b) {
    return a.name > b.name ? 1 : -1;
});

function readify(path, callback) {
    check(path, callback);
    
    fs.readdir(path, function(error, names) {
        if (error)
            callback(error);
        else
            getAllStats(path, names, callback);
    });
}

function check(path, callback) {
    var pathMsg     = 'path should be string!',
        callbackMsg = 'callback should be function!';
    
    if (typeof path !== 'string')
        throw Error(pathMsg);
    
    if (typeof callback !== 'function')
        throw Error(callbackMsg);
}

/**
 * @param path
 * @param names
 */
function getAllStats(path, names, callback) {
    var funcs,
        length  = names.length,
        dir     = format.addSlashToEnd(path);
    
    if (!length)
        return fillJSON(dir, [], callback);
    
    funcs = names.map(function(name) {
        return exec.with(getStat, name, dir + name);
    });
    
    exec.parallel(funcs, function() {
        var files = [].slice.call(arguments, 1);
        fillJSON(dir, files, callback);
    });
}

function emptyStat() {
    return {
        mode        : 0,
        size        : 0,
        mtime       : 0,
        isDirectory : function() {}
   };
}

function getStat(name, path, callback) {
    fs.stat(path, function(error, data) {
        if (!data)
            data = emptyStat();
        
        data.name = name;
        
        callback(null, data);
    });
}

function parseStat(stat) {
    var file, isDir, size, mode, modeStr, mtime,
        owner = stat.uid || '';
    
    /* Переводим права доступа в 8-ричную систему */
    modeStr = Number(stat.mode).toString(8);
    mode    = Number(modeStr) || '';
    isDir   = stat.isDirectory();
    size    = isDir ? 'dir' : stat.size;
    mtime   = !stat.mtime ? '' : shortdate(stat.mtime, {
        order: 'little'
    });
    
    file = {
        'name'  : stat.name,
        'size'  : format.size(size),
        'date'  : mtime,
        'owner' : owner,
        'mode'  : mode && format.permissions.symbolic(mode)
    };
    
    return file;
}

/**
 * Function fill JSON by file stats
 *
 * @param params - { files, stats, path }
 */
function fillJSON(path, stats, callback) {
    var processFiles    = squad(changeOrder, sortFiles, parseStats),
        json            = {
            path    : '',
            files   : processFiles(stats)
        };
    
    json.path   = format.addSlashToEnd(path);
    
    changeUIDToName(json, function(error, files) {
        json.files = files;
        callback(null, json);
    });
}

function changeUIDToName(json, callback) {
    if (!nicki)
        callback(null, json.files);
    else
        nicki(function(error, names) {
            var files = json.files.slice();
            
            if (!error)
                files = files.map(function(file) {
                    var owner   = file.owner;
                        owner   = names[owner];
                    
                    if (owner)
                        file.owner   = owner;
                    
                    return file;
                });
            
            callback(error, files);
        });
}

function isDir(file) {
    return file.size === 'dir';
}

function not(fn) {
    return function() {
        return !fn.apply(null, arguments);
    };
}

function changeOrder(json) {
    var isFile  = not(isDir),
        
        dirs    = json.filter(isDir),
        files   = json.filter(isFile),
        sorted  = dirs.concat(files);
    
    return sorted;
}

