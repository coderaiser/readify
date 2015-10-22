/* global Filer */

(function(global) {
    'use strict';
    
    var fs,
        squad,
        format,
        exec,
        nicki,
        WIN,
        platform,
        funcEmpty       = function() {},
        
        map             = function(fn, array) {
            return array.map(fn);
        },
        
        sort            = function(fn, array) {
            return array.sort(fn);
        };
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports  = readify;
        format          = require('format-io');
        exec            = require('execon');
        squad           = require('squad');
        platform        = process.platform;
        WIN             = platform === 'win32';
        
        if (typeof window !== 'undefined') {
            fs              = new Filer.FileSystem();
            window.readify  = readify;
        } else {
            fs              = require('fs');
            nicki           = !WIN && require('nicki');
        }
    } else {
        global.readify  = readify;
        fs              = new Filer.FileSystem();
        format          = window.Format;
        exec            = window.exec;
    }
    
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
    
    function parseStat(stat) {
        var file, isDir, size, mode, modeStr,
            owner = stat.uid || '';
        
        /* Переводим права доступа в 8-ричную систему */
        modeStr = Number(stat.mode).toString(8);
        mode    = Number(modeStr) || '';
        isDir   = stat.isDirectory();
        size    = isDir ? 'dir' : stat.size;
        
        file = {
            'name'  : stat.name,
            'size'  : format.size(size),
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
    
})(this);
