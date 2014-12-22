(function() {
    'use strict';
    
    var fs                  = require('fs'),
        
        check               = require('checkup'),
        exec                = require('execon'),
        format              = require('format-io'),
        nicki               = require('nicki'),
        
        funcEmpty           = function() {},
        
        WIN                 = process.platform === 'win32';
    
    module.exports = function(path, callback) {
        check(arguments, ['path', 'callback'])
            .type('path', path, 'string')
            .type('callback', callback, 'function');
        
        fs.readdir(path, function(error, names) {
            if (error)
                callback(error);
            else
                getAllStats(path, names, callback);
        });
    };
    
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
                
                funcs[name] = exec.with(getStat, name, path);
            });
        
        exec.parallel(funcs, function(error, files) {
            fillJSON(dir, files || {}, callback);
        });
    }
    
    function getStat(name, path, callback) {
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
        
        check(arguments, ['stats']);
        
        files = Object.keys(stats).map(function(name) {
            var file, isDir, size, mode, modeStr,
                stat    = stats[name],
                owner   = stat.uid;
            
            if (stat) {
                /* Переводим права доступа в 8-ричную систему */
                modeStr = Number(stat.mode).toString(8);
                mode    = Number(modeStr);
                isDir   = stat.isDirectory();
                size    = isDir ? 'dir' : stat.size;
            }
            
            file = {
                'name'  : name,
                'size'  : format.size(size),
                'owner' : owner,
                'mode'  : format.permissions.symbolic(mode)
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
        
        check(arguments, ['params']);
        
        files       = parseStats(stats);
        
        /* sorting on Win and node v0.8.0 */
        files   = sort(files);
        
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
    
    function sort(files) {
        var sorted  = files;
        
        sorted = files.sort(function(fileA, fileB) {
            var ret     = 0,
                more    = fileA.name > fileB.name,
                less    = fileA.name < fileB.name;
            
            if (more)
                ret = 1;
            else if (less)
                ret = -1;
            
            return ret;
        });
        
        return sorted;
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
    
})();
