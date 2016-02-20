/*! filer 0.0.43 2015-07-21 */
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.Filer=a()}}(function(){var a;return function b(a,c,d){function e(g,h){if(!c[g]){if(!a[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};a[g][0].call(k.exports,function(b){var c=a[g][1][b];return e(c?c:b)},k,k.exports,b,a,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(b,c,d){!function(){var b={};"undefined"!=typeof process&&process.nextTick?(b.nextTick=process.nextTick,"undefined"!=typeof setImmediate?b.setImmediate=function(a){setImmediate(a)}:b.setImmediate=b.nextTick):"function"==typeof setImmediate?(b.nextTick=function(a){setImmediate(a)},b.setImmediate=b.nextTick):(b.nextTick=function(a){setTimeout(a,0)},b.setImmediate=b.nextTick),b.eachSeries=function(a,b,c){if(c=c||function(){},!a.length)return c();var d=0,e=function(){b(a[d],function(b){b?(c(b),c=function(){}):(d+=1,d>=a.length?c():e())})};e()},b.forEachSeries=b.eachSeries,"undefined"!=typeof a&&a.amd?a([],function(){return b}):"undefined"!=typeof c&&c.exports?c.exports=b:root.async=b}()},{}],2:[function(a,b,c){function d(a,b){for(var c=b.length-1;c>=0;c--)b[c]===a&&b.splice(c,1);return b}var e=function(){};e.createInterface=function(a){var b={};return b.on=function(b,c){"undefined"==typeof this[a]&&(this[a]={}),this[a].hasOwnProperty(b)||(this[a][b]=[]),this[a][b].push(c)},b.off=function(b,c){"undefined"!=typeof this[a]&&this[a].hasOwnProperty(b)&&d(c,this[a][b])},b.trigger=function(b){if("undefined"!=typeof this[a]&&this[a].hasOwnProperty(b))for(var c=Array.prototype.slice.call(arguments,1),d=0;d<this[a][b].length;d++)this[a][b][d].apply(this[a][b][d],c)},b.removeAllListeners=function(b){if("undefined"!=typeof this[a]){var c=this;c[a][b].forEach(function(a){c.off(b,a)})}},b};var f=e.createInterface("_handlers");e.prototype._on=f.on,e.prototype._off=f.off,e.prototype._trigger=f.trigger;var g=e.createInterface("handlers");e.prototype.on=function(){g.on.apply(this,arguments),Array.prototype.unshift.call(arguments,"on"),this._trigger.apply(this,arguments)},e.prototype.off=g.off,e.prototype.trigger=g.trigger,e.prototype.removeAllListeners=g.removeAllListeners,b.exports=e},{}],3:[function(a,b,c){(function(c){function d(a,b){var c=0;return function(){var d=Date.now();d-c>a&&(c=d,b.apply(this,arguments))}}function e(a,b){if("undefined"!=typeof a&&a||(a={}),"object"==typeof b)for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a}function f(){var a=this,b=Date.now();this.origin=h(),this.lastMessage=b,this.receivedIDs={},this.previousValues={};var d=function(){a._onStorageEvent.apply(a,arguments)};"undefined"!=typeof document&&(document.attachEvent?document.attachEvent("onstorage",d):c.addEventListener("storage",d,!1))}var g=a("./eventemitter.js"),h=a("../src/shared.js").guid,i=function(a){return"undefined"==typeof a||"undefined"==typeof a.localStorage?{getItem:function(){},setItem:function(){},removeItem:function(){}}:a.localStorage}(c);f.prototype._transaction=function(a){function b(){if(!g){var k=Date.now(),m=0|i.getItem(l);if(m&&d>k-m)return h||(f._on("storage",b),h=!0),void(j=setTimeout(b,e));g=!0,i.setItem(l,k),a(),c()}}function c(){h&&f._off("storage",b),j&&clearTimeout(j),i.removeItem(l)}var d=1e3,e=20,f=this,g=!1,h=!1,j=null;b()},f.prototype._cleanup_emit=d(100,function(){var a=this;a._transaction(function(){var a,b=Date.now(),c=b-m,d=0;try{a=JSON.parse(i.getItem(j)||"[]")}catch(e){a=[]}for(var f=a.length-1;f>=0;f--)a[f].timestamp<c&&(a.splice(f,1),d++);d>0&&i.setItem(j,JSON.stringify(a))})}),f.prototype._cleanup_once=d(100,function(){var a=this;a._transaction(function(){var b,c,d=(Date.now(),0);try{c=JSON.parse(i.getItem(k)||"{}")}catch(e){c={}}for(b in c)a._once_expired(b,c)&&(delete c[b],d++);d>0&&i.setItem(k,JSON.stringify(c))})}),f.prototype._once_expired=function(a,b){if(!b)return!0;if(!b.hasOwnProperty(a))return!0;if("object"!=typeof b[a])return!0;var c=b[a].ttl||n,d=Date.now(),e=b[a].timestamp;return d-c>e},f.prototype._localStorageChanged=function(a,b){if(a&&a.key)return a.key===b;var c=i.getItem(b);return c===this.previousValues[b]?!1:(this.previousValues[b]=c,!0)},f.prototype._onStorageEvent=function(a){a=a||c.event;var b=this;this._localStorageChanged(a,j)&&this._transaction(function(){var a,c=Date.now(),d=i.getItem(j);try{a=JSON.parse(d||"[]")}catch(e){a=[]}for(var f=0;f<a.length;f++)if(a[f].origin!==b.origin&&!(a[f].timestamp<b.lastMessage)){if(a[f].id){if(b.receivedIDs.hasOwnProperty(a[f].id))continue;b.receivedIDs[a[f].id]=!0}b.trigger(a[f].name,a[f].payload)}b.lastMessage=c}),this._trigger("storage",a)},f.prototype._emit=function(a,b,c){if(c="string"==typeof c||"number"==typeof c?String(c):null,c&&c.length){if(this.receivedIDs.hasOwnProperty(c))return;this.receivedIDs[c]=!0}var d={id:c,name:a,origin:this.origin,timestamp:Date.now(),payload:b},e=this;this._transaction(function(){var c=i.getItem(j)||"[]",f="[]"===c?"":",";c=[c.substring(0,c.length-1),f,JSON.stringify(d),"]"].join(""),i.setItem(j,c),e.trigger(a,b),setTimeout(function(){e._cleanup_emit()},50)})},f.prototype.emit=function(a,b){this._emit.apply(this,arguments),this._trigger("emit",a,b)},f.prototype.once=function(a,b,c){if(f.supported){var d=this;this._transaction(function(){var e;try{e=JSON.parse(i.getItem(k)||"{}")}catch(f){e={}}d._once_expired(a,e)&&(e[a]={},e[a].timestamp=Date.now(),"number"==typeof c&&(e[a].ttl=1e3*c),i.setItem(k,JSON.stringify(e)),b(),setTimeout(function(){d._cleanup_once()},50))})}},e(f.prototype,g.prototype),f.supported="undefined"!=typeof i;var j="intercom",k="intercom_once",l="intercom_lock",m=5e4,n=36e5;f.destroy=function(){i.removeItem(l),i.removeItem(j),i.removeItem(k)},f.getInstance=function(){var a;return function(){return a||(a=new f),a}}(),b.exports=f}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"../src/shared.js":30,"./eventemitter.js":2}],4:[function(a,b,c){function d(a,b){return q.call(a,b)}function e(a){return null==a?0:a.length===+a.length?a.length:t(a).length}function f(a){return a}function g(a,b,c){var d,e;if(null!=a)if(m&&a.forEach===m)a.forEach(b,c);else if(a.length===+a.length){for(d=0,e=a.length;e>d;d++)if(b.call(c,a[d],d,a)===s)return}else{var f=f(a);for(d=0,e=f.length;e>d;d++)if(b.call(c,a[f[d]],f[d],a)===s)return}}function h(a,b,c){b||(b=f);var d=!1;return null==a?d:o&&a.some===o?a.some(b,c):(g(a,function(a,e,f){return d||(d=b.call(c,a,e,f))?s:void 0}),!!d)}function i(a,b){return null==a?!1:n&&a.indexOf===n?-1!=a.indexOf(b):h(a,function(a){return a===b})}function j(a){this.value=a}function k(a){return a&&"object"==typeof a&&!Array.isArray(a)&&q.call(a,"__wrapped__")?a:new j(a)}var l=Array.prototype,m=l.forEach,n=l.indexOf,o=l.some,p=Object.prototype,q=p.hasOwnProperty,r=Object.keys,s={},t=r||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[];for(var c in a)d(a,c)&&b.push(c);return b};j.prototype.has=function(a){return d(this.value,a)},j.prototype.contains=function(a){return i(this.value,a)},j.prototype.size=function(){return e(this.value)},b.exports=k},{}],5:[function(a,b,c){!function(a){"use strict";c.encode=function(b){var c,d=new Uint8Array(b),e=d.length,f="";for(c=0;e>c;c+=3)f+=a[d[c]>>2],f+=a[(3&d[c])<<4|d[c+1]>>4],f+=a[(15&d[c+1])<<2|d[c+2]>>6],f+=a[63&d[c+2]];return e%3===2?f=f.substring(0,f.length-1)+"=":e%3===1&&(f=f.substring(0,f.length-2)+"=="),f},c.decode=function(b){var c,d,e,f,g,h=.75*b.length,i=b.length,j=0;"="===b[b.length-1]&&(h--,"="===b[b.length-2]&&h--);var k=new ArrayBuffer(h),l=new Uint8Array(k);for(c=0;i>c;c+=4)d=a.indexOf(b[c]),e=a.indexOf(b[c+1]),f=a.indexOf(b[c+2]),g=a.indexOf(b[c+3]),l[j++]=d<<2|e>>4,l[j++]=(15&e)<<4|f>>2,l[j++]=(3&f)<<6|63&g;return k}}("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")},{}],6:[function(a,b,c){function d(){return e.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function e(a){return this instanceof e?(this.length=0,this.parent=void 0,"number"==typeof a?f(this,a):"string"==typeof a?g(this,a,arguments.length>1?arguments[1]:"utf8"):h(this,a)):arguments.length>1?new e(a,arguments[1]):new e(a)}function f(a,b){if(a=n(a,0>b?0:0|o(b)),!e.TYPED_ARRAY_SUPPORT)for(var c=0;b>c;c++)a[c]=0;return a}function g(a,b,c){("string"!=typeof c||""===c)&&(c="utf8");var d=0|q(b,c);return a=n(a,d),a.write(b,c),a}function h(a,b){if(e.isBuffer(b))return i(a,b);if(W(b))return j(a,b);if(null==b)throw new TypeError("must start with number, buffer, array or string");return"undefined"!=typeof ArrayBuffer&&b.buffer instanceof ArrayBuffer?k(a,b):b.length?l(a,b):m(a,b)}function i(a,b){var c=0|o(b.length);return a=n(a,c),b.copy(a,0,0,c),a}function j(a,b){var c=0|o(b.length);a=n(a,c);for(var d=0;c>d;d+=1)a[d]=255&b[d];return a}function k(a,b){var c=0|o(b.length);a=n(a,c);for(var d=0;c>d;d+=1)a[d]=255&b[d];return a}function l(a,b){var c=0|o(b.length);a=n(a,c);for(var d=0;c>d;d+=1)a[d]=255&b[d];return a}function m(a,b){var c,d=0;"Buffer"===b.type&&W(b.data)&&(c=b.data,d=0|o(c.length)),a=n(a,d);for(var e=0;d>e;e+=1)a[e]=255&c[e];return a}function n(a,b){e.TYPED_ARRAY_SUPPORT?a=e._augment(new Uint8Array(b)):(a.length=b,a._isBuffer=!0);var c=0!==b&&b<=e.poolSize>>>1;return c&&(a.parent=X),a}function o(a){if(a>=d())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+d().toString(16)+" bytes");return 0|a}function p(a,b){if(!(this instanceof p))return new p(a,b);var c=new e(a,b);return delete c.parent,c}function q(a,b){"string"!=typeof a&&(a=""+a);var c=a.length;if(0===c)return 0;for(var d=!1;;)switch(b){case"ascii":case"binary":case"raw":case"raws":return c;case"utf8":case"utf-8":return O(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*c;case"hex":return c>>>1;case"base64":return R(a).length;default:if(d)return O(a).length;b=(""+b).toLowerCase(),d=!0}}function r(a,b,c){var d=!1;if(b=0|b,c=void 0===c||c===1/0?this.length:0|c,a||(a="utf8"),0>b&&(b=0),c>this.length&&(c=this.length),b>=c)return"";for(;;)switch(a){case"hex":return C(this,b,c);case"utf8":case"utf-8":return z(this,b,c);case"ascii":return A(this,b,c);case"binary":return B(this,b,c);case"base64":return y(this,b,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return D(this,b,c);default:if(d)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),d=!0}}function s(a,b,c,d){c=Number(c)||0;var e=a.length-c;d?(d=Number(d),d>e&&(d=e)):d=e;var f=b.length;if(f%2!==0)throw new Error("Invalid hex string");d>f/2&&(d=f/2);for(var g=0;d>g;g++){var h=parseInt(b.substr(2*g,2),16);if(isNaN(h))throw new Error("Invalid hex string");a[c+g]=h}return g}function t(a,b,c,d){return S(O(b,a.length-c),a,c,d)}function u(a,b,c,d){return S(P(b),a,c,d)}function v(a,b,c,d){return u(a,b,c,d)}function w(a,b,c,d){return S(R(b),a,c,d)}function x(a,b,c,d){return S(Q(b,a.length-c),a,c,d)}function y(a,b,c){return 0===b&&c===a.length?U.fromByteArray(a):U.fromByteArray(a.slice(b,c))}function z(a,b,c){var d="",e="";c=Math.min(a.length,c);for(var f=b;c>f;f++)a[f]<=127?(d+=T(e)+String.fromCharCode(a[f]),e=""):e+="%"+a[f].toString(16);return d+T(e)}function A(a,b,c){var d="";c=Math.min(a.length,c);for(var e=b;c>e;e++)d+=String.fromCharCode(127&a[e]);return d}function B(a,b,c){var d="";c=Math.min(a.length,c);for(var e=b;c>e;e++)d+=String.fromCharCode(a[e]);return d}function C(a,b,c){var d=a.length;(!b||0>b)&&(b=0),(!c||0>c||c>d)&&(c=d);for(var e="",f=b;c>f;f++)e+=N(a[f]);return e}function D(a,b,c){for(var d=a.slice(b,c),e="",f=0;f<d.length;f+=2)e+=String.fromCharCode(d[f]+256*d[f+1]);return e}function E(a,b,c){if(a%1!==0||0>a)throw new RangeError("offset is not uint");if(a+b>c)throw new RangeError("Trying to access beyond buffer length")}function F(a,b,c,d,f,g){if(!e.isBuffer(a))throw new TypeError("buffer must be a Buffer instance");if(b>f||g>b)throw new RangeError("value is out of bounds");if(c+d>a.length)throw new RangeError("index out of range")}function G(a,b,c,d){0>b&&(b=65535+b+1);for(var e=0,f=Math.min(a.length-c,2);f>e;e++)a[c+e]=(b&255<<8*(d?e:1-e))>>>8*(d?e:1-e)}function H(a,b,c,d){0>b&&(b=4294967295+b+1);for(var e=0,f=Math.min(a.length-c,4);f>e;e++)a[c+e]=b>>>8*(d?e:3-e)&255}function I(a,b,c,d,e,f){if(b>e||f>b)throw new RangeError("value is out of bounds");if(c+d>a.length)throw new RangeError("index out of range");if(0>c)throw new RangeError("index out of range")}function J(a,b,c,d,e){return e||I(a,b,c,4,3.4028234663852886e38,-3.4028234663852886e38),V.write(a,b,c,d,23,4),c+4}function K(a,b,c,d,e){return e||I(a,b,c,8,1.7976931348623157e308,-1.7976931348623157e308),V.write(a,b,c,d,52,8),c+8}function L(a){if(a=M(a).replace(Z,""),a.length<2)return"";for(;a.length%4!==0;)a+="=";return a}function M(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")}function N(a){return 16>a?"0"+a.toString(16):a.toString(16)}function O(a,b){b=b||1/0;for(var c,d=a.length,e=null,f=[],g=0;d>g;g++){if(c=a.charCodeAt(g),c>55295&&57344>c){if(!e){if(c>56319){(b-=3)>-1&&f.push(239,191,189);continue}if(g+1===d){(b-=3)>-1&&f.push(239,191,189);continue}e=c;continue}if(56320>c){(b-=3)>-1&&f.push(239,191,189),e=c;continue}c=e-55296<<10|c-56320|65536,e=null}else e&&((b-=3)>-1&&f.push(239,191,189),e=null);if(128>c){if((b-=1)<0)break;f.push(c)}else if(2048>c){if((b-=2)<0)break;f.push(c>>6|192,63&c|128)}else if(65536>c){if((b-=3)<0)break;f.push(c>>12|224,c>>6&63|128,63&c|128)}else{if(!(2097152>c))throw new Error("Invalid code point");if((b-=4)<0)break;f.push(c>>18|240,c>>12&63|128,c>>6&63|128,63&c|128)}}return f}function P(a){for(var b=[],c=0;c<a.length;c++)b.push(255&a.charCodeAt(c));return b}function Q(a,b){for(var c,d,e,f=[],g=0;g<a.length&&!((b-=2)<0);g++)c=a.charCodeAt(g),d=c>>8,e=c%256,f.push(e),f.push(d);return f}function R(a){return U.toByteArray(L(a))}function S(a,b,c,d){for(var e=0;d>e&&!(e+c>=b.length||e>=a.length);e++)b[e+c]=a[e];return e}function T(a){try{return decodeURIComponent(a)}catch(b){return String.fromCharCode(65533)}}var U=a("base64-js"),V=a("ieee754"),W=a("is-array");c.Buffer=e,c.SlowBuffer=p,c.INSPECT_MAX_BYTES=50,e.poolSize=8192;var X={};e.TYPED_ARRAY_SUPPORT=function(){function a(){}try{var b=new ArrayBuffer(0),c=new Uint8Array(b);return c.foo=function(){return 42},c.constructor=a,42===c.foo()&&c.constructor===a&&"function"==typeof c.subarray&&0===new Uint8Array(1).subarray(1,1).byteLength}catch(d){return!1}}(),e.isBuffer=function(a){return!(null==a||!a._isBuffer)},e.compare=function(a,b){if(!e.isBuffer(a)||!e.isBuffer(b))throw new TypeError("Arguments must be Buffers");if(a===b)return 0;for(var c=a.length,d=b.length,f=0,g=Math.min(c,d);g>f&&a[f]===b[f];)++f;return f!==g&&(c=a[f],d=b[f]),d>c?-1:c>d?1:0},e.isEncoding=function(a){switch(String(a).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},e.concat=function(a,b){if(!W(a))throw new TypeError("list argument must be an Array of Buffers.");if(0===a.length)return new e(0);if(1===a.length)return a[0];var c;if(void 0===b)for(b=0,c=0;c<a.length;c++)b+=a[c].length;var d=new e(b),f=0;for(c=0;c<a.length;c++){var g=a[c];g.copy(d,f),f+=g.length}return d},e.byteLength=q,e.prototype.length=void 0,e.prototype.parent=void 0,e.prototype.toString=function(){var a=0|this.length;return 0===a?"":0===arguments.length?z(this,0,a):r.apply(this,arguments)},e.prototype.equals=function(a){if(!e.isBuffer(a))throw new TypeError("Argument must be a Buffer");return this===a?!0:0===e.compare(this,a)},e.prototype.inspect=function(){var a="",b=c.INSPECT_MAX_BYTES;return this.length>0&&(a=this.toString("hex",0,b).match(/.{2}/g).join(" "),this.length>b&&(a+=" ... ")),"<Buffer "+a+">"},e.prototype.compare=function(a){if(!e.isBuffer(a))throw new TypeError("Argument must be a Buffer");return this===a?0:e.compare(this,a)},e.prototype.indexOf=function(a,b){function c(a,b,c){for(var d=-1,e=0;c+e<a.length;e++)if(a[c+e]===b[-1===d?0:e-d]){if(-1===d&&(d=e),e-d+1===b.length)return c+d}else d=-1;return-1}if(b>2147483647?b=2147483647:-2147483648>b&&(b=-2147483648),b>>=0,0===this.length)return-1;if(b>=this.length)return-1;if(0>b&&(b=Math.max(this.length+b,0)),"string"==typeof a)return 0===a.length?-1:String.prototype.indexOf.call(this,a,b);if(e.isBuffer(a))return c(this,a,b);if("number"==typeof a)return e.TYPED_ARRAY_SUPPORT&&"function"===Uint8Array.prototype.indexOf?Uint8Array.prototype.indexOf.call(this,a,b):c(this,[a],b);throw new TypeError("val must be string, number or Buffer")},e.prototype.get=function(a){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(a)},e.prototype.set=function(a,b){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(a,b)},e.prototype.write=function(a,b,c,d){if(void 0===b)d="utf8",c=this.length,b=0;else if(void 0===c&&"string"==typeof b)d=b,c=this.length,b=0;else if(isFinite(b))b=0|b,isFinite(c)?(c=0|c,void 0===d&&(d="utf8")):(d=c,c=void 0);else{var e=d;d=b,b=0|c,c=e}var f=this.length-b;if((void 0===c||c>f)&&(c=f),a.length>0&&(0>c||0>b)||b>this.length)throw new RangeError("attempt to write outside buffer bounds");d||(d="utf8");for(var g=!1;;)switch(d){case"hex":return s(this,a,b,c);case"utf8":case"utf-8":return t(this,a,b,c);case"ascii":return u(this,a,b,c);case"binary":return v(this,a,b,c);case"base64":return w(this,a,b,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return x(this,a,b,c);default:if(g)throw new TypeError("Unknown encoding: "+d);d=(""+d).toLowerCase(),g=!0}},e.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}},e.prototype.slice=function(a,b){var c=this.length;a=~~a,b=void 0===b?c:~~b,0>a?(a+=c,0>a&&(a=0)):a>c&&(a=c),0>b?(b+=c,0>b&&(b=0)):b>c&&(b=c),a>b&&(b=a);var d;if(e.TYPED_ARRAY_SUPPORT)d=e._augment(this.subarray(a,b));else{var f=b-a;d=new e(f,void 0);for(var g=0;f>g;g++)d[g]=this[g+a]}return d.length&&(d.parent=this.parent||this),d},e.prototype.readUIntLE=function(a,b,c){a=0|a,b=0|b,c||E(a,b,this.length);for(var d=this[a],e=1,f=0;++f<b&&(e*=256);)d+=this[a+f]*e;return d},e.prototype.readUIntBE=function(a,b,c){a=0|a,b=0|b,c||E(a,b,this.length);for(var d=this[a+--b],e=1;b>0&&(e*=256);)d+=this[a+--b]*e;return d},e.prototype.readUInt8=function(a,b){return b||E(a,1,this.length),this[a]},e.prototype.readUInt16LE=function(a,b){return b||E(a,2,this.length),this[a]|this[a+1]<<8},e.prototype.readUInt16BE=function(a,b){return b||E(a,2,this.length),this[a]<<8|this[a+1]},e.prototype.readUInt32LE=function(a,b){return b||E(a,4,this.length),(this[a]|this[a+1]<<8|this[a+2]<<16)+16777216*this[a+3]},e.prototype.readUInt32BE=function(a,b){return b||E(a,4,this.length),16777216*this[a]+(this[a+1]<<16|this[a+2]<<8|this[a+3])},e.prototype.readIntLE=function(a,b,c){a=0|a,b=0|b,c||E(a,b,this.length);for(var d=this[a],e=1,f=0;++f<b&&(e*=256);)d+=this[a+f]*e;return e*=128,d>=e&&(d-=Math.pow(2,8*b)),d},e.prototype.readIntBE=function(a,b,c){a=0|a,b=0|b,c||E(a,b,this.length);for(var d=b,e=1,f=this[a+--d];d>0&&(e*=256);)f+=this[a+--d]*e;return e*=128,f>=e&&(f-=Math.pow(2,8*b)),f},e.prototype.readInt8=function(a,b){return b||E(a,1,this.length),128&this[a]?-1*(255-this[a]+1):this[a]},e.prototype.readInt16LE=function(a,b){b||E(a,2,this.length);var c=this[a]|this[a+1]<<8;return 32768&c?4294901760|c:c},e.prototype.readInt16BE=function(a,b){b||E(a,2,this.length);var c=this[a+1]|this[a]<<8;return 32768&c?4294901760|c:c},e.prototype.readInt32LE=function(a,b){return b||E(a,4,this.length),this[a]|this[a+1]<<8|this[a+2]<<16|this[a+3]<<24},e.prototype.readInt32BE=function(a,b){return b||E(a,4,this.length),this[a]<<24|this[a+1]<<16|this[a+2]<<8|this[a+3]},e.prototype.readFloatLE=function(a,b){return b||E(a,4,this.length),V.read(this,a,!0,23,4)},e.prototype.readFloatBE=function(a,b){return b||E(a,4,this.length),V.read(this,a,!1,23,4)},e.prototype.readDoubleLE=function(a,b){return b||E(a,8,this.length),V.read(this,a,!0,52,8)},e.prototype.readDoubleBE=function(a,b){return b||E(a,8,this.length),V.read(this,a,!1,52,8)},e.prototype.writeUIntLE=function(a,b,c,d){a=+a,b=0|b,c=0|c,d||F(this,a,b,c,Math.pow(2,8*c),0);var e=1,f=0;for(this[b]=255&a;++f<c&&(e*=256);)this[b+f]=a/e&255;return b+c},e.prototype.writeUIntBE=function(a,b,c,d){a=+a,b=0|b,c=0|c,d||F(this,a,b,c,Math.pow(2,8*c),0);var e=c-1,f=1;for(this[b+e]=255&a;--e>=0&&(f*=256);)this[b+e]=a/f&255;return b+c},e.prototype.writeUInt8=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,1,255,0),e.TYPED_ARRAY_SUPPORT||(a=Math.floor(a)),this[b]=a,b+1},e.prototype.writeUInt16LE=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,2,65535,0),e.TYPED_ARRAY_SUPPORT?(this[b]=a,this[b+1]=a>>>8):G(this,a,b,!0),b+2},e.prototype.writeUInt16BE=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,2,65535,0),e.TYPED_ARRAY_SUPPORT?(this[b]=a>>>8,this[b+1]=a):G(this,a,b,!1),b+2},e.prototype.writeUInt32LE=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,4,4294967295,0),e.TYPED_ARRAY_SUPPORT?(this[b+3]=a>>>24,this[b+2]=a>>>16,this[b+1]=a>>>8,this[b]=a):H(this,a,b,!0),b+4},e.prototype.writeUInt32BE=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,4,4294967295,0),e.TYPED_ARRAY_SUPPORT?(this[b]=a>>>24,this[b+1]=a>>>16,this[b+2]=a>>>8,this[b+3]=a):H(this,a,b,!1),b+4},e.prototype.writeIntLE=function(a,b,c,d){if(a=+a,b=0|b,!d){var e=Math.pow(2,8*c-1);F(this,a,b,c,e-1,-e)}var f=0,g=1,h=0>a?1:0;for(this[b]=255&a;++f<c&&(g*=256);)this[b+f]=(a/g>>0)-h&255;return b+c},e.prototype.writeIntBE=function(a,b,c,d){if(a=+a,b=0|b,!d){var e=Math.pow(2,8*c-1);F(this,a,b,c,e-1,-e)}var f=c-1,g=1,h=0>a?1:0;for(this[b+f]=255&a;--f>=0&&(g*=256);)this[b+f]=(a/g>>0)-h&255;return b+c},e.prototype.writeInt8=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,1,127,-128),e.TYPED_ARRAY_SUPPORT||(a=Math.floor(a)),0>a&&(a=255+a+1),this[b]=a,b+1},e.prototype.writeInt16LE=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,2,32767,-32768),e.TYPED_ARRAY_SUPPORT?(this[b]=a,this[b+1]=a>>>8):G(this,a,b,!0),b+2},e.prototype.writeInt16BE=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,2,32767,-32768),e.TYPED_ARRAY_SUPPORT?(this[b]=a>>>8,this[b+1]=a):G(this,a,b,!1),b+2},e.prototype.writeInt32LE=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,4,2147483647,-2147483648),e.TYPED_ARRAY_SUPPORT?(this[b]=a,this[b+1]=a>>>8,this[b+2]=a>>>16,this[b+3]=a>>>24):H(this,a,b,!0),b+4},e.prototype.writeInt32BE=function(a,b,c){return a=+a,b=0|b,c||F(this,a,b,4,2147483647,-2147483648),0>a&&(a=4294967295+a+1),e.TYPED_ARRAY_SUPPORT?(this[b]=a>>>24,this[b+1]=a>>>16,this[b+2]=a>>>8,this[b+3]=a):H(this,a,b,!1),b+4},e.prototype.writeFloatLE=function(a,b,c){return J(this,a,b,!0,c)},e.prototype.writeFloatBE=function(a,b,c){return J(this,a,b,!1,c)},e.prototype.writeDoubleLE=function(a,b,c){return K(this,a,b,!0,c)},e.prototype.writeDoubleBE=function(a,b,c){return K(this,a,b,!1,c)},e.prototype.copy=function(a,b,c,d){if(c||(c=0),d||0===d||(d=this.length),b>=a.length&&(b=a.length),b||(b=0),d>0&&c>d&&(d=c),d===c)return 0;if(0===a.length||0===this.length)return 0;if(0>b)throw new RangeError("targetStart out of bounds");if(0>c||c>=this.length)throw new RangeError("sourceStart out of bounds");if(0>d)throw new RangeError("sourceEnd out of bounds");d>this.length&&(d=this.length),a.length-b<d-c&&(d=a.length-b+c);var f=d-c;if(1e3>f||!e.TYPED_ARRAY_SUPPORT)for(var g=0;f>g;g++)a[g+b]=this[g+c];else a._set(this.subarray(c,c+f),b);return f},e.prototype.fill=function(a,b,c){if(a||(a=0),b||(b=0),c||(c=this.length),b>c)throw new RangeError("end < start");if(c!==b&&0!==this.length){if(0>b||b>=this.length)throw new RangeError("start out of bounds");if(0>c||c>this.length)throw new RangeError("end out of bounds");var d;if("number"==typeof a)for(d=b;c>d;d++)this[d]=a;else{var e=O(a.toString()),f=e.length;for(d=b;c>d;d++)this[d]=e[d%f]}return this}},e.prototype.toArrayBuffer=function(){if("undefined"!=typeof Uint8Array){if(e.TYPED_ARRAY_SUPPORT)return new e(this).buffer;for(var a=new Uint8Array(this.length),b=0,c=a.length;c>b;b+=1)a[b]=this[b];return a.buffer}throw new TypeError("Buffer.toArrayBuffer not supported in this browser")};var Y=e.prototype;e._augment=function(a){return a.constructor=e,a._isBuffer=!0,a._set=a.set,a.get=Y.get,a.set=Y.set,a.write=Y.write,a.toString=Y.toString,a.toLocaleString=Y.toString,a.toJSON=Y.toJSON,a.equals=Y.equals,a.compare=Y.compare,a.indexOf=Y.indexOf,a.copy=Y.copy,a.slice=Y.slice,a.readUIntLE=Y.readUIntLE,a.readUIntBE=Y.readUIntBE,a.readUInt8=Y.readUInt8,a.readUInt16LE=Y.readUInt16LE,a.readUInt16BE=Y.readUInt16BE,a.readUInt32LE=Y.readUInt32LE,a.readUInt32BE=Y.readUInt32BE,a.readIntLE=Y.readIntLE,a.readIntBE=Y.readIntBE,a.readInt8=Y.readInt8,a.readInt16LE=Y.readInt16LE,a.readInt16BE=Y.readInt16BE,a.readInt32LE=Y.readInt32LE,a.readInt32BE=Y.readInt32BE,a.readFloatLE=Y.readFloatLE,a.readFloatBE=Y.readFloatBE,a.readDoubleLE=Y.readDoubleLE,a.readDoubleBE=Y.readDoubleBE,a.writeUInt8=Y.writeUInt8,a.writeUIntLE=Y.writeUIntLE,a.writeUIntBE=Y.writeUIntBE,a.writeUInt16LE=Y.writeUInt16LE,a.writeUInt16BE=Y.writeUInt16BE,a.writeUInt32LE=Y.writeUInt32LE,a.writeUInt32BE=Y.writeUInt32BE,a.writeIntLE=Y.writeIntLE,a.writeIntBE=Y.writeIntBE,a.writeInt8=Y.writeInt8,a.writeInt16LE=Y.writeInt16LE,a.writeInt16BE=Y.writeInt16BE,a.writeInt32LE=Y.writeInt32LE,a.writeInt32BE=Y.writeInt32BE,a.writeFloatLE=Y.writeFloatLE,a.writeFloatBE=Y.writeFloatBE,a.writeDoubleLE=Y.writeDoubleLE,a.writeDoubleBE=Y.writeDoubleBE,a.fill=Y.fill,a.inspect=Y.inspect,a.toArrayBuffer=Y.toArrayBuffer,a};var Z=/[^+\/0-9A-z\-]/g},{"base64-js":7,ieee754:8,"is-array":9}],7:[function(a,b,c){var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";!function(a){"use strict";function b(a){var b=a.charCodeAt(0);return b===g||b===l?62:b===h||b===m?63:i>b?-1:i+10>b?b-i+26+26:k+26>b?b-k:j+26>b?b-j+26:void 0}function c(a){function c(a){j[l++]=a}var d,e,g,h,i,j;if(a.length%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var k=a.length;i="="===a.charAt(k-2)?2:"="===a.charAt(k-1)?1:0,j=new f(3*a.length/4-i),g=i>0?a.length-4:a.length;var l=0;for(d=0,e=0;g>d;d+=4,e+=3)h=b(a.charAt(d))<<18|b(a.charAt(d+1))<<12|b(a.charAt(d+2))<<6|b(a.charAt(d+3)),c((16711680&h)>>16),c((65280&h)>>8),c(255&h);return 2===i?(h=b(a.charAt(d))<<2|b(a.charAt(d+1))>>4,c(255&h)):1===i&&(h=b(a.charAt(d))<<10|b(a.charAt(d+1))<<4|b(a.charAt(d+2))>>2,c(h>>8&255),c(255&h)),j}function e(a){function b(a){return d.charAt(a)}function c(a){return b(a>>18&63)+b(a>>12&63)+b(a>>6&63)+b(63&a)}var e,f,g,h=a.length%3,i="";for(e=0,g=a.length-h;g>e;e+=3)f=(a[e]<<16)+(a[e+1]<<8)+a[e+2],i+=c(f);switch(h){case 1:f=a[a.length-1],i+=b(f>>2),i+=b(f<<4&63),i+="==";break;case 2:f=(a[a.length-2]<<8)+a[a.length-1],i+=b(f>>10),i+=b(f>>4&63),i+=b(f<<2&63),i+="="}return i}var f="undefined"!=typeof Uint8Array?Uint8Array:Array,g="+".charCodeAt(0),h="/".charCodeAt(0),i="0".charCodeAt(0),j="a".charCodeAt(0),k="A".charCodeAt(0),l="-".charCodeAt(0),m="_".charCodeAt(0);a.toByteArray=c,a.fromByteArray=e}("undefined"==typeof c?this.base64js={}:c)},{}],8:[function(a,b,c){c.read=function(a,b,c,d,e){var f,g,h=8*e-d-1,i=(1<<h)-1,j=i>>1,k=-7,l=c?e-1:0,m=c?-1:1,n=a[b+l];for(l+=m,f=n&(1<<-k)-1,n>>=-k,k+=h;k>0;f=256*f+a[b+l],l+=m,k-=8);for(g=f&(1<<-k)-1,f>>=-k,k+=d;k>0;g=256*g+a[b+l],l+=m,k-=8);if(0===f)f=1-j;else{if(f===i)return g?NaN:(n?-1:1)*(1/0);g+=Math.pow(2,d),f-=j}return(n?-1:1)*g*Math.pow(2,f-d)},c.write=function(a,b,c,d,e,f){var g,h,i,j=8*f-e-1,k=(1<<j)-1,l=k>>1,m=23===e?Math.pow(2,-24)-Math.pow(2,-77):0,n=d?0:f-1,o=d?1:-1,p=0>b||0===b&&0>1/b?1:0;for(b=Math.abs(b),isNaN(b)||b===1/0?(h=isNaN(b)?1:0,g=k):(g=Math.floor(Math.log(b)/Math.LN2),b*(i=Math.pow(2,-g))<1&&(g--,i*=2),b+=g+l>=1?m/i:m*Math.pow(2,1-l),b*i>=2&&(g++,i/=2),g+l>=k?(h=0,g=k):g+l>=1?(h=(b*i-1)*Math.pow(2,e),g+=l):(h=b*Math.pow(2,l-1)*Math.pow(2,e),g=0));e>=8;a[c+n]=255&h,n+=o,h/=256,e-=8);for(g=g<<e|h,j+=e;j>0;a[c+n]=255&g,n+=o,g/=256,j-=8);a[c+n-o]|=128*p}},{}],9:[function(a,b,c){var d=Array.isArray,e=Object.prototype.toString;b.exports=d||function(a){return!!a&&"[object Array]"==e.call(a)}},{}],10:[function(a,b,c){function d(a,b){for(var c=0,d=a.length-1;d>=0;d--){var e=a[d];"."===e?a.splice(d,1):".."===e?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c--;c)a.unshift("..");return a}function e(a,b){if(a.filter)return a.filter(b);for(var c=[],d=0;d<a.length;d++)b(a[d],d,a)&&c.push(a[d]);return c}var f=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,g=function(a){return f.exec(a).slice(1)};c.resolve=function(){for(var a="",b=!1,c=arguments.length-1;c>=-1&&!b;c--){var f=c>=0?arguments[c]:process.cwd();if("string"!=typeof f)throw new TypeError("Arguments to path.resolve must be strings");f&&(a=f+"/"+a,b="/"===f.charAt(0))}return a=d(e(a.split("/"),function(a){return!!a}),!b).join("/"),(b?"/":"")+a||"."},c.normalize=function(a){var b=c.isAbsolute(a),f="/"===h(a,-1);return a=d(e(a.split("/"),function(a){return!!a}),!b).join("/"),a||b||(a="."),a&&f&&(a+="/"),(b?"/":"")+a},c.isAbsolute=function(a){return"/"===a.charAt(0)},c.join=function(){var a=Array.prototype.slice.call(arguments,0);return c.normalize(e(a,function(a,b){if("string"!=typeof a)throw new TypeError("Arguments to path.join must be strings");return a}).join("/"))},c.relative=function(a,b){function d(a){for(var b=0;b<a.length&&""===a[b];b++);for(var c=a.length-1;c>=0&&""===a[c];c--);return b>c?[]:a.slice(b,c-b+1)}a=c.resolve(a).substr(1),b=c.resolve(b).substr(1);for(var e=d(a.split("/")),f=d(b.split("/")),g=Math.min(e.length,f.length),h=g,i=0;g>i;i++)if(e[i]!==f[i]){h=i;break}for(var j=[],i=h;i<e.length;i++)j.push("..");return j=j.concat(f.slice(h)),j.join("/")},c.sep="/",c.delimiter=":",c.dirname=function(a){var b=g(a),c=b[0],d=b[1];return c||d?(d&&(d=d.substr(0,d.length-1)),c+d):"."},c.basename=function(a,b){var c=g(a)[2];return b&&c.substr(-1*b.length)===b&&(c=c.substr(0,c.length-b.length)),c},c.extname=function(a){return g(a)[3]};var h="b"==="ab".substr(-1)?function(a,b,c){return a.substr(b,c)}:function(a,b,c){return 0>b&&(b=a.length+b),a.substr(b,c)}},{}],11:[function(a,b,c){!function(a,b,c,d){function e(a){return a.split("").reduce(function(a,b){return a[b]=!0,a},{})}function f(a,b){return b=b||{},function(c,d,e){return h(c,a,b)}}function g(a,b){a=a||{},b=b||{};var c={};return Object.keys(b).forEach(function(a){c[a]=b[a]}),Object.keys(a).forEach(function(b){c[b]=a[b]}),c}function h(a,b,c){if("string"!=typeof b)throw new TypeError("glob pattern string required");return c||(c={}),c.nocomment||"#"!==b.charAt(0)?""===b.trim()?""===a:new i(b,c).match(a):!1}function i(a,b){if(!(this instanceof i))return new i(a,b,t);if("string"!=typeof a)throw new TypeError("glob pattern string required");b||(b={}),a=a.trim(),"win32"===d&&(a=a.split("\\").join("/"));var c=a+"\n"+v(b),e=h.cache.get(c);return e?e:(h.cache.set(c,this),this.options=b,this.set=[],this.pattern=a,this.regexp=null,this.negate=!1,this.comment=!1,this.empty=!1,void this.make())}function j(){if(!this._made){var a=this.pattern,b=this.options;if(!b.nocomment&&"#"===a.charAt(0))return void(this.comment=!0);if(!a)return void(this.empty=!0);this.parseNegate();var c=this.globSet=this.braceExpand();b.debug&&(this.debug=console.error),this.debug(this.pattern,c),c=this.globParts=c.map(function(a){return a.split(B)}),this.debug(this.pattern,c),c=c.map(function(a,b,c){return a.map(this.parse,this)},this),this.debug(this.pattern,c),c=c.filter(function(a){return-1===a.indexOf(!1)}),this.debug(this.pattern,c),this.set=c}}function k(){var a=this.pattern,b=!1,c=this.options,d=0;if(!c.nonegate){for(var e=0,f=a.length;f>e&&"!"===a.charAt(e);e++)b=!b,d++;d&&(this.pattern=a.substr(d)),this.negate=b}}function l(a,b,c){return c=c||"0",a+="",a.length>=b?a:new Array(b-a.length+1).join(c)+a}function m(a,b){function c(){t.push(x),
x=""}if(b=b||this.options,a="undefined"==typeof a?this.pattern:a,"undefined"==typeof a)throw new Error("undefined pattern");if(b.nobrace||!a.match(/\{.*\}/))return[a];var d=!1;if("{"!==a.charAt(0)){this.debug(a);for(var e=null,f=0,g=a.length;g>f;f++){var h=a.charAt(f);if(this.debug(f,h),"\\"===h)d=!d;else if("{"===h&&!d){e=a.substr(0,f);break}}if(null===e)return this.debug("no sets"),[a];var i=m.call(this,a.substr(f),b);return i.map(function(a){return e+a})}var j=a.match(/^\{(-?[0-9]+)\.\.(-?[0-9]+)\}/);if(j){this.debug("numset",j[1],j[2]);for(var k,n=m.call(this,a.substr(j[0].length),b),o=+j[1],p="0"===j[1][0],q=j[1].length,r=+j[2],s=o>r?-1:1,t=[],f=o;f!=r+s;f+=s){k=p?l(f,q):f+"";for(var u=0,v=n.length;v>u;u++)t.push(k+n[u])}return t}var f=1,w=1,t=[],x="",d=!1;this.debug("Entering for");a:for(f=1,g=a.length;g>f;f++){var h=a.charAt(f);if(this.debug("",f,h),d)d=!1,x+="\\"+h;else switch(h){case"\\":d=!0;continue;case"{":w++,x+="{";continue;case"}":if(w--,0===w){c(),f++;break a}x+=h;continue;case",":1===w?c():x+=h;continue;default:x+=h;continue}}if(0!==w)return this.debug("didn't close",a),m.call(this,"\\"+a,b);this.debug("set",t),this.debug("suffix",a.substr(f));var n=m.call(this,a.substr(f),b),y=1===t.length;this.debug("set pre-expanded",t),t=t.map(function(a){return m.call(this,a,b)},this),this.debug("set expanded",t),t=t.reduce(function(a,b){return a.concat(b)}),y&&(t=t.map(function(a){return"{"+a+"}"}));for(var z=[],f=0,g=t.length;g>f;f++)for(var u=0,v=n.length;v>u;u++)z.push(t[f]+n[u]);return z}function n(a,b){function c(){if(f){switch(f){case"*":h+=x,i=!0;break;case"?":h+=w,i=!0;break;default:h+="\\"+f}p.debug("clearStateChar %j %j",f,h),f=!1}}var d=this.options;if(!d.noglobstar&&"**"===a)return u;if(""===a)return"";for(var e,f,g,h="",i=!!d.nocase,j=!1,k=[],l=!1,m=-1,n=-1,o="."===a.charAt(0)?"":d.dot?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)",p=this,r=0,s=a.length;s>r&&(g=a.charAt(r));r++)if(this.debug("%s	%s %s %j",a,r,h,g),j&&A[g])h+="\\"+g,j=!1;else switch(g){case"/":return!1;case"\\":c(),j=!0;continue;case"?":case"*":case"+":case"@":case"!":if(this.debug("%s	%s %s %j <-- stateChar",a,r,h,g),l){this.debug("  in class"),"!"===g&&r===n+1&&(g="^"),h+=g;continue}p.debug("call clearStateChar %j",f),c(),f=g,d.noext&&c();continue;case"(":if(l){h+="(";continue}if(!f){h+="\\(";continue}e=f,k.push({type:e,start:r-1,reStart:h.length}),h+="!"===f?"(?:(?!":"(?:",this.debug("plType %j %j",f,h),f=!1;continue;case")":if(l||!k.length){h+="\\)";continue}switch(c(),i=!0,h+=")",e=k.pop().type){case"!":h+="[^/]*?)";break;case"?":case"+":case"*":h+=e;case"@":}continue;case"|":if(l||!k.length||j){h+="\\|",j=!1;continue}c(),h+="|";continue;case"[":if(c(),l){h+="\\"+g;continue}l=!0,n=r,m=h.length,h+=g;continue;case"]":if(r===n+1||!l){h+="\\"+g,j=!1;continue}i=!0,l=!1,h+=g;continue;default:c(),j?j=!1:!A[g]||"^"===g&&l||(h+="\\"),h+=g}if(l){var t=a.substr(n+1),v=this.parse(t,C);h=h.substr(0,m)+"\\["+v[0],i=i||v[1]}for(var y;y=k.pop();){var z=h.slice(y.reStart+3);z=z.replace(/((?:\\{2})*)(\\?)\|/g,function(a,b,c){return c||(c="\\"),b+b+c+"|"}),this.debug("tail=%j\n   %s",z,z);var B="*"===y.type?x:"?"===y.type?w:"\\"+y.type;i=!0,h=h.slice(0,y.reStart)+B+"\\("+z}c(),j&&(h+="\\\\");var D=!1;switch(h.charAt(0)){case".":case"[":case"(":D=!0}if(""!==h&&i&&(h="(?=.)"+h),D&&(h=o+h),b===C)return[h,i];if(!i)return q(a);var E=d.nocase?"i":"",F=new RegExp("^"+h+"$",E);return F._glob=a,F._src=h,F}function o(){if(this.regexp||this.regexp===!1)return this.regexp;var a=this.set;if(!a.length)return this.regexp=!1;var b=this.options,c=b.noglobstar?x:b.dot?y:z,d=b.nocase?"i":"",e=a.map(function(a){return a.map(function(a){return a===u?c:"string"==typeof a?r(a):a._src}).join("\\/")}).join("|");e="^(?:"+e+")$",this.negate&&(e="^(?!"+e+").*$");try{return this.regexp=new RegExp(e,d)}catch(f){return this.regexp=!1}}function p(a,b){if(this.debug("match",a,this.pattern),this.comment)return!1;if(this.empty)return""===a;if("/"===a&&b)return!0;var c=this.options;"win32"===d&&(a=a.split("\\").join("/")),a=a.split(B),this.debug(this.pattern,"split",a);var e=this.set;this.debug(this.pattern,"set",e);for(var f,g=a.length-1;g>=0&&!(f=a[g]);g--);for(var g=0,h=e.length;h>g;g++){var i=e[g],j=a;c.matchBase&&1===i.length&&(j=[f]);var k=this.matchOne(j,i,b);if(k)return c.flipNegate?!0:!this.negate}return c.flipNegate?!1:this.negate}function q(a){return a.replace(/\\(.)/g,"$1")}function r(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")}c?c.exports=h:b.minimatch=h,a||(a=function(a){switch(a){case"sigmund":return function(a){return JSON.stringify(a)};case"path":return{basename:function(a){a=a.split(/[\/\\]/);var b=a.pop();return b||(b=a.pop()),b}};case"lru-cache":return function(){var a={},b=0;this.set=function(c,d){b++,b>=100&&(a={}),a[c]=d},this.get=function(b){return a[b]}}}}),h.Minimatch=i;var s=a("lru-cache"),t=h.cache=new s({max:100}),u=h.GLOBSTAR=i.GLOBSTAR={},v=a("sigmund"),w=(a("path"),"[^/]"),x=w+"*?",y="(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?",z="(?:(?!(?:\\/|^)\\.).)*?",A=e("().*{}+?[]^$\\!"),B=/\/+/;h.filter=f,h.defaults=function(a){if(!a||!Object.keys(a).length)return h;var b=h,c=function(c,d,e){return b.minimatch(c,d,g(a,e))};return c.Minimatch=function(c,d){return new b.Minimatch(c,g(a,d))},c},i.defaults=function(a){return a&&Object.keys(a).length?h.defaults(a).Minimatch:i},i.prototype.debug=function(){},i.prototype.make=j,i.prototype.parseNegate=k,h.braceExpand=function(a,b){return new i(a,b).braceExpand()},i.prototype.braceExpand=m,i.prototype.parse=n;var C={};h.makeRe=function(a,b){return new i(a,b||{}).makeRe()},i.prototype.makeRe=o,h.match=function(a,b,c){c=c||{};var d=new i(b,c);return a=a.filter(function(a){return d.match(a)}),d.options.nonull&&!a.length&&a.push(b),a},i.prototype.match=p,i.prototype.matchOne=function(a,b,c){var d=this.options;this.debug("matchOne",{"this":this,file:a,pattern:b}),this.debug("matchOne",a.length,b.length);for(var e=0,f=0,g=a.length,h=b.length;g>e&&h>f;e++,f++){this.debug("matchOne loop");var i=b[f],j=a[e];if(this.debug(b,i,j),i===!1)return!1;if(i===u){this.debug("GLOBSTAR",[b,i,j]);var k=e,l=f+1;if(l===h){for(this.debug("** at the end");g>e;e++)if("."===a[e]||".."===a[e]||!d.dot&&"."===a[e].charAt(0))return!1;return!0}a:for(;g>k;){var m=a[k];if(this.debug("\nglobstar while",a,k,b,l,m),this.matchOne(a.slice(k),b.slice(l),c))return this.debug("globstar found match!",k,g,m),!0;if("."===m||".."===m||!d.dot&&"."===m.charAt(0)){this.debug("dot detected!",a,k,b,l);break a}this.debug("globstar swallow a segment, and continue"),k++}return c&&(this.debug("\n>>> no match, partial?",a,k,b,l),k===g)?!0:!1}var n;if("string"==typeof i?(n=d.nocase?j.toLowerCase()===i.toLowerCase():j===i,this.debug("string match",i,j,n)):(n=j.match(i),this.debug("pattern match",i,j,n)),!n)return!1}if(e===g&&f===h)return!0;if(e===g)return c;if(f===h){var o=e===g-1&&""===a[e];return o}throw new Error("wtf?")}}("function"==typeof a?a:null,this,"object"==typeof b?b:null,"object"==typeof process?process.platform:"win32")},{"lru-cache":12,path:10,sigmund:13}],12:[function(a,b,c){!function(){function a(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function c(){return 1}function d(a){return this instanceof d?("number"==typeof a&&(a={max:a}),a||(a={}),this._max=a.max,(!this._max||"number"!=typeof this._max||this._max<=0)&&(this._max=1/0),this._lengthCalculator=a.length||c,"function"!=typeof this._lengthCalculator&&(this._lengthCalculator=c),this._allowStale=a.stale||!1,this._maxAge=a.maxAge||null,this._dispose=a.dispose,void this.reset()):new d(a)}function e(a,b,c){var d=a._cache[b];return d&&(f(a,d)?(j(a,d),a._allowStale||(d=void 0)):c&&g(a,d),d&&(d=d.value)),d}function f(a,b){if(!b||!b.maxAge&&!a._maxAge)return!1;var c=!1,d=Date.now()-b.now;return c=b.maxAge?d>b.maxAge:a._maxAge&&d>a._maxAge}function g(a,b){i(a,b),b.lu=a._mru++,a._lruList[b.lu]=b}function h(a){for(;a._lru<a._mru&&a._length>a._max;)j(a,a._lruList[a._lru])}function i(a,b){for(delete a._lruList[b.lu];a._lru<a._mru&&!a._lruList[a._lru];)a._lru++}function j(a,b){b&&(a._dispose&&a._dispose(b.key,b.value),a._length-=b.length,a._itemCount--,delete a._cache[b.key],i(a,b))}function k(a,b,c,d,e,f){this.key=a,this.value=b,this.lu=c,this.length=d,this.now=e,f&&(this.maxAge=f)}"object"==typeof b&&b.exports?b.exports=d:this.LRUCache=d,Object.defineProperty(d.prototype,"max",{set:function(a){(!a||"number"!=typeof a||0>=a)&&(a=1/0),this._max=a,this._length>this._max&&h(this)},get:function(){return this._max},enumerable:!0}),Object.defineProperty(d.prototype,"lengthCalculator",{set:function(a){if("function"!=typeof a){this._lengthCalculator=c,this._length=this._itemCount;for(var b in this._cache)this._cache[b].length=1}else{this._lengthCalculator=a,this._length=0;for(var b in this._cache)this._cache[b].length=this._lengthCalculator(this._cache[b].value),this._length+=this._cache[b].length}this._length>this._max&&h(this)},get:function(){return this._lengthCalculator},enumerable:!0}),Object.defineProperty(d.prototype,"length",{get:function(){return this._length},enumerable:!0}),Object.defineProperty(d.prototype,"itemCount",{get:function(){return this._itemCount},enumerable:!0}),d.prototype.forEach=function(a,b){b=b||this;for(var c=0,d=this._itemCount,e=this._mru-1;e>=0&&d>c;e--)if(this._lruList[e]){c++;var g=this._lruList[e];f(this,g)&&(j(this,g),this._allowStale||(g=void 0)),g&&a.call(b,g.value,g.key,this)}},d.prototype.keys=function(){for(var a=new Array(this._itemCount),b=0,c=this._mru-1;c>=0&&b<this._itemCount;c--)if(this._lruList[c]){var d=this._lruList[c];a[b++]=d.key}return a},d.prototype.values=function(){for(var a=new Array(this._itemCount),b=0,c=this._mru-1;c>=0&&b<this._itemCount;c--)if(this._lruList[c]){var d=this._lruList[c];a[b++]=d.value}return a},d.prototype.reset=function(){if(this._dispose&&this._cache)for(var a in this._cache)this._dispose(a,this._cache[a].value);this._cache=Object.create(null),this._lruList=Object.create(null),this._mru=0,this._lru=0,this._length=0,this._itemCount=0},d.prototype.dump=function(){return this._cache},d.prototype.dumpLru=function(){return this._lruList},d.prototype.set=function(b,c,d){d=d||this._maxAge;var e=d?Date.now():0;if(a(this._cache,b))return this._dispose&&this._dispose(b,this._cache[b].value),this._cache[b].now=e,this._cache[b].maxAge=d,this._cache[b].value=c,this.get(b),!0;var f=this._lengthCalculator(c),g=new k(b,c,this._mru++,f,e,d);return g.length>this._max?(this._dispose&&this._dispose(b,c),!1):(this._length+=g.length,this._lruList[g.lu]=this._cache[b]=g,this._itemCount++,this._length>this._max&&h(this),!0)},d.prototype.has=function(b){if(!a(this._cache,b))return!1;var c=this._cache[b];return f(this,c)?!1:!0},d.prototype.get=function(a){return e(this,a,!0)},d.prototype.peek=function(a){return e(this,a,!1)},d.prototype.pop=function(){var a=this._lruList[this._lru];return j(this,a),a||null},d.prototype.del=function(a){j(this,this._cache[a])}}()},{}],13:[function(a,b,c){function d(a,b){function c(a,g){return g>b||"function"==typeof a||"undefined"==typeof a?void 0:"object"!=typeof a||!a||a instanceof f?void(e+=a):void(-1===d.indexOf(a)&&g!==b&&(d.push(a),e+="{",Object.keys(a).forEach(function(b,d,f){if("_"!==b.charAt(0)){var h=typeof a[b];"function"!==h&&"undefined"!==h&&(e+=b,c(a[b],g+1))}})))}b=b||10;var d=[],e="",f=RegExp;return c(a,0),e}b.exports=d},{}],14:[function(a,b,c){(function(a){function c(b,c,d){return b instanceof ArrayBuffer&&(b=new Uint8Array(b)),new a(b,c,d)}c.prototype=Object.create(a.prototype),c.prototype.constructor=c,Object.keys(a).forEach(function(b){a.hasOwnProperty(b)&&(c[b]=a[b])}),b.exports=c}).call(this,a("buffer").Buffer)},{buffer:6}],15:[function(a,b,c){var d="READ",e="WRITE",f="CREATE",g="EXCLUSIVE",h="TRUNCATE",i="APPEND",j="CREATE",k="REPLACE";b.exports={FILE_SYSTEM_NAME:"local",FILE_STORE_NAME:"files",IDB_RO:"readonly",IDB_RW:"readwrite",WSQL_VERSION:"1",WSQL_SIZE:5242880,WSQL_DESC:"FileSystem Storage",MODE_FILE:"FILE",MODE_DIRECTORY:"DIRECTORY",MODE_SYMBOLIC_LINK:"SYMLINK",MODE_META:"META",SYMLOOP_MAX:10,BINARY_MIME_TYPE:"application/octet-stream",JSON_MIME_TYPE:"application/json",ROOT_DIRECTORY_NAME:"/",FS_FORMAT:"FORMAT",FS_NOCTIME:"NOCTIME",FS_NOMTIME:"NOMTIME",FS_NODUPEIDCHECK:"FS_NODUPEIDCHECK",O_READ:d,O_WRITE:e,O_CREATE:f,O_EXCLUSIVE:g,O_TRUNCATE:h,O_APPEND:i,O_FLAGS:{r:[d],"r+":[d,e],w:[e,f,h],"w+":[e,d,f,h],wx:[e,f,g,h],"wx+":[e,d,f,g,h],a:[e,f,i],"a+":[e,d,f,i],ax:[e,f,g,i],"ax+":[e,d,f,g,i]},XATTR_CREATE:j,XATTR_REPLACE:k,FS_READY:"READY",FS_PENDING:"PENDING",FS_ERROR:"ERROR",SUPER_NODE_ID:"00000000-0000-0000-0000-000000000000",STDIN:0,STDOUT:1,STDERR:2,FIRST_DESCRIPTOR:3,ENVIRONMENT:{TMP:"/tmp",PATH:""}}},{}],16:[function(a,b,c){var d=a("./constants.js").MODE_FILE;b.exports=function(a,b){this.id=a,this.type=b||d}},{"./constants.js":15}],17:[function(a,b,c){(function(a){function c(a){return a.toString("utf8")}function d(b){return new a(b,"utf8")}b.exports={encode:d,decode:c}}).call(this,a("buffer").Buffer)},{buffer:6}],18:[function(a,b,c){var d={};["9:EBADF:bad file descriptor","10:EBUSY:resource busy or locked","18:EINVAL:invalid argument","27:ENOTDIR:not a directory","28:EISDIR:illegal operation on a directory","34:ENOENT:no such file or directory","47:EEXIST:file already exists","50:EPERM:operation not permitted","51:ELOOP:too many symbolic links encountered","53:ENOTEMPTY:directory not empty","55:EIO:i/o error","1000:ENOTMOUNTED:not mounted","1001:EFILESYSTEMERROR:missing super node, use 'FORMAT' flag to format filesystem.","1002:ENOATTR:attribute does not exist"].forEach(function(a){function b(a,b){Error.call(this),this.name=e,this.code=e,this.errno=c,this.message=a||f,b&&(this.path=b),this.stack=new Error(this.message).stack}a=a.split(":");var c=+a[0],e=a[1],f=a[2];b.prototype=Object.create(Error.prototype),b.prototype.constructor=b,b.prototype.toString=function(){var a=this.path?", '"+this.path+"'":"";return this.name+": "+this.message+a},d[e]=d[c]=b}),b.exports=d},{}],19:[function(a,b,c){function d(a,b,c,d,e){function f(c){a.changes.push({event:"change",path:b}),e(c)}var g=a.flags;ma(g).contains(Ka)&&delete d.ctime,ma(g).contains(Ja)&&delete d.mtime;var h=!1;d.ctime&&(c.ctime=d.ctime,c.atime=d.ctime,h=!0),d.atime&&(c.atime=d.atime,h=!0),d.mtime&&(c.mtime=d.mtime,h=!0),h?a.putObject(c.id,c,f):f()}function e(a,b,c,e){function g(c,d){c?e(c):d.mode!==va?e(new Ma.ENOTDIR("a component of the path prefix is not a directory",b)):(l=d,f(a,b,h))}function h(c,d){!c&&d?e(new Ma.EEXIST("path name already exists",b)):!c||c instanceof Ma.ENOENT?a.getObject(l.data,i):e(c)}function i(b,d){b?e(b):(m=d,Qa.create({guid:a.guid,mode:c},function(b,c){return b?void e(b):(n=c,n.nlinks+=1,void a.putObject(n.id,n,k))}))}function j(b){if(b)e(b);else{var c=Date.now();d(a,p,n,{mtime:c,ctime:c},e)}}function k(b){b?e(b):(m[o]=new Na(n.id,c),a.putObject(l.data,m,j))}if(c!==va&&c!==ua)return e(new Ma.EINVAL("mode must be a directory or file",b));b=oa(b);var l,m,n,o=qa(b),p=pa(b);f(a,p,g)}function f(a,b,c){function d(b,d){b?c(b):d&&d.mode===xa&&d.rnode?a.getObject(d.rnode,e):c(new Ma.EFILESYSTEMERROR)}function e(a,b){a?c(a):b?c(null,b):c(new Ma.ENOENT)}function g(d,e){d?c(d):e.mode===va&&e.data?a.getObject(e.data,h):c(new Ma.ENOTDIR("a component of the path prefix is not a directory",b))}function h(d,e){if(d)c(d);else if(ma(e).has(k)){var f=e[k].id;a.getObject(f,i)}else c(new Ma.ENOENT(null,b))}function i(a,d){a?c(a):d.mode==wa?(m++,m>Aa?c(new Ma.ELOOP(null,b)):j(d.data)):c(null,d)}function j(b){b=oa(b),l=pa(b),k=qa(b),ya==k?a.getObject(za,d):f(a,l,g)}if(b=oa(b),!b)return c(new Ma.ENOENT("path is an empty string"));var k=qa(b),l=pa(b),m=0;ya==k?a.getObject(za,d):f(a,l,g)}function g(a,b,c,e,f,g,h){function i(e){e?h(e):d(a,b,c,{ctime:Date.now()},h)}var j=c.xattrs;g===Ha&&j.hasOwnProperty(e)?h(new Ma.EEXIST("attribute already exists",b)):g!==Ia||j.hasOwnProperty(e)?(j[e]=f,a.putObject(c.id,c,i)):h(new Ma.ENOATTR(null,b))}function h(a,b){function c(c,e){!c&&e?b():!c||c instanceof Ma.ENOENT?Pa.create({guid:a.guid},function(c,e){return c?void b(c):(f=e,void a.putObject(f.id,f,d))}):b(c)}function d(c){c?b(c):Qa.create({guid:a.guid,id:f.rnode,mode:va},function(c,d){return c?void b(c):(g=d,g.nlinks+=1,void a.putObject(g.id,g,e))})}function e(c){c?b(c):(h={},a.putObject(g.data,h,b))}var f,g,h;a.getObject(za,c)}function i(a,b,c){function e(d,e){!d&&e?c(new Ma.EEXIST(null,b)):!d||d instanceof Ma.ENOENT?f(a,q,g):c(d)}function g(b,d){b?c(b):(n=d,a.getObject(n.data,h))}function h(b,d){b?c(b):(o=d,Qa.create({guid:a.guid,mode:va},function(b,d){return b?void c(b):(l=d,l.nlinks+=1,void a.putObject(l.id,l,i))}))}function i(b){b?c(b):(m={},a.putObject(l.data,m,k))}function j(b){if(b)c(b);else{var e=Date.now();d(a,q,n,{mtime:e,ctime:e},c)}}function k(b){b?c(b):(o[p]=new Na(l.id,va),a.putObject(n.data,o,j))}b=oa(b);var l,m,n,o,p=qa(b),q=pa(b);f(a,b,e)}function j(a,b,c){function e(b,d){b?c(b):(p=d,a.getObject(p.data,g))}function g(d,e){d?c(d):ya==r?c(new Ma.EBUSY(null,b)):ma(e).has(r)?(q=e,n=q[r].id,a.getObject(n,h)):c(new Ma.ENOENT(null,b))}function h(d,e){d?c(d):e.mode!=va?c(new Ma.ENOTDIR(null,b)):(n=e,a.getObject(n.data,i))}function i(a,d){a?c(a):(o=d,ma(o).size()>0?c(new Ma.ENOTEMPTY(null,b)):k())}function j(b){if(b)c(b);else{var e=Date.now();d(a,s,p,{mtime:e,ctime:e},l)}}function k(){delete q[r],a.putObject(p.data,q,j)}function l(b){b?c(b):a["delete"](n.id,m)}function m(b){b?c(b):a["delete"](n.data,c)}b=oa(b);var n,o,p,q,r=qa(b),s=pa(b);f(a,s,e)}function k(a,b,c,e){function g(c,d){c?e(c):d.mode!==va?e(new Ma.ENOENT(null,b)):(q=d,a.getObject(q.data,h))}function h(d,f){d?e(d):(r=f,ma(r).has(v)?ma(c).contains(Ea)?e(new Ma.ENOENT("O_CREATE and O_EXCLUSIVE are set, and the named file exists",b)):(s=r[v],s.type==va&&ma(c).contains(Ca)?e(new Ma.EISDIR("the named file is a directory and O_WRITE is set",b)):a.getObject(s.id,i)):ma(c).contains(Da)?l():e(new Ma.ENOENT("O_CREATE is not set and the named file does not exist",b)))}function i(a,c){if(a)e(a);else{var d=c;d.mode==wa?(x++,x>Aa?e(new Ma.ELOOP(null,b)):j(d.data)):k(void 0,d)}}function j(d){d=oa(d),w=pa(d),v=qa(d),ya==v&&(ma(c).contains(Ca)?e(new Ma.EISDIR("the named file is a directory and O_WRITE is set",b)):f(a,b,k)),f(a,w,g)}function k(a,b){a?e(a):(t=b,e(null,t))}function l(){Qa.create({guid:a.guid,mode:ua},function(b,c){return b?void e(b):(t=c,t.nlinks+=1,void a.putObject(t.id,t,m))})}function m(b){b?e(b):(u=new Sa(0),u.fill(0),a.putBuffer(t.data,u,o))}function n(b){if(b)e(b);else{var c=Date.now();d(a,w,q,{mtime:c,ctime:c},p)}}function o(b){b?e(b):(r[v]=new Na(t.id,ua),a.putObject(q.data,r,n))}function p(a){a?e(a):e(null,t)}b=oa(b);var q,r,s,t,u,v=qa(b),w=pa(b),x=0;ya==v?ma(c).contains(Ca)?e(new Ma.EISDIR("the named file is a directory and O_WRITE is set",b)):f(a,b,k):f(a,w,g)}function l(a,b,c,e,f,g){function h(a){a?g(a):g(null,f)}function i(c){if(c)g(c);else{var e=Date.now();d(a,b.path,l,{mtime:e,ctime:e},h)}}function j(b){b?g(b):a.putObject(l.id,l,i)}function k(d,h){if(d)g(d);else{l=h;var i=new Sa(f);i.fill(0),c.copy(i,0,e,e+f),b.position=f,l.size=f,l.version+=1,a.putBuffer(l.data,i,j)}}var l;a.getObject(b.id,k)}function m(a,b,c,e,f,g,h){function i(a){a?h(a):h(null,f)}function j(c){if(c)h(c);else{var e=Date.now();d(a,b.path,n,{mtime:e,ctime:e},i)}}function k(b){b?h(b):a.putObject(n.id,n,j)}function l(d,i){if(d)h(d);else{if(o=i,!o)return h(new Ma.EIO("Expected Buffer"));var j=void 0!==g&&null!==g?g:b.position,l=Math.max(o.length,j+f),m=new Sa(l);m.fill(0),o&&o.copy(m),c.copy(m,j,e,e+f),void 0===g&&(b.position+=f),n.size=l,n.version+=1,a.putBuffer(n.data,m,k)}}function m(b,c){b?h(b):(n=c,a.getBuffer(n.data,l))}var n,o;a.getObject(b.id,m)}function n(a,b,c,d,e,f,g){function h(a,h){if(a)g(a);else{if(k=h,!k)return g(new Ma.EIO("Expected Buffer"));var i=void 0!==f&&null!==f?f:b.position;e=i+e>c.length?e-i:e,k.copy(c,d,i,i+e),void 0===f&&(b.position+=e),g(null,e)}}function i(c,d){c?g(c):"DIRECTORY"===d.mode?g(new Ma.EISDIR("the named file is a directory",b.path)):(j=d,a.getBuffer(j.data,h))}var j,k;a.getObject(b.id,i)}function o(a,b,c){b=oa(b);qa(b);f(a,b,c)}function p(a,b,c){b.getNode(a,c)}function q(a,b,c){function d(b,d){b?c(b):(g=d,a.getObject(g.data,e))}function e(d,e){d?c(d):(h=e,ma(h).has(i)?a.getObject(h[i].id,c):c(new Ma.ENOENT("a component of the path does not name an existing file",b)))}b=oa(b);var g,h,i=qa(b),j=pa(b);ya==i?f(a,b,c):f(a,j,d)}function r(a,b,c,e){function g(b){b?e(b):d(a,c,t,{ctime:Date.now()},e)}function h(b,c){b?e(b):(t=c,t.nlinks+=1,a.putObject(t.id,t,g))}function i(b,c){b?e(b):a.getObject(s[u].id,h)}function j(b,c){b?e(b):(s=c,ma(s).has(u)?e(new Ma.EEXIST("newpath resolves to an existing file",u)):(s[u]=q[n],a.putObject(r.data,s,i)))}function k(b,c){b?e(b):(r=c,a.getObject(r.data,j))}function l(b,c){b?e(b):(q=c,ma(q).has(n)?"DIRECTORY"===q[n].type?e(new Ma.EPERM("oldpath refers to a directory")):f(a,v,k):e(new Ma.ENOENT("a component of either path prefix does not exist",n)))}function m(b,c){b?e(b):(p=c,a.getObject(p.data,l))}b=oa(b);var n=qa(b),o=pa(b);c=oa(c);var p,q,r,s,t,u=qa(c),v=pa(c);f(a,o,m)}function s(a,b,c){function e(b){b?c(b):(delete m[o],a.putObject(l.data,m,function(b){var e=Date.now();d(a,p,l,{mtime:e,ctime:e},c)}))}function g(b){b?c(b):a["delete"](n.data,e)}function h(f,h){f?c(f):(n=h,n.nlinks-=1,n.nlinks<1?a["delete"](n.id,g):a.putObject(n.id,n,function(c){d(a,b,n,{ctime:Date.now()},e)}))}function i(a,b){a?c(a):"DIRECTORY"===b.mode?c(new Ma.EPERM("unlink not permitted on directories",o)):h(null,b)}function j(b,d){b?c(b):(m=d,ma(m).has(o)?a.getObject(m[o].id,i):c(new Ma.ENOENT("a component of the path does not name an existing file",o)))}function k(b,d){b?c(b):(l=d,a.getObject(l.data,j))}b=oa(b);var l,m,n,o=qa(b),p=pa(b);f(a,p,k)}function t(a,b,c){function d(a,b){if(a)c(a);else{h=b;var d=Object.keys(h);c(null,d)}}function e(e,f){e?c(e):f.mode!==va?c(new Ma.ENOTDIR(null,b)):(g=f,a.getObject(g.data,d))}b=oa(b);var g,h;qa(b);f(a,b,e)}function u(a,b,c,e){function g(b,c){b?e(b):(l=c,a.getObject(l.data,h))}function h(a,b){a?e(a):(m=b,ma(m).has(o)?e(new Ma.EEXIST(null,o)):i())}function i(){Qa.create({guid:a.guid,mode:wa},function(c,d){return c?void e(c):(n=d,n.nlinks+=1,n.size=b.length,n.data=b,void a.putObject(n.id,n,k))})}function j(b){if(b)e(b);else{var c=Date.now();d(a,p,l,{mtime:c,ctime:c},e)}}function k(b){b?e(b):(m[o]=new Na(n.id,wa),a.putObject(l.data,m,j))}c=oa(c);var l,m,n,o=qa(c),p=pa(c);ya==o?e(new Ma.EEXIST(null,o)):f(a,p,g)}function v(a,b,c){function d(b,d){b?c(b):(h=d,a.getObject(h.data,e))}function e(b,d){b?c(b):(i=d,ma(i).has(j)?a.getObject(i[j].id,g):c(new Ma.ENOENT("a component of the path does not name an existing file",j)))}function g(a,d){a?c(a):d.mode!=wa?c(new Ma.EINVAL("path not a symbolic link",b)):c(null,d.data)}b=oa(b);var h,i,j=qa(b),k=pa(b);f(a,k,d)}function w(a,b,c,e){function g(c,d){c?e(c):d.mode==va?e(new Ma.EISDIR(null,b)):(k=d,a.getBuffer(k.data,h))}function h(b,d){if(b)e(b);else{if(!d)return e(new Ma.EIO("Expected Buffer"));var f=new Sa(c);f.fill(0),d&&d.copy(f),a.putBuffer(k.data,f,j)}}function i(c){if(c)e(c);else{var f=Date.now();d(a,b,k,{mtime:f,ctime:f},e)}}function j(b){b?e(b):(k.size=c,k.version+=1,a.putObject(k.id,k,i))}b=oa(b);var k;0>c?e(new Ma.EINVAL("length cannot be negative")):f(a,b,g)}function x(a,b,c,e){function f(b,c){b?e(b):c.mode==va?e(new Ma.EISDIR):(j=c,a.getBuffer(j.data,g))}function g(b,d){if(b)e(b);else{var f;if(!d)return e(new Ma.EIO("Expected Buffer"));d?f=d.slice(0,c):(f=new Sa(c),f.fill(0)),a.putBuffer(j.data,f,i)}}function h(c){if(c)e(c);else{var f=Date.now();d(a,b.path,j,{mtime:f,ctime:f},e)}}function i(b){b?e(b):(j.size=c,j.version+=1,a.putObject(j.id,j,h))}var j;0>c?e(new Ma.EINVAL("length cannot be negative")):b.getNode(a,f)}function y(a,b,c,e,g){function h(f,h){f?g(f):d(a,b,h,{atime:c,ctime:e,mtime:e},g)}b=oa(b),"number"!=typeof c||"number"!=typeof e?g(new Ma.EINVAL("atime and mtime must be number",b)):0>c||0>e?g(new Ma.EINVAL("atime and mtime must be positive integers",b)):f(a,b,h)}function z(a,b,c,e,f){function g(g,h){g?f(g):d(a,b.path,h,{atime:c,ctime:e,mtime:e},f)}"number"!=typeof c||"number"!=typeof e?f(new Ma.EINVAL("atime and mtime must be a number")):0>c||0>e?f(new Ma.EINVAL("atime and mtime must be positive integers")):b.getNode(a,g)}function A(a,b,c,d,e,h){function i(f,i){return f?h(f):void g(a,b,i,c,d,e,h)}b=oa(b),"string"!=typeof c?h(new Ma.EINVAL("attribute name must be a string",b)):c?null!==e&&e!==Ha&&e!==Ia?h(new Ma.EINVAL("invalid flag, must be null, XATTR_CREATE or XATTR_REPLACE",b)):f(a,b,i):h(new Ma.EINVAL("attribute name cannot be an empty string",b))}function B(a,b,c,d,e,f){function h(h,i){return h?f(h):void g(a,b.path,i,c,d,e,f)}"string"!=typeof c?f(new Ma.EINVAL("attribute name must be a string")):c?null!==e&&e!==Ha&&e!==Ia?f(new Ma.EINVAL("invalid flag, must be null, XATTR_CREATE or XATTR_REPLACE")):b.getNode(a,h):f(new Ma.EINVAL("attribute name cannot be an empty string"))}function C(a,b,c,d){function e(a,e){if(a)return d(a);var f=e.xattrs;f.hasOwnProperty(c)?d(null,f[c]):d(new Ma.ENOATTR(null,b))}b=oa(b),"string"!=typeof c?d(new Ma.EINVAL("attribute name must be a string",b)):c?f(a,b,e):d(new Ma.EINVAL("attribute name cannot be an empty string",b))}function D(a,b,c,d){function e(a,b){if(a)return d(a);var e=b.xattrs;e.hasOwnProperty(c)?d(null,e[c]):d(new Ma.ENOATTR)}"string"!=typeof c?d(new Ma.EINVAL):c?b.getNode(a,e):d(new Ma.EINVAL("attribute name cannot be an empty string"))}function E(a,b,c,e){function g(f,g){function h(c){c?e(c):d(a,b,g,{ctime:Date.now()},e)}if(f)return e(f);var i=g.xattrs;i.hasOwnProperty(c)?(delete i[c],a.putObject(g.id,g,h)):e(new Ma.ENOATTR(null,b))}b=oa(b),"string"!=typeof c?e(new Ma.EINVAL("attribute name must be a string",b)):c?f(a,b,g):e(new Ma.EINVAL("attribute name cannot be an empty string",b))}function F(a,b,c,e){function f(f,g){function h(c){c?e(c):d(a,b.path,g,{ctime:Date.now()},e)}if(f)return e(f);var i=g.xattrs;i.hasOwnProperty(c)?(delete i[c],a.putObject(g.id,g,h)):e(new Ma.ENOATTR)}"string"!=typeof c?e(new Ma.EINVAL("attribute name must be a string")):c?b.getNode(a,f):e(new Ma.EINVAL("attribute name cannot be an empty string"))}function G(a){return ma(Ga).has(a)?Ga[a]:null}function H(a,b,c){return a?"function"==typeof a?a={encoding:b,flag:c}:"string"==typeof a&&(a={encoding:a,flag:c}):a={encoding:b,flag:c},a}function I(a,b){var c;return a?sa(a)?c=new Ma.EINVAL("Path must be a string without null bytes.",a):ra(a)||(c=new Ma.EINVAL("Path must be absolute.",a)):c=new Ma.EINVAL("Path must be a string",a),c?(b(c),!1):!0}function J(a,b,c,d,e,f){function g(b,e){if(b)f(b);else{var g;g=ma(d).contains(Fa)?e.size:0;var h=new Oa(c,e.id,d,g),i=a.allocDescriptor(h);f(null,i)}}f=arguments[arguments.length-1],I(c,f)&&(d=G(d),d||f(new Ma.EINVAL("flags is not valid"),c),k(b,c,d,g))}function K(a,b,c,d){ma(a.openFiles).has(c)?(a.releaseDescriptor(c),d(null)):d(new Ma.EBADF)}function L(a,b,c,d,f){I(c,f)&&e(b,c,d,f)}function M(a,b,c,d,e){e=arguments[arguments.length-1],I(c,e)&&i(b,c,e)}function N(a,b,c,d){I(c,d)&&j(b,c,d)}function O(a,b,c,d){function e(b,c){if(b)d(b);else{var e=new Ra(c,a.name);d(null,e)}}I(c,d)&&o(b,c,e)}function P(a,b,c,d){function e(b,c){if(b)d(b);else{var e=new Ra(c,a.name);d(null,e)}}var f=a.openFiles[c];f?p(b,f,e):d(new Ma.EBADF)}function Q(a,b,c,d,e){I(c,e)&&I(d,e)&&r(b,c,d,e)}function R(a,b,c,d){I(c,d)&&s(b,c,d)}function S(a,b,c,d,e,f,g,h){function i(a,b){h(a,b||0,d)}e=void 0===e?0:e,f=void 0===f?d.length-e:f,h=arguments[arguments.length-1];var j=a.openFiles[c];j?ma(j.flags).contains(Ba)?n(b,j,d,e,f,g,i):h(new Ma.EBADF("descriptor does not permit reading")):h(new Ma.EBADF)}function T(a,b,c,d,e){if(e=arguments[arguments.length-1],d=H(d,null,"r"),I(c,e)){var f=G(d.flag||"r");return f?void k(b,c,f,function(g,h){function i(){a.releaseDescriptor(k)}if(g)return e(g);var j=new Oa(c,h.id,f,0),k=a.allocDescriptor(j);p(b,j,function(f,g){if(f)return i(),e(f);var h=new Ra(g,a.name);if(h.isDirectory())return i(),e(new Ma.EISDIR("illegal operation on directory",c));var k=h.size,l=new Sa(k);l.fill(0),n(b,j,l,0,k,0,function(a,b){if(i(),a)return e(a);var c;c="utf8"===d.encoding?La.decode(l):l,e(null,c)})})}):e(new Ma.EINVAL("flags is not valid",c))}}function U(a,b,c,d,e,f,g,h){h=arguments[arguments.length-1],e=void 0===e?0:e,f=void 0===f?d.length-e:f;var i=a.openFiles[c];i?ma(i.flags).contains(Ca)?d.length-e<f?h(new Ma.EIO("intput buffer is too small")):m(b,i,d,e,f,g,h):h(new Ma.EBADF("descriptor does not permit writing")):h(new Ma.EBADF)}function V(a,b,c,d,e,f){if(f=arguments[arguments.length-1],e=H(e,"utf8","w"),I(c,f)){var g=G(e.flag||"w");if(!g)return f(new Ma.EINVAL("flags is not valid",c));d=d||"","number"==typeof d&&(d=""+d),"string"==typeof d&&"utf8"===e.encoding&&(d=La.encode(d)),k(b,c,g,function(e,h){if(e)return f(e);var i=new Oa(c,h.id,g,0),j=a.allocDescriptor(i);l(b,i,d,0,d.length,function(b,c){return a.releaseDescriptor(j),b?f(b):void f(null)})})}}function W(a,b,c,d,e,f){if(f=arguments[arguments.length-1],e=H(e,"utf8","a"),I(c,f)){var g=G(e.flag||"a");if(!g)return f(new Ma.EINVAL("flags is not valid",c));d=d||"","number"==typeof d&&(d=""+d),"string"==typeof d&&"utf8"===e.encoding&&(d=La.encode(d)),k(b,c,g,function(e,h){if(e)return f(e);var i=new Oa(c,h.id,g,h.size),j=a.allocDescriptor(i);m(b,i,d,0,d.length,i.position,function(b,c){return a.releaseDescriptor(j),b?f(b):void f(null)})})}}function X(a,b,c,d){function e(a,b){d(a?!1:!0)}O(a,b,c,e)}function Y(a,b,c,d,e){I(c,e)&&C(b,c,d,e)}function Z(a,b,c,d,e){var f=a.openFiles[c];f?D(b,f,d,e):e(new Ma.EBADF)}function $(a,b,c,d,e,f,g){"function"==typeof f&&(g=f,f=null),I(c,g)&&A(b,c,d,e,f,g)}function _(a,b,c,d,e,f,g){"function"==typeof f&&(g=f,f=null);var h=a.openFiles[c];h?ma(h.flags).contains(Ca)?B(b,h,d,e,f,g):g(new Ma.EBADF("descriptor does not permit writing")):g(new Ma.EBADF)}function aa(a,b,c,d,e){I(c,e)&&E(b,c,d,e)}function ba(a,b,c,d,e){var f=a.openFiles[c];f?ma(f.flags).contains(Ca)?F(b,f,d,e):e(new Ma.EBADF("descriptor does not permit writing")):e(new Ma.EBADF)}function ca(a,b,c,d,e,f){function g(a,b){a?f(a):b.size+d<0?f(new Ma.EINVAL("resulting file offset would be negative")):(h.position=b.size+d,f(null,h.position))}var h=a.openFiles[c];h||f(new Ma.EBADF),"SET"===e?0>d?f(new Ma.EINVAL("resulting file offset would be negative")):(h.position=d,f(null,h.position)):"CUR"===e?h.position+d<0?f(new Ma.EINVAL("resulting file offset would be negative")):(h.position+=d,f(null,h.position)):"END"===e?p(b,h,g):f(new Ma.EINVAL("whence argument is not a proper value"))}function da(a,b,c,d){I(c,d)&&t(b,c,d)}function ea(a,b,c,d,e,f){if(I(c,f)){var g=Date.now();d=d?d:g,e=e?e:g,y(b,c,d,e,f)}}function fa(a,b,c,d,e,f){var g=Date.now();d=d?d:g,e=e?e:g;var h=a.openFiles[c];h?ma(h.flags).contains(Ca)?z(b,h,d,e,f):f(new Ma.EBADF("descriptor does not permit writing")):f(new Ma.EBADF)}function ga(a,b,c,e,g){function h(a,c){a?g(a):d(b,e,c,{ctime:Date.now()},g)}function i(a){a?g(a):b.getObject(x[B].id,h)}function k(a){a?g(a):(u.id===w.id&&(v=x),delete v[A],b.putObject(u.data,v,i))}function l(a){a?g(a):(x[B]=v[A],b.putObject(w.data,x,k))}function m(a,c){a?g(a):(x=c,ma(x).has(B)?j(b,e,l):l())}function n(a,c){a?g(a):(w=c,b.getObject(w.data,m))}function o(a,c){a?g(a):(v=c,f(b,z,n))}function p(a,c){a?g(a):(u=c,b.getObject(c.data,o))}function q(a){a?g(a):s(b,c,g)}function t(a,d){a?g(a):"DIRECTORY"===d.mode?f(b,y,p):r(b,c,e,q)}if(I(c,g)&&I(e,g)){c=oa(c),e=oa(e);var u,v,w,x,y=na.dirname(c),z=na.dirname(c),A=na.basename(c),B=na.basename(e);f(b,c,t)}}function ha(a,b,c,d,e,f){f=arguments[arguments.length-1],I(c,f)&&I(d,f)&&u(b,c,d,f)}function ia(a,b,c,d){I(c,d)&&v(b,c,d)}function ja(a,b,c,d){function e(b,c){if(b)d(b);else{var e=new Ra(c,a.name);d(null,e)}}I(c,d)&&q(b,c,e)}function ka(a,b,c,d,e){e=arguments[arguments.length-1],d=d||0,I(c,e)&&w(b,c,d,e)}function la(a,b,c,d,e){e=arguments[arguments.length-1],d=d||0;var f=a.openFiles[c];f?ma(f.flags).contains(Ca)?x(b,f,d,e):e(new Ma.EBADF("descriptor does not permit writing")):e(new Ma.EBADF)}var ma=a("../../lib/nodash.js"),na=a("../path.js"),oa=na.normalize,pa=na.dirname,qa=na.basename,ra=na.isAbsolute,sa=na.isNull,ta=a("../constants.js"),ua=ta.MODE_FILE,va=ta.MODE_DIRECTORY,wa=ta.MODE_SYMBOLIC_LINK,xa=ta.MODE_META,ya=ta.ROOT_DIRECTORY_NAME,za=ta.SUPER_NODE_ID,Aa=ta.SYMLOOP_MAX,Ba=ta.O_READ,Ca=ta.O_WRITE,Da=ta.O_CREATE,Ea=ta.O_EXCLUSIVE,Fa=(ta.O_TRUNCATE,
ta.O_APPEND),Ga=ta.O_FLAGS,Ha=ta.XATTR_CREATE,Ia=ta.XATTR_REPLACE,Ja=ta.FS_NOMTIME,Ka=ta.FS_NOCTIME,La=a("../encoding.js"),Ma=a("../errors.js"),Na=a("../directory-entry.js"),Oa=a("../open-file-description.js"),Pa=a("../super-node.js"),Qa=a("../node.js"),Ra=a("../stats.js"),Sa=a("../buffer.js");b.exports={ensureRootDirectory:h,open:J,close:K,mknod:L,mkdir:M,rmdir:N,unlink:R,stat:O,fstat:P,link:Q,read:S,readFile:T,write:U,writeFile:V,appendFile:W,exists:X,getxattr:Y,fgetxattr:Z,setxattr:$,fsetxattr:_,removexattr:aa,fremovexattr:ba,lseek:ca,readdir:da,utimes:ea,futimes:fa,rename:ga,symlink:ha,readlink:ia,lstat:ja,truncate:ka,ftruncate:la}},{"../../lib/nodash.js":4,"../buffer.js":14,"../constants.js":15,"../directory-entry.js":16,"../encoding.js":17,"../errors.js":18,"../node.js":23,"../open-file-description.js":24,"../path.js":25,"../stats.js":33,"../super-node.js":34}],20:[function(a,b,c){function d(a){return"function"==typeof a?a:function(a){if(a)throw a}}function e(a){a&&console.error("Filer error: ",a)}function f(a,b){function c(){I.forEach(function(a){a.call(this)}.bind(F)),I=null}function d(a){return function(b){function c(b){var d=B();a.getObject(d,function(a,e){return a?void b(a):void(e?c(b):b(null,d))})}return g(j).contains(p)?void b(null,B()):void c(b)}}function f(a){if(a.length){var b=s.getInstance();a.forEach(function(a){b.emit(a.event,a.path)})}}a=a||{},b=b||e;var j=a.flags,B=a.guid?a.guid:v,C=a.provider||new q.Default(a.name||k),D=a.name||C.name,E=g(j).contains(l),F=this;F.readyState=n,F.name=D,F.error=null,F.stdin=w,F.stdout=x,F.stderr=y,this.Shell=r.bind(void 0,this);var G={},H=z;Object.defineProperty(this,"openFiles",{get:function(){return G}}),this.allocDescriptor=function(a){var b=H++;return G[b]=a,b},this.releaseDescriptor=function(a){delete G[a]};var I=[];this.queueOrRun=function(a){var b;return m==F.readyState?a.call(F):o==F.readyState?b=new u.EFILESYSTEMERROR("unknown error"):I.push(a),b},this.watch=function(a,b,c){if(h(a))throw new Error("Path must be a string without null bytes.");"function"==typeof b&&(c=b,b={}),b=b||{},c=c||i;var d=new t;return d.start(a,!1,b.recursive),d.on("change",c),d},C.open(function(a){function e(a){function e(a){var b=C[a]();return b.flags=j,b.changes=[],b.guid=d(b),b.close=function(){var a=b.changes;f(a),a.length=0},b}F.provider={openReadWriteContext:function(){return e("getReadWriteContext")},openReadOnlyContext:function(){return e("getReadOnlyContext")}},a?F.readyState=o:F.readyState=m,c(),b(a,F)}if(a)return e(a);var g=C.getReadWriteContext();g.guid=d(g),E?g.clear(function(a){return a?e(a):void A.ensureRootDirectory(g,e)}):A.ensureRootDirectory(g,e)})}var g=a("../../lib/nodash.js"),h=a("../path.js").isNull,i=a("../shared.js").nop,j=a("../constants.js"),k=j.FILE_SYSTEM_NAME,l=j.FS_FORMAT,m=j.FS_READY,n=j.FS_PENDING,o=j.FS_ERROR,p=j.FS_NODUPEIDCHECK,q=a("../providers/index.js"),r=a("../shell/shell.js"),s=a("../../lib/intercom.js"),t=a("../fs-watcher.js"),u=a("../errors.js"),v=a("../shared.js").guid,w=j.STDIN,x=j.STDOUT,y=j.STDERR,z=j.FIRST_DESCRIPTOR,A=a("./implementation.js");f.providers=q,["open","close","mknod","mkdir","rmdir","stat","fstat","link","unlink","read","readFile","write","writeFile","appendFile","exists","lseek","readdir","rename","readlink","symlink","lstat","truncate","ftruncate","utimes","futimes","setxattr","getxattr","fsetxattr","fgetxattr","removexattr","fremovexattr"].forEach(function(a){f.prototype[a]=function(){var b=this,c=Array.prototype.slice.call(arguments,0),e=c.length-1,f="function"!=typeof c[e],g=d(c[e]),h=b.queueOrRun(function(){function d(){h.close(),g.apply(b,arguments)}var h=b.provider.openReadWriteContext();if(o===b.readyState){var i=new u.EFILESYSTEMERROR("filesystem unavailable, operation canceled");return g.call(b,i)}f?c.push(d):c[e]=d;var j=[b,h].concat(c);A[a].apply(null,j)});h&&g(h)}}),b.exports=f},{"../../lib/intercom.js":3,"../../lib/nodash.js":4,"../constants.js":15,"../errors.js":18,"../fs-watcher.js":21,"../path.js":25,"../providers/index.js":26,"../shared.js":30,"../shell/shell.js":32,"./implementation.js":19}],21:[function(a,b,c){function d(){function a(a){(c===a||h&&0===a.indexOf(b))&&d.trigger("change","change",a)}e.call(this);var b,c,d=this,h=!1;d.start=function(d,e,i){if(!c){if(f.isNull(d))throw new Error("Path must be a string without null bytes.");c=f.normalize(d),h=i===!0,h&&(b="/"===c?"/":c+"/");var j=g.getInstance();j.on("change",a)}},d.close=function(){var b=g.getInstance();b.off("change",a),d.removeAllListeners("change")}}var e=a("../lib/eventemitter.js"),f=a("./path.js"),g=a("../lib/intercom.js");d.prototype=new e,d.prototype.constructor=d,b.exports=d},{"../lib/eventemitter.js":2,"../lib/intercom.js":3,"./path.js":25}],22:[function(a,b,c){b.exports={FileSystem:a("./filesystem/interface.js"),Buffer:a("./buffer.js"),Path:a("./path.js"),Errors:a("./errors.js"),Shell:a("./shell/shell.js")}},{"./buffer.js":14,"./errors.js":18,"./filesystem/interface.js":20,"./path.js":25,"./shell/shell.js":32}],23:[function(a,b,c){function d(a){var b=Date.now();this.id=a.id,this.mode=a.mode||f,this.size=a.size||0,this.atime=a.atime||b,this.ctime=a.ctime||b,this.mtime=a.mtime||b,this.flags=a.flags||[],this.xattrs=a.xattrs||{},this.nlinks=a.nlinks||0,this.version=a.version||0,this.blksize=void 0,this.nblocks=1,this.data=a.data}function e(a,b,c){a[b]?c(null):a.guid(function(d,e){a[b]=e,c(d)})}var f=a("./constants.js").MODE_FILE;d.create=function(a,b){e(a,"id",function(c){return c?void b(c):void e(a,"data",function(c){return c?void b(c):void b(null,new d(a))})})},b.exports=d},{"./constants.js":15}],24:[function(a,b,c){function d(a,b,c,d){this.path=a,this.id=b,this.flags=c,this.position=d}var e=a("./errors.js");d.prototype.getNode=function(a,b){function c(a,c){return a?b(a):c?void b(null,c):b(new e.EBADF("file descriptor refers to unknown node",f))}var d=this.id,f=this.path;a.getObject(d,c)},b.exports=d},{"./errors.js":18}],25:[function(a,b,c){function d(a,b){for(var c=0,d=a.length-1;d>=0;d--){var e=a[d];"."===e?a.splice(d,1):".."===e?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c--;c)a.unshift("..");return a}function e(){for(var a="",b=!1,c=arguments.length-1;c>=-1&&!b;c--){var e=c>=0?arguments[c]:"/";"string"==typeof e&&e&&(a=e+"/"+a,b="/"===e.charAt(0))}return a=d(a.split("/").filter(function(a){return!!a}),!b).join("/"),(b?"/":"")+a||"."}function f(a){var b="/"===a.charAt(0);"/"===a.substr(-1);return a=d(a.split("/").filter(function(a){return!!a}),!b).join("/"),a||b||(a="."),(b?"/":"")+a}function g(){var a=Array.prototype.slice.call(arguments,0);return f(a.filter(function(a,b){return a&&"string"==typeof a}).join("/"))}function h(a,b){function c(a){for(var b=0;b<a.length&&""===a[b];b++);for(var c=a.length-1;c>=0&&""===a[c];c--);return b>c?[]:a.slice(b,c-b+1)}a=e(a).substr(1),b=e(b).substr(1);for(var d=c(a.split("/")),f=c(b.split("/")),g=Math.min(d.length,f.length),h=g,i=0;g>i;i++)if(d[i]!==f[i]){h=i;break}for(var j=[],i=h;i<d.length;i++)j.push("..");return j=j.concat(f.slice(h)),j.join("/")}function i(a){var b=q(a),c=b[0],d=b[1];return c||d?(d&&(d=d.substr(0,d.length-1)),c+d):"."}function j(a,b){var c=q(a)[2];return b&&c.substr(-1*b.length)===b&&(c=c.substr(0,c.length-b.length)),""===c?"/":c}function k(a){return q(a)[3]}function l(a){return"/"===a.charAt(0)?!0:!1}function m(a){return-1!==(""+a).indexOf("\x00")?!0:!1}function n(a){return a.replace(/\/*$/,"/")}function o(a){return a=a.replace(/\/*$/,""),""===a?"/":a}var p=/^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/,q=function(a){var b=p.exec(a);return[b[1]||"",b[2]||"",b[3]||"",b[4]||""]};b.exports={normalize:f,resolve:e,join:g,relative:h,sep:"/",delimiter:":",dirname:i,basename:j,extname:k,isAbsolute:l,isNull:m,addTrailing:n,removeTrailing:o}},{}],26:[function(a,b,c){var d=a("./indexeddb.js"),e=a("./websql.js"),f=a("./memory.js");b.exports={IndexedDB:d,WebSQL:e,Memory:f,Default:d,Fallback:function(){function a(){throw"[Filer Error] Your browser doesn't support IndexedDB or WebSQL."}return d.isSupported()?d:e.isSupported()?e:(a.isSupported=function(){return!1},a)}()}},{"./indexeddb.js":27,"./memory.js":28,"./websql.js":29}],27:[function(a,b,c){(function(c,d){function e(a,b){var c=a.transaction(j,b);this.objectStore=c.objectStore(j)}function f(a,b,c){try{var d=a.get(b);d.onsuccess=function(a){var b=a.target.result;c(null,b)},d.onerror=function(a){c(a)}}catch(e){c(e)}}function g(a,b,c,d){try{var e=a.put(c,b);e.onsuccess=function(a){var b=a.target.result;d(null,b)},e.onerror=function(a){d(a)}}catch(f){d(f)}}function h(a){this.name=a||i,this.db=null}var i=a("../constants.js").FILE_SYSTEM_NAME,j=a("../constants.js").FILE_STORE_NAME,k=a("../constants.js").IDB_RW,l=(a("../constants.js").IDB_RO,a("../errors.js")),m=a("../buffer.js"),n=c.indexedDB||c.mozIndexedDB||c.webkitIndexedDB||c.msIndexedDB;e.prototype.clear=function(a){try{var b=this.objectStore.clear();b.onsuccess=function(b){a()},b.onerror=function(b){a(b)}}catch(c){a(c)}},e.prototype.getObject=function(a,b){f(this.objectStore,a,b)},e.prototype.getBuffer=function(a,b){f(this.objectStore,a,function(a,c){return a?b(a):void b(null,new m(c))})},e.prototype.putObject=function(a,b,c){g(this.objectStore,a,b,c)},e.prototype.putBuffer=function(a,b,c){var e;e=d._useTypedArrays?b.buffer:b.toArrayBuffer(),g(this.objectStore,a,e,c)},e.prototype["delete"]=function(a,b){try{var c=this.objectStore["delete"](a);c.onsuccess=function(a){var c=a.target.result;b(null,c)},c.onerror=function(a){b(a)}}catch(d){b(d)}},h.isSupported=function(){return!!n},h.prototype.open=function(a){var b=this;if(b.db)return a();var c=n.open(b.name);c.onupgradeneeded=function(a){var b=a.target.result;b.objectStoreNames.contains(j)&&b.deleteObjectStore(j),b.createObjectStore(j)},c.onsuccess=function(c){b.db=c.target.result,a()},c.onerror=function(b){a(new l.EINVAL("IndexedDB cannot be accessed. If private browsing is enabled, disable it."))}},h.prototype.getReadOnlyContext=function(){return new e(this.db,k)},h.prototype.getReadWriteContext=function(){return new e(this.db,k)},b.exports=h}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},a("buffer").Buffer)},{"../buffer.js":14,"../constants.js":15,"../errors.js":18,buffer:6}],28:[function(a,b,c){function d(a,b){this.readOnly=b,this.objectStore=a}function e(a){this.name=a||f}var f=a("../constants.js").FILE_SYSTEM_NAME,g=a("../../lib/async.js").setImmediate,h=function(){var a={};return function(b){return a.hasOwnProperty(b)||(a[b]={}),a[b]}}();d.prototype.clear=function(a){if(this.readOnly)return void g(function(){a("[MemoryContext] Error: write operation on read only context")});var b=this.objectStore;Object.keys(b).forEach(function(a){delete b[a]}),g(a)},d.prototype.getObject=d.prototype.getBuffer=function(a,b){var c=this;g(function(){b(null,c.objectStore[a])})},d.prototype.putObject=d.prototype.putBuffer=function(a,b,c){return this.readOnly?void g(function(){c("[MemoryContext] Error: write operation on read only context")}):(this.objectStore[a]=b,void g(c))},d.prototype["delete"]=function(a,b){return this.readOnly?void g(function(){b("[MemoryContext] Error: write operation on read only context")}):(delete this.objectStore[a],void g(b))},e.isSupported=function(){return!0},e.prototype.open=function(a){this.db=h(this.name),g(a)},e.prototype.getReadOnlyContext=function(){return new d(this.db,!0)},e.prototype.getReadWriteContext=function(){return new d(this.db,!1)},b.exports=e},{"../../lib/async.js":1,"../constants.js":15}],29:[function(a,b,c){(function(c){function d(a,b){var c=this;this.getTransaction=function(d){return c.transaction?void d(c.transaction):void a[b?"readTransaction":"transaction"](function(a){c.transaction=a,d(a)})}}function e(a,b,c){function d(a,b){var d=0===b.rows.length?null:b.rows.item(0).data;c(null,d)}function e(a,b){c(b)}a(function(a){a.executeSql("SELECT data FROM "+i+" WHERE id = ? LIMIT 1;",[b],d,e)})}function f(a,b,c,d){function e(a,b){d(null)}function f(a,b){d(b)}a(function(a){a.executeSql("INSERT OR REPLACE INTO "+i+" (id, data) VALUES (?, ?);",[b,c],e,f)})}function g(a){this.name=a||h,this.db=null}var h=a("../constants.js").FILE_SYSTEM_NAME,i=a("../constants.js").FILE_STORE_NAME,j=a("../constants.js").WSQL_VERSION,k=a("../constants.js").WSQL_SIZE,l=a("../constants.js").WSQL_DESC,m=a("../errors.js"),n=a("../buffer.js"),o=a("base64-arraybuffer");d.prototype.clear=function(a){function b(b,c){a(c)}function c(b,c){a(null)}this.getTransaction(function(a){a.executeSql("DELETE FROM "+i+";",[],c,b)})},d.prototype.getObject=function(a,b){e(this.getTransaction,a,function(a,c){if(a)return b(a);try{c&&(c=JSON.parse(c))}catch(d){return b(d)}b(null,c)})},d.prototype.getBuffer=function(a,b){e(this.getTransaction,a,function(a,c){if(a)return b(a);if(c||""===c){var d=o.decode(c);c=new n(d)}b(null,c)})},d.prototype.putObject=function(a,b,c){var d=JSON.stringify(b);f(this.getTransaction,a,d,c)},d.prototype.putBuffer=function(a,b,c){var d=o.encode(b.buffer);f(this.getTransaction,a,d,c)},d.prototype["delete"]=function(a,b){function c(a,c){b(null)}function d(a,c){b(c)}this.getTransaction(function(b){b.executeSql("DELETE FROM "+i+" WHERE id = ?;",[a],c,d)})},g.isSupported=function(){return!!c.openDatabase},g.prototype.open=function(a){function b(b,c){5===c.code&&a(new m.EINVAL("WebSQL cannot be accessed. If private browsing is enabled, disable it.")),a(c)}function d(b,c){e.db=f,a()}var e=this;if(e.db)return a();var f=c.openDatabase(e.name,j,l,k);return f?void f.transaction(function(a){function c(a){a.executeSql("CREATE INDEX IF NOT EXISTS idx_"+i+"_id on "+i+" (id);",[],d,b)}a.executeSql("CREATE TABLE IF NOT EXISTS "+i+" (id unique, data TEXT);",[],c,b)}):void a("[WebSQL] Unable to open database.")},g.prototype.getReadOnlyContext=function(){return new d(this.db,!0)},g.prototype.getReadWriteContext=function(){return new d(this.db,!1)},b.exports=g}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"../buffer.js":14,"../constants.js":15,"../errors.js":18,"base64-arraybuffer":5}],30:[function(a,b,c){function d(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:3&b|8;return c.toString(16)}).toUpperCase()}function e(){}function f(a){for(var b=[],c=a.length,d=0;c>d;d++)b[d]=a[d];return b}b.exports={guid:d,u8toArray:f,nop:e}},{}],31:[function(a,b,c){var d=a("../constants.js").ENVIRONMENT;b.exports=function(a){a=a||{},a.TMP=a.TMP||d.TMP,a.PATH=a.PATH||d.PATH,this.get=function(b){return a[b]},this.set=function(b,c){a[b]=c}}},{"../constants.js":15}],32:[function(a,b,c){function d(a,b){b=b||{};var c=new g(b.env),d="/";Object.defineProperty(this,"fs",{get:function(){return a},enumerable:!0}),Object.defineProperty(this,"env",{get:function(){return c},enumerable:!0}),this.cd=function(b,c){b=e.resolve(d,b),a.stat(b,function(a,e){return a?void c(new f.ENOTDIR(null,b)):void("DIRECTORY"===e.type?(d=b,c()):c(new f.ENOTDIR(null,b)))})},this.pwd=function(){return d}}var e=a("../path.js"),f=a("../errors.js"),g=a("./environment.js"),h=a("../../lib/async.js"),i=(a("../encoding.js"),a("minimatch"));d.prototype.exec=function(a,b,c){var d=this,f=d.fs;"function"==typeof b&&(c=b,b=[]),b=b||[],c=c||function(){},a=e.resolve(d.pwd(),a),f.readFile(a,"utf8",function(a,d){if(a)return void c(a);try{var e=new Function("fs","args","callback",d);e(f,b,c)}catch(g){c(g)}})},d.prototype.touch=function(a,b,c){function d(a){h.writeFile(a,"",c)}function f(a){var d=Date.now(),e=b.date||d,f=b.date||d;h.utimes(a,e,f,c)}var g=this,h=g.fs;"function"==typeof b&&(c=b,b={}),b=b||{},c=c||function(){},a=e.resolve(g.pwd(),a),h.stat(a,function(e,g){e?b.updateOnly===!0?c():d(a):f(a)})},d.prototype.cat=function(a,b){function c(a,b){var c=e.resolve(d.pwd(),a);g.readFile(c,"utf8",function(a,c){return a?void b(a):(i+=c+"\n",void b())})}var d=this,g=d.fs,i="";return b=b||function(){},a?(a="string"==typeof a?[a]:a,void h.eachSeries(a,c,function(a){a?b(a):b(null,i.replace(/\n$/,""))})):void b(new f.EINVAL("Missing files argument"))},d.prototype.ls=function(a,b,c){function d(a,c){var f=e.resolve(g.pwd(),a),j=[];i.readdir(f,function(a,g){function k(a,c){a=e.join(f,a),i.stat(a,function(g,h){if(g)return void c(g);var i={path:e.basename(a),links:h.nlinks,size:h.size,modified:h.mtime,type:h.type};b.recursive&&"DIRECTORY"===h.type?d(e.join(f,i.path),function(a,b){return a?void c(a):(i.contents=b,j.push(i),void c())}):(j.push(i),c())})}return a?void c(a):void h.eachSeries(g,k,function(a){c(a,j)})})}var g=this,i=g.fs;return"function"==typeof b&&(c=b,b={}),b=b||{},c=c||function(){},a?void d(a,c):void c(new f.EINVAL("Missing dir argument"))},d.prototype.rm=function(a,b,c){function d(a,c){a=e.resolve(g.pwd(),a),i.stat(a,function(g,j){return g?void c(g):"FILE"===j.type?void i.unlink(a,c):void i.readdir(a,function(g,j){return g?void c(g):0===j.length?void i.rmdir(a,c):b.recursive?(j=j.map(function(b){return e.join(a,b)}),void h.eachSeries(j,d,function(b){return b?void c(b):void i.rmdir(a,c)})):void c(new f.ENOTEMPTY(null,a))})})}var g=this,i=g.fs;return"function"==typeof b&&(c=b,b={}),b=b||{},c=c||function(){},a?void d(a,c):void c(new f.EINVAL("Missing path argument"))},d.prototype.tempDir=function(a){var b=this,c=b.fs,d=b.env.get("TMP");a=a||function(){},c.mkdir(d,function(b){a(null,d)})},d.prototype.mkdirp=function(a,b){function c(a,b){g.stat(a,function(d,h){if(h){if(h.isDirectory())return void b();if(h.isFile())return void b(new f.ENOTDIR(null,a))}else{if(d&&"ENOENT"!==d.code)return void b(d);var i=e.dirname(a);"/"===i?g.mkdir(a,function(a){return a&&"EEXIST"!=a.code?void b(a):void b()}):c(i,function(c){return c?b(c):void g.mkdir(a,function(a){return a&&"EEXIST"!=a.code?void b(a):void b()})})}})}var d=this,g=d.fs;return b=b||function(){},a?"/"===a?void b():void c(a,b):void b(new f.EINVAL("Missing path argument"))},d.prototype.find=function(a,b,c){function d(a,b){m(a,function(c){return c?void b(c):(n.push(a),void b())})}function g(a,c){var f=e.removeTrailing(a);return b.regex&&!b.regex.test(f)?void c():b.name&&!i(e.basename(f),b.name)?void c():b.path&&!i(e.dirname(f),b.path)?void c():void d(a,c)}function j(a,b){a=e.resolve(k.pwd(),a),l.readdir(a,function(c,d){return c?void("ENOTDIR"===c.code?g(a,b):b(c)):void g(e.addTrailing(a),function(c){return c?void b(c):(d=d.map(function(b){return e.join(a,b)}),void h.eachSeries(d,j,function(a){b(a,n)}))})})}var k=this,l=k.fs;"function"==typeof b&&(c=b,b={}),b=b||{},c=c||function(){};var m=b.exec||function(a,b){b()},n=[];return a?void l.stat(a,function(b,d){return b?void c(b):d.isDirectory()?void j(a,c):void c(new f.ENOTDIR(null,a))}):void c(new f.EINVAL("Missing path argument"))},b.exports=d},{"../../lib/async.js":1,"../encoding.js":17,"../errors.js":18,"../path.js":25,"./environment.js":31,minimatch:11}],33:[function(a,b,c){function d(a,b){this.node=a.id,this.dev=b,this.size=a.size,this.nlinks=a.nlinks,this.atime=a.atime,this.mtime=a.mtime,this.ctime=a.ctime,this.type=a.mode}var e=a("./constants.js");d.prototype.isFile=function(){return this.type===e.MODE_FILE},d.prototype.isDirectory=function(){return this.type===e.MODE_DIRECTORY},d.prototype.isSymbolicLink=function(){return this.type===e.MODE_SYMBOLIC_LINK},d.prototype.isSocket=d.prototype.isFIFO=d.prototype.isCharacterDevice=d.prototype.isBlockDevice=function(){return!1},b.exports=d},{"./constants.js":15}],34:[function(a,b,c){function d(a){var b=Date.now();this.id=e.SUPER_NODE_ID,this.mode=e.MODE_META,this.atime=a.atime||b,this.ctime=a.ctime||b,this.mtime=a.mtime||b,this.rnode=a.rnode}var e=a("./constants.js");d.create=function(a,b){a.guid(function(c,e){return c?void b(c):(a.rnode=a.rnode||e,void b(null,new d(a)))})},b.exports=d},{"./constants.js":15}]},{},[22])(22)});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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
        mtime       : null,
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
    mtime   = stat.mtime;
    
    file = {
        'name'  : stat.name,
        'size'  : format.size(size),
        'date'  : !mtime ? '' : shortdate(mtime),
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


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/lib/readify.js","/lib")
},{"_process":9,"buffer":4,"execon":5,"format-io":6,"fs":3,"nicki":undefined,"shortdate":10,"squad":11}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/base64-js/lib/b64.js","/node_modules/base64-js/lib")
},{"_process":9,"buffer":4}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/browserify/lib/_empty.js","/node_modules/browserify/lib")
},{"_process":9,"buffer":4}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/buffer/index.js","/node_modules/buffer")
},{"_process":9,"base64-js":2,"buffer":4,"ieee754":7,"is-array":8}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/execon/lib/exec.js","/node_modules/execon/lib")
},{"_process":9,"buffer":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/format-io/lib/format.js","/node_modules/format-io/lib")
},{"_process":9,"buffer":4}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/ieee754/index.js","/node_modules/ieee754")
},{"_process":9,"buffer":4}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/is-array/index.js","/node_modules/is-array")
},{"_process":9,"buffer":4}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/process/browser.js","/node_modules/process")
},{"_process":9,"buffer":4}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

module.exports = function(date) {
    date = date || new Date();
    
    check(date);
     
    var ret,
        day     = date.getDate(),
        month   = date.getMonth() + 1,
        year    = date.getFullYear();
        
    if (month <= 9)
        month   = '0' + month;
    
    if (day <= 9)
        day     = '0' + day;
    
    ret         = year + '.' + month + '.' + day;
    
    return ret;
};

function check(date) {
    var type = {}.toString.call(date);
    
    if (type && type !== '[object Date]')
        throw Error('date should be Date!');
 }


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/shortdate/lib/shortdate.js","/node_modules/shortdate/lib")
},{"_process":9,"buffer":4}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/squad/lib/squad.js","/node_modules/squad/lib")
},{"_process":9,"buffer":4}]},{},[1])(1)
});