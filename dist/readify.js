(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
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
        
        if (typeof window !== 'undefined') {
            fs              = new Filer.FileSystem();
        } else {
            platform        = process.platform;
            WIN             = platform === 'win32';
            fs              = require('fs');
            nicki           = !WIN && require('nicki');
        }
    } else {
        global.readify  = readify;
        fs              = new Filer.FileSystem();
        format          = window.Format;
        squad           = window.squad;
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
            isDirectory : funcEmpty
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

}).call(this,require('_process'))
},{"_process":5,"execon":3,"format-io":4,"fs":2,"nicki":undefined,"squad":6}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function(global) {
    'use strict';
    
    if (typeof module === 'object' && module.exports)
        module.exports = new ExecProto();
    else
        global.exec = new ExecProto();
        
    function ExecProto() {
        var slice = Array.prototype.slice,
            /**
             * function do save exec of function
             * @param callback
             * @param arg1
             * ...
             * @param argN
             */
            exec        = function(callback) {
                var ret,
                    isFunc  = typeof callback === 'function',
                    args    = slice.call(arguments, 1);
               
                if (isFunc)
                    ret     = callback.apply(null, args);
                
                return ret;
            };
        
        /*
         * return function that calls callback with arguments
         */
        exec.with           =  function(callback) {
            var slice   = Array.prototype.slice,
                args    = slice.call(arguments, 1);
            
            return function() {
                var array   = slice.call(arguments), 
                    all     = args.concat(array);
                
                return callback.apply(null, all);
            };
        };
         
         /**
         * return save exec function
         * @param callback
         */
        exec.ret        = function() {
            var result,
                args        = slice.call(arguments);
            
            args.unshift(exec);
            result          = exec.with.apply(null, args);
            
            return result;
        };
        
        /**
         * function do conditional save exec of function
         * @param condition
         * @param callback
         * @param func
         */
        exec.if         = function(condition, callback, func) {
            var ret;
            
            if (condition)
                exec(callback);
            else
                exec(func, callback);
            
            return ret;
        };
        
        /**
         * exec function if it exist in object
         * 
         * @param obj
         * @param name
         * @param arg
         */
        exec.ifExist                = function(obj, name, arg) {
            var ret,
                func    = obj && obj[name];
            
            if (func)
                func    = func.apply(obj, arg);
            
            return ret;
        };
        
        exec.parallel   = function(funcs, callback) {
            var ERROR       = 'could not be empty!',
                keys        = [],
                callbackWas = false,
                arr         = [],
                obj         = {},
                count       = 0,
                countFuncs  = 0,
                type        = getType(funcs);
            
            if (!funcs)
                throw Error('funcs' + ERROR);
            
            if (!callback)
                throw Error('callback' + ERROR);
            
            switch(type) {
            case 'array':
                countFuncs  = funcs.length;
                
                funcs.forEach(function(func, num) {
                    exec(func, function() {
                        checkFunc(num, arguments);
                    });
                });
                break;
            
            case 'object':
                keys        = Object.keys(funcs);
                countFuncs  = keys.length;
                
                keys.forEach(function(name) {
                    var func    = funcs[name];
                    
                    exec(func, function() {
                        checkFunc(name, arguments, obj);
                    });
                });
                break;
            }
            
            function checkFunc(num, data) {
                var args    = slice.call(data, 1),
                    isLast  = false,
                    error   = data[0],
                    length  = args.length;
                
                ++count;
                
                isLast = count === countFuncs;
                
                if (!error)
                    if (length >= 2)
                        arr[num] = args;
                    else
                        arr[num] = args[0];
                
                if (!callbackWas && (error || isLast)) {
                    callbackWas = true;
                    
                    if (type === 'array')
                        callback.apply(null, [error].concat(arr));
                    else
                        callback(error, arr);
                }
            }
        };
        
        /**
         * load functions thrue callbacks one-by-one
         * @param funcs {Array} - array of functions
         */
        exec.series             = function(funcs, callback) {
            var fn,
                i           = funcs.length,
                check       = function(error) {
                    var done;
                    
                    --i;
                    
                    if (!i || error) {
                        done = true;
                        exec(callback, error);
                    }
                    
                    return done;
                };
            
            if (!Array.isArray(funcs))
                throw Error('funcs should be array!');
            
            fn = funcs.shift();
            
            exec(fn, function(error) {
                if (!check(error))
                    exec.series(funcs, callback);
            });
        };
        
        exec.each               = function(array, iterator, callback) {
            var listeners = array.map(function(item) {
                return iterator.bind(null, item);
            });
            
            if (!listeners.length)
                callback();
            else
                exec.parallel(listeners, callback);
        };
            
        exec.eachSeries         = function(array, iterator, callback) {
            var listeners = array.map(function(item) {
                return iterator.bind(null, item);
            });
            
            if (typeof callback !== 'function')
                throw Error('callback should be function');
            
            if (!listeners.length)
                callback();
            else
                exec.series(listeners, callback);
        };
        
       /**
         * function execute param function in
         * try...catch block
         * 
         * @param callback
         */
        exec.try                = function(callback) {
            var ret;
            try {
                ret = callback();
            } catch(error) {
                ret = error;
            }
            
            return ret;
        };
        
        function getType(variable) {
            var regExp      = new RegExp('\\s([a-zA-Z]+)'),
                str         = {}.toString.call(variable),
                typeBig     = str.match(regExp)[1],
                result      = typeBig.toLowerCase();
            
            return result;
        } 
        
        return exec;
    }
})(this);

},{}],4:[function(require,module,exports){
(function(global) {
    'use strict';
    
    if (typeof module === 'object' && module.exports)
        module.exports  = new FormatProto();
    else
        global.Format   = new FormatProto();
        
    function FormatProto() {
        this.addSlashToEnd  = function(path) {
            var length, isSlash;
            
            if (path) {
                length  = path.length - 1;
                isSlash = path[length] === '/';
                
                if (!isSlash)
                    path += '/';
            }
            
            return path;
        };
        
        /** Функция получает короткие размеры
         * конвертируя байт в килобайты, мегабойты,
         * гигайбайты и терабайты
         * @pSize - размер в байтах
         */
        this.size    = function(size) {
            var isNumber    = typeof size === 'number',
                l1KB        = 1024,
                l1MB        = l1KB * l1KB,
                l1GB        = l1MB * l1KB,
                l1TB        = l1GB * l1KB,
                l1PB        = l1TB * l1KB;
            
            if (isNumber) {
                if      (size < l1KB)   size = size + 'b';
                else if (size < l1MB)   size = (size / l1KB).toFixed(2) + 'kb';
                else if (size < l1GB)   size = (size / l1MB).toFixed(2) + 'mb';
                else if (size < l1TB)   size = (size / l1GB).toFixed(2) + 'gb';
                else if (size < l1PB)   size = (size / l1TB).toFixed(2) + 'tb';
                else                    size = (size / l1PB).toFixed(2) + 'pb';
            }
            
            return size;
        };
        
        /**
         * Функция переводит права из цыфрового вида в символьный
         * @param perms - строка с правами доступа
         * к файлу в 8-миричной системе
         */
        this.permissions = {
            symbolic: function(perms) {
                var type, owner, group, all,
                    is              = typeof perms !== undefined,
                    permsStr        = '',
                    permissions     = '';
                /*
                    S_IRUSR   0000400   protection: readable by owner
                    S_IWUSR   0000200   writable by owner
                    S_IXUSR   0000100   executable by owner
                    S_IRGRP   0000040   readable by group
                    S_IWGRP   0000020   writable by group
                    S_IXGRP   0000010   executable by group
                    S_IROTH   0000004   readable by all
                    S_IWOTH   0000002   writable by all
                    S_IXOTH   0000001   executable by all
                */
                
                if (is) {
                    permsStr = perms.toString();
                    /* тип файла */
                    type = permsStr.charAt(0);
                    
                    switch (type - 0) {
                        case 1: /* обычный файл */
                            type = '-';
                            break;
                        case 2: /* байт-ориентированное (символьное) устройство*/
                            type = 'c';
                            break;
                        case 4: /* каталог */
                            type = 'd';
                            break;
                        default:
                            type = '-';
                    }
                    
                    /* оставляем последние 3 символа*/
                    if (permsStr.length > 5)
                        permsStr = permsStr.substr(3);
                    else
                        permsStr = permsStr.substr(2);
                    
                    /* Рекомендации гугла советуют вместо string[3]
                     * использовать string.charAt(3)
                     */
                    /*
                        http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml?showone=Standards_features#Standards_features
                        
                        Always preferred over non-standards featuresFor
                        maximum portability and compatibility, always
                        prefer standards features over non-standards
                        features (e.g., string.charAt(3) over string[3]
                        and element access with DOM functions instead
                        of using an application-specific shorthand).
                    */
                    /* Переводим в двоичную систему */
                    owner = (permsStr[0] - 0).toString(2),
                    group = (permsStr[1] - 0).toString(2),
                    all   = (permsStr[2] - 0).toString(2),
                    
                    /* переводим в символьную систему*/
                    permissions =
                                 (owner[0] - 0 > 0 ? 'r' : '-')     +
                                 (owner[1] - 0 > 0 ? 'w' : '-')     +
                                 (owner[2] - 0 > 0 ? 'x' : '-')     +
                                 ' '                                +
                                 (group[0] - 0 > 0 ? 'r' : '-')     +
                                 (group[1] - 0 > 0 ? 'w' : '-')     +
                                 (group[2] - 0 > 0 ? 'x' : '-')     +
                                 ' '                                +
                                 (all[0] - 0    > 0 ? 'r' : '-')     +
                                 (all[1] - 0    > 0 ? 'w' : '-')     +
                                 (all[2] - 0    > 0 ? 'x' : '-');
                }
                
                return permissions;
            },
            
            /**
             * Функция конвертирует права доступа к файлам из символьного вида
             * в цыфровой
             */
            numeric: function(perms) {
                var owner, group, all,
                    length          = perms && perms.length === 11;
                
                if (length) {
                    owner   = (perms[0]  === 'r' ? 4 : 0) +
                              (perms[1]  === 'w' ? 2 : 0) +
                              (perms[2]  === 'x' ? 1 : 0),
                                
                    group   = (perms[4]  === 'r' ? 4 : 0) +
                              (perms[5]  === 'w' ? 2 : 0) +
                              (perms[6]  === 'x' ? 1 : 0),
                            
                    all     = (perms[8]  === 'r' ? 4 : 0) +
                              (perms[9]  === 'w' ? 2 : 0) +
                              (perms[10] === 'x' ? 1 : 0);
                    
                    /* добавляем 2 цифры до 5 */
                    perms   = '00' + owner + group + all;
                }
                
                return perms;
            }
        };
    }
    
})(this);

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = squad;
    else
        global.squad    = squad;
    
    function squad() {
        var funcs = []
                .slice.call(arguments)
                .reverse();
                
        check('function', funcs);
        
        return function() {
            return funcs
                .reduce(apply, arguments)
                .pop();
        };
    }
    
    function apply(value, fn) {
        return [fn.apply(null, value)];
    }
    
    function check(type, array) {
        var wrongType   = partial(wrong, type),
            notType     = partial(notEqual, type);
        
        if (!array.length)
            wrongType(type);
        else
            array
                .map(getType)
                .filter(notType)
                .forEach(wrongType);
    }
    
    function partial(fn, value) {
        return fn.bind(null, value);
    }
    
    function getType(item) {
        return typeof item;
    }
    
    function notEqual(a, b) {
        return a !== b;
    }
    
    function wrong(type) {
        throw Error('fn should be ' + type + '!');
    }
    
})(this);

},{}]},{},[1])(1)
});