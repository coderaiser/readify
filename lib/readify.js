/* global Filer */
/* global Format */

(function(global) {
    'use strict';
    
    var fs,
        format,
        exec,
        nicki,
        WIN,
        
        funcEmpty       = function() {};
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports  = readify;
        fs              = require('fs');
        format          = require('format-io');
        exec            = require('execon');
        nicki           = require('nicki');
        WIN             = process.platform === 'win32';
    } else {
        global.readify  = readify;
        fs              = new Filer.FileSystem(),
        format          = Format;
        exec            = window.exec;
        WIN             = true;
    }
    
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
    
    function checkEmpty(param) {
        if (!param)
            throw Error('param could not be empty!');
    }
    
    /**
     * @param path
     * @param names
     */
    function getAllStats(path, names, callback) {
        var length  = names.length,
            funcs   = names.length ? {} : [],
            dir     = format.addSlashToEnd(path);
        
        if (!length)
            funcs.push(exec);
        else
            names.forEach(function(name) {
                var path    = dir + name;
                
                funcs[name] = exec.with(getStat, path);
            });
        
        exec.parallel(funcs, function(error, files) {
            fillJSON(dir, files || {}, callback);
        });
    }
    
    function getStat(path, callback) {
        fs.stat(path, function(error, data) {
            callback(null, data || {
                'mode'          : 0,
                'size'          : 0,
                'isDirectory'   : funcEmpty
            });
        });
    }
    
    function parseStats(stats) {
        var files;
        
        checkEmpty(stats);
        
        files = Object.keys(stats).map(function(name) {
            var file, isDir, size, mode, modeStr,
                stat    = stats[name],
                owner   = stat.uid;
            
            if (stat) {
                /* Переводим права доступа в 8-ричную систему */
                modeStr = Number(stat.mode || '').toString(8);
                mode    = Number(modeStr);
                isDir   = stat.isDirectory();
                size    = isDir ? 'dir' : stat.size;
            }
            
            file = {
                'name'  : name,
                'size'  : format.size(size),
                'owner' : owner || '',
                'mode'  : mode && format.permissions.symbolic(mode) || ''
            };
            
            return file;
        });
        
        return files;
    }
    
    /**
     * Function fill JSON by file stats
     *
     * @param params - { files, stats, path }
     */
    function fillJSON(path, stats, callback) {
        var files,
            
            json    = {
                path    : '',
                files   : []
            };
        
        check(path, callback);
        checkEmpty(stats);
        
        files       = parseStats(stats);
        
        /* sorting on Win and node v0.8.0 */
        files       = files.sort(function(a, b) {
            return a.name > b.name;
        });
        
        json.files  = changeOrder(files);
        json.path   = format.addSlashToEnd(path);
        
        changeUIDToName(json, function() {
            callback(null, json);
        });
    }
    
    function changeUIDToName(json, callback) {
        if (WIN)
            callback();
        else
            nicki(function(error, names) {
                var files = json.files;
                
                if (error)
                    callback(error);
                else
                    files.forEach(function(file) {
                        var owner   = file.owner;
                            owner   = names[owner];
                        
                        if (owner)
                            file.owner   = owner;
                    });
                
                callback();
            });
    }
    
    function changeOrder(json) {
        var files   = [],
            dirs    = [],
            sorted  = [];
        
        json.forEach(function(current) {
            if (current.size === 'dir')
                dirs.push(current);
            else 
                files.push(current);
        });
        
        sorted = dirs.concat(files);
        
        return sorted;
    }
    
})(this);
