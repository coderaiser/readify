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
    
    /**
     * @param path
     * @param names
     */
    function getAllStats(path, names, callback) {
        var funcs,
            length  = names.length,
            dir     = format.addSlashToEnd(path);
        
        if (!length)
            funcs = [exec];
        else
            funcs = names.map(function(name) {
                return exec.with(getStat, name, dir + name);
            });
        
        exec.parallel(funcs, function() {
            var files = [].slice.call(arguments, 1);
            fillJSON(dir, files, callback);
        });
    }
    
    function getStat(name, path, callback) {
        fs.stat(path, function(error, data) {
            if (!data)
                data = {
                    mode        : 0,
                    size        : 0,
                    isDirectory : funcEmpty
               };
            
            data.name = name;
            
            callback(null, data);
        });
    }
    
    function parseStats(stats) {
        var files = stats.map(function(stat) {
            var file, isDir, size, mode, modeStr,
                owner   = stat.uid;
            
            /* Переводим права доступа в 8-ричную систему */
            modeStr = Number(stat.mode).toString(8);
            mode    = Number(modeStr);
            isDir   = stat.isDirectory();
            size    = isDir ? 'dir' : stat.size;
            
            file = {
                'name'  : stat.name,
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
        var files   = parseStats(stats),
            json    = {
                path    : '',
                files   : []
            };
        
        /* sorting on Win and node v0.8.0 */
        files       = files.sort(function(a, b) {
            return a.name > b.name ? 1 : -1;
        });
        
        json.files  = changeOrder(files);
        json.path   = format.addSlashToEnd(path);
        
        changeUIDToName(json, function(error, files) {
            json.files = files;
            callback(null, json);
        });
    }
    
    function changeUIDToName(json, callback) {
        if (WIN)
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
    
})(this);
