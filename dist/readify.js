(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(){
  "use strict";

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})();

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

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

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
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

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
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

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
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
    case 'latin1':
    case 'binary':
    case 'base64':
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
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
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

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

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

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
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

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
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
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
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

function latin1Write (buf, string, offset, length) {
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
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
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

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

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

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
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
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

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
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

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
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

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
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
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
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
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
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
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
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
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
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
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
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

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

  for (var i = 0; i < length; ++i) {
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
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
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
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
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
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":2,"ieee754":37,"isarray":38}],5:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

module.exports = currify;

var tail = function tail(list) {
    return [].slice.call(list, 1);
};

function currify(fn) {
    check(fn);

    var args = tail(arguments);

    if (args.length >= fn.length) return fn.apply(undefined, _toConsumableArray(args));else return function () {
        return currify.apply(undefined, [fn].concat(_toConsumableArray(args), Array.prototype.slice.call(arguments)));
    };
}

function check(fn) {
    if (typeof fn !== 'function') throw Error('fn should be function!');
}
},{}],6:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.0.5
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function _reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise;
}

// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":41}],7:[function(require,module,exports){
(function (global){
"use strict";

/* global self, window, module, global, require */
module.exports = function () {

    "use strict";

    var globalObject = void 0;

    function isFunction(x) {
        return typeof x === "function";
    }

    // Seek the global object
    if (global !== undefined) {
        globalObject = global;
    } else if (window !== undefined && window.document) {
        globalObject = window;
    } else {
        globalObject = self;
    }

    // Test for any native promise implementation, and if that
    // implementation appears to conform to the specificaton.
    // This code mostly nicked from the es6-promise module polyfill
    // and then fooled with.
    var hasPromiseSupport = function () {

        // No promise object at all, and it's a non-starter
        if (!globalObject.hasOwnProperty("Promise")) {
            return false;
        }

        // There is a Promise object. Does it conform to the spec?
        var P = globalObject.Promise;

        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        if (!P.hasOwnProperty("resolve") || !P.hasOwnProperty("reject")) {
            return false;
        }

        if (!P.hasOwnProperty("all") || !P.hasOwnProperty("race")) {
            return false;
        }

        // Older version of the spec had a resolver object
        // as the arg rather than a function
        return function () {

            var resolve = void 0;

            var p = new globalObject.Promise(function (r) {
                resolve = r;
            });

            if (p) {
                return isFunction(resolve);
            }

            return false;
        }();
    }();

    // Export the native Promise implementation if it
    // looks like it matches the spec
    if (hasPromiseSupport) {
        return globalObject.Promise;
    }

    //  Otherwise, return the es6-promise polyfill by @jaffathecake.
    return require("es6-promise").Promise;
}();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"es6-promise":6}],8:[function(require,module,exports){
"use strict";

/* global module, require */
module.exports = function () {

    "use strict";

    // Get a promise object. This may be native, or it may be polyfilled

    var ES6Promise = require("./promise.js");

    /**
     * thatLooksLikeAPromiseToMe()
     *
     * Duck-types a promise.
     *
     * @param {object} o
     * @return {bool} True if this resembles a promise
     */
    function thatLooksLikeAPromiseToMe(o) {
        return o && typeof o.then === "function" && typeof o.catch === "function";
    }

    /**
     * promisify()
     *
     * Transforms callback-based function -- func(arg1, arg2 .. argN, callback) -- into
     * an ES6-compatible Promise. Promisify provides a default callback of the form (error, result)
     * and rejects when `error` is truthy. You can also supply settings object as the second argument.
     *
     * @param {function} original - The function to promisify
     * @param {object} settings - Settings object
     * @param {object} settings.thisArg - A `this` context to use. If not set, assume `settings` _is_ `thisArg`
     * @param {bool} settings.multiArgs - Should multiple arguments be returned as an array?
     * @return {function} A promisified version of `original`
     */
    return function promisify(original, settings) {

        return function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var returnMultipleArguments = settings && settings.multiArgs;

            var target = void 0;
            if (settings && settings.thisArg) {
                target = settings.thisArg;
            } else if (settings) {
                target = settings;
            }

            // Return the promisified function
            return new ES6Promise(function (resolve, reject) {

                // Append the callback bound to the context
                args.push(function callback(err) {

                    if (err) {
                        return reject(err);
                    }

                    for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                        values[_key2 - 1] = arguments[_key2];
                    }

                    if (false === !!returnMultipleArguments) {
                        return resolve(values[0]);
                    }

                    resolve(values);
                });

                // Call the function
                var response = original.apply(target, args);

                // If it looks like original already returns a promise,
                // then just resolve with that promise. Hopefully, the callback function we added will just be ignored.
                if (thatLooksLikeAPromiseToMe(response)) {
                    resolve(response);
                }
            });
        };
    };
}();
},{"./promise.js":7}],9:[function(require,module,exports){
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
                throw Error('funcs ' + ERROR);
            
            if (!callback)
                throw Error('callback ' + ERROR);
            
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

},{}],10:[function(require,module,exports){
(function (process){
/*global setImmediate: false, setTimeout: false, console: false */

/**
 * async.js shim, based on https://raw.github.com/caolan/async/master/lib/async.js Feb 18, 2014
 * Used under MIT - https://github.com/caolan/async/blob/master/LICENSE
 */

(function () {

    var async = {};

    // async.js functions used in Filer

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'))
},{"_process":41}],11:[function(require,module,exports){
// Based on https://github.com/diy/intercom.js/blob/master/lib/events.js
// Copyright 2012 DIY Co Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

function removeItem(item, array) {
  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i] === item) {
      array.splice(i, 1);
    }
  }
  return array;
}

var EventEmitter = function() {};

EventEmitter.createInterface = function(space) {
  var methods = {};

  methods.on = function(name, fn) {
    if (typeof this[space] === 'undefined') {
      this[space] = {};
    }
    if (!this[space].hasOwnProperty(name)) {
      this[space][name] = [];
    }
    this[space][name].push(fn);
  };

  methods.off = function(name, fn) {
    if (typeof this[space] === 'undefined') return;
    if (this[space].hasOwnProperty(name)) {
      removeItem(fn, this[space][name]);
    }
  };

  methods.trigger = function(name) {
    if (typeof this[space] !== 'undefined' && this[space].hasOwnProperty(name)) {
      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < this[space][name].length; i++) {
        this[space][name][i].apply(this[space][name][i], args);
      }
    }
  };

  methods.removeAllListeners = function(name) {
    if (typeof this[space] === 'undefined') return;
    var self = this;
    self[space][name].forEach(function(fn) {
      self.off(name, fn);
    });
  };

  return methods;
};

var pvt = EventEmitter.createInterface('_handlers');
EventEmitter.prototype._on = pvt.on;
EventEmitter.prototype._off = pvt.off;
EventEmitter.prototype._trigger = pvt.trigger;

var pub = EventEmitter.createInterface('handlers');
EventEmitter.prototype.on = function() {
  pub.on.apply(this, arguments);
  Array.prototype.unshift.call(arguments, 'on');
  this._trigger.apply(this, arguments);
};
EventEmitter.prototype.off = pub.off;
EventEmitter.prototype.trigger = pub.trigger;
EventEmitter.prototype.removeAllListeners = pub.removeAllListeners;

module.exports = EventEmitter;

},{}],12:[function(require,module,exports){
(function (global){
// Based on https://github.com/diy/intercom.js/blob/master/lib/intercom.js
// Copyright 2012 DIY Co Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

var EventEmitter = require('./eventemitter.js');
var guid = require('../src/shared.js').guid;

function throttle(delay, fn) {
  var last = 0;
  return function() {
    var now = Date.now();
    if (now - last > delay) {
      last = now;
      fn.apply(this, arguments);
    }
  };
}

function extend(a, b) {
  if (typeof a === 'undefined' || !a) { a = {}; }
  if (typeof b === 'object') {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
  }
  return a;
}

var localStorage = (function(window) {
  if (typeof window === 'undefined' ||
      typeof window.localStorage === 'undefined') {
    return {
      getItem : function() {},
      setItem : function() {},
      removeItem : function() {}
    };
  }
  return window.localStorage;
}(global));

function Intercom() {
  var self = this;
  var now = Date.now();

  this.origin         = guid();
  this.lastMessage    = now;
  this.receivedIDs    = {};
  this.previousValues = {};

  var storageHandler = function() {
    self._onStorageEvent.apply(self, arguments);
  };

  // If we're in node.js, skip event registration
  if (typeof document === 'undefined') {
    return;
  }

  if (document.attachEvent) {
    document.attachEvent('onstorage', storageHandler);
  } else {
    global.addEventListener('storage', storageHandler, false);
  }
}

Intercom.prototype._transaction = function(fn) {
  var TIMEOUT   = 1000;
  var WAIT      = 20;
  var self      = this;
  var executed  = false;
  var listening = false;
  var waitTimer = null;

  function lock() {
    if (executed) {
      return;
    }

    var now = Date.now();
    var activeLock = localStorage.getItem(INDEX_LOCK)|0;
    if (activeLock && now - activeLock < TIMEOUT) {
      if (!listening) {
        self._on('storage', lock);
        listening = true;
      }
      waitTimer = setTimeout(lock, WAIT);
      return;
    }
    executed = true;
    localStorage.setItem(INDEX_LOCK, now);

    fn();
    unlock();
  }

  function unlock() {
    if (listening) {
      self._off('storage', lock);
    }
    if (waitTimer) {
      clearTimeout(waitTimer);
    }
    localStorage.removeItem(INDEX_LOCK);
  }

  lock();
};

Intercom.prototype._cleanup_emit = throttle(100, function() {
  var self = this;

  self._transaction(function() {
    var now = Date.now();
    var threshold = now - THRESHOLD_TTL_EMIT;
    var changed = 0;
    var messages;

    try {
      messages = JSON.parse(localStorage.getItem(INDEX_EMIT) || '[]');
    } catch(e) {
      messages = [];
    }
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i].timestamp < threshold) {
        messages.splice(i, 1);
        changed++;
      }
    }
    if (changed > 0) {
      localStorage.setItem(INDEX_EMIT, JSON.stringify(messages));
    }
  });
});

Intercom.prototype._cleanup_once = throttle(100, function() {
  var self = this;

  self._transaction(function() {
    var timestamp, ttl, key;
    var table;
    var now  = Date.now();
    var changed = 0;

    try {
      table = JSON.parse(localStorage.getItem(INDEX_ONCE) || '{}');
    } catch(e) {
      table = {};
    }
    for (key in table) {
      if (self._once_expired(key, table)) {
        delete table[key];
        changed++;
      }
    }

    if (changed > 0) {
      localStorage.setItem(INDEX_ONCE, JSON.stringify(table));
    }
  });
});

Intercom.prototype._once_expired = function(key, table) {
  if (!table) {
    return true;
  }
  if (!table.hasOwnProperty(key)) {
    return true;
  }
  if (typeof table[key] !== 'object') {
    return true;
  }

  var ttl = table[key].ttl || THRESHOLD_TTL_ONCE;
  var now = Date.now();
  var timestamp = table[key].timestamp;
  return timestamp < now - ttl;
};

Intercom.prototype._localStorageChanged = function(event, field) {
  if (event && event.key) {
    return event.key === field;
  }

  var currentValue = localStorage.getItem(field);
  if (currentValue === this.previousValues[field]) {
    return false;
  }
  this.previousValues[field] = currentValue;
  return true;
};

Intercom.prototype._onStorageEvent = function(event) {
  event = event || global.event;
  var self = this;

  if (this._localStorageChanged(event, INDEX_EMIT)) {
    this._transaction(function() {
      var now = Date.now();
      var data = localStorage.getItem(INDEX_EMIT);
      var messages;

      try {
        messages = JSON.parse(data || '[]');
      } catch(e) {
        messages = [];
      }
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].origin === self.origin) continue;
        if (messages[i].timestamp < self.lastMessage) continue;
        if (messages[i].id) {
          if (self.receivedIDs.hasOwnProperty(messages[i].id)) continue;
          self.receivedIDs[messages[i].id] = true;
        }
        self.trigger(messages[i].name, messages[i].payload);
      }
      self.lastMessage = now;
    });
  }

  this._trigger('storage', event);
};

Intercom.prototype._emit = function(name, message, id) {
  id = (typeof id === 'string' || typeof id === 'number') ? String(id) : null;
  if (id && id.length) {
    if (this.receivedIDs.hasOwnProperty(id)) return;
    this.receivedIDs[id] = true;
  }

  var packet = {
    id        : id,
    name      : name,
    origin    : this.origin,
    timestamp : Date.now(),
    payload   : message
  };

  var self = this;
  this._transaction(function() {
    var data = localStorage.getItem(INDEX_EMIT) || '[]';
    var delimiter = (data === '[]') ? '' : ',';
    data = [data.substring(0, data.length - 1), delimiter, JSON.stringify(packet), ']'].join('');
    localStorage.setItem(INDEX_EMIT, data);
    self.trigger(name, message);

    setTimeout(function() {
      self._cleanup_emit();
    }, 50);
  });
};

Intercom.prototype.emit = function(name, message) {
  this._emit.apply(this, arguments);
  this._trigger('emit', name, message);
};

Intercom.prototype.once = function(key, fn, ttl) {
  if (!Intercom.supported) {
    return;
  }

  var self = this;
  this._transaction(function() {
    var data;
    try {
      data = JSON.parse(localStorage.getItem(INDEX_ONCE) || '{}');
    } catch(e) {
      data = {};
    }
    if (!self._once_expired(key, data)) {
      return;
    }

    data[key] = {};
    data[key].timestamp = Date.now();
    if (typeof ttl === 'number') {
      data[key].ttl = ttl * 1000;
    }

    localStorage.setItem(INDEX_ONCE, JSON.stringify(data));
    fn();

    setTimeout(function() {
      self._cleanup_once();
    }, 50);
  });
};

extend(Intercom.prototype, EventEmitter.prototype);

Intercom.supported = (typeof localStorage !== 'undefined');

var INDEX_EMIT = 'intercom';
var INDEX_ONCE = 'intercom_once';
var INDEX_LOCK = 'intercom_lock';

var THRESHOLD_TTL_EMIT = 50000;
var THRESHOLD_TTL_ONCE = 1000 * 3600;

Intercom.destroy = function() {
  localStorage.removeItem(INDEX_LOCK);
  localStorage.removeItem(INDEX_EMIT);
  localStorage.removeItem(INDEX_ONCE);
};

Intercom.getInstance = (function() {
  var intercom;
  return function() {
    if (!intercom) {
      intercom = new Intercom();
    }
    return intercom;
  };
})();

module.exports = Intercom;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../src/shared.js":31,"./eventemitter.js":11}],13:[function(require,module,exports){
// Cherry-picked bits of underscore.js, lodash.js

/**
 * Lo-Dash 2.4.0 <http://lodash.com/>
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var ArrayProto = Array.prototype;
var nativeForEach = ArrayProto.forEach;
var nativeIndexOf = ArrayProto.indexOf;
var nativeSome = ArrayProto.some;

var ObjProto = Object.prototype;
var hasOwnProperty = ObjProto.hasOwnProperty;
var nativeKeys = Object.keys;

var breaker = {};

function has(obj, key) {
  return hasOwnProperty.call(obj, key);
}

var keys = nativeKeys || function(obj) {
  if (obj !== Object(obj)) throw new TypeError('Invalid object');
  var keys = [];
  for (var key in obj) if (has(obj, key)) keys.push(key);
  return keys;
};

function size(obj) {
  if (obj == null) return 0;
  return (obj.length === +obj.length) ? obj.length : keys(obj).length;
}

function identity(value) {
  return value;
}

function each(obj, iterator, context) {
  var i, length;
  if (obj == null) return;
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (i = 0, length = obj.length; i < length; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  } else {
    var keys = keys(obj);
    for (i = 0, length = keys.length; i < length; i++) {
      if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
    }
  }
};

function any(obj, iterator, context) {
  iterator || (iterator = identity);
  var result = false;
  if (obj == null) return result;
  if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
  each(obj, function(value, index, list) {
    if (result || (result = iterator.call(context, value, index, list))) return breaker;
  });
  return !!result;
};

function contains(obj, target) {
  if (obj == null) return false;
  if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
  return any(obj, function(value) {
    return value === target;
  });
};

function Wrapped(value) {
  this.value = value;
}
Wrapped.prototype.has = function(key) {
  return has(this.value, key);
};
Wrapped.prototype.contains = function(target) {
  return contains(this.value, target);
};
Wrapped.prototype.size = function() {
  return size(this.value);
};

function nodash(value) {
  // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
  return (value && typeof value == 'object' && !Array.isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
    ? value
    : new Wrapped(value);
}

module.exports = nodash;

},{}],14:[function(require,module,exports){
(function (process){
;(function (require, exports, module, platform) {

if (module) module.exports = minimatch
else exports.minimatch = minimatch

if (!require) {
  require = function (id) {
    switch (id) {
      case "sigmund": return function sigmund (obj) {
        return JSON.stringify(obj)
      }
      case "path": return { basename: function (f) {
        f = f.split(/[\/\\]/)
        var e = f.pop()
        if (!e) e = f.pop()
        return e
      }}
      case "lru-cache": return function LRUCache () {
        // not quite an LRU, but still space-limited.
        var cache = {}
        var cnt = 0
        this.set = function (k, v) {
          cnt ++
          if (cnt >= 100) cache = {}
          cache[k] = v
        }
        this.get = function (k) { return cache[k] }
      }
    }
  }
}

minimatch.Minimatch = Minimatch

var LRU = require("lru-cache")
  , cache = minimatch.cache = new LRU({max: 100})
  , GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
  , sigmund = require("sigmund")

var path = require("path")
  // any single thing other than /
  // don't need to escape / when using new RegExp()
  , qmark = "[^/]"

  // * => any number of characters
  , star = qmark + "*?"

  // ** when dots are allowed.  Anything goes, except .. and .
  // not (^ or / followed by one or two dots followed by $ or /),
  // followed by anything, any number of times.
  , twoStarDot = "(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?"

  // not a ^ or / followed by a dot,
  // followed by anything, any number of times.
  , twoStarNoDot = "(?:(?!(?:\\\/|^)\\.).)*?"

  // characters that need to be escaped in RegExp.
  , reSpecials = charSet("().*{}+?[]^$\\!")

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split("").reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}


function minimatch (p, pattern, options) {
  if (typeof pattern !== "string") {
    throw new TypeError("glob pattern string required")
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === "#") {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === "") return p === ""

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options, cache)
  }

  if (typeof pattern !== "string") {
    throw new TypeError("glob pattern string required")
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows: need to use /, not \
  // On other platforms, \ is a valid (albeit bad) filename char.
  if (platform === "win32") {
    pattern = pattern.split("\\").join("/")
  }

  // lru storage.
  // these things aren't particularly big, but walking down the string
  // and turning it into a regexp can get pretty costly.
  var cacheKey = pattern + "\n" + sigmund(options)
  var cached = minimatch.cache.get(cacheKey)
  if (cached) return cached
  minimatch.cache.set(cacheKey, this)

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function() {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === "#") {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return -1 === s.indexOf(false)
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
    , negate = false
    , options = this.options
    , negateOffset = 0

  if (options.nonegate) return

  for ( var i = 0, l = pattern.length
      ; i < l && pattern.charAt(i) === "!"
      ; i ++) {
    negate = !negate
    negateOffset ++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return new Minimatch(pattern, options).braceExpand()
}

Minimatch.prototype.braceExpand = braceExpand

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function braceExpand (pattern, options) {
  options = options || this.options
  pattern = typeof pattern === "undefined"
    ? this.pattern : pattern

  if (typeof pattern === "undefined") {
    throw new Error("undefined pattern")
  }

  if (options.nobrace ||
      !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  var escaping = false

  // examples and comments refer to this crazy pattern:
  // a{b,c{d,e},{f,g}h}x{y,z}
  // expected:
  // abxy
  // abxz
  // acdxy
  // acdxz
  // acexy
  // acexz
  // afhxy
  // afhxz
  // aghxy
  // aghxz

  // everything before the first \{ is just a prefix.
  // So, we pluck that off, and work with the rest,
  // and then prepend it to everything we find.
  if (pattern.charAt(0) !== "{") {
    this.debug(pattern)
    var prefix = null
    for (var i = 0, l = pattern.length; i < l; i ++) {
      var c = pattern.charAt(i)
      this.debug(i, c)
      if (c === "\\") {
        escaping = !escaping
      } else if (c === "{" && !escaping) {
        prefix = pattern.substr(0, i)
        break
      }
    }

    // actually no sets, all { were escaped.
    if (prefix === null) {
      this.debug("no sets")
      return [pattern]
    }

   var tail = braceExpand.call(this, pattern.substr(i), options)
    return tail.map(function (t) {
      return prefix + t
    })
  }

  // now we have something like:
  // {b,c{d,e},{f,g}h}x{y,z}
  // walk through the set, expanding each part, until
  // the set ends.  then, we'll expand the suffix.
  // If the set only has a single member, then'll put the {} back

  // first, handle numeric sets, since they're easier
  var numset = pattern.match(/^\{(-?[0-9]+)\.\.(-?[0-9]+)\}/)
  if (numset) {
    this.debug("numset", numset[1], numset[2])
    var suf = braceExpand.call(this, pattern.substr(numset[0].length), options)
      , start = +numset[1]
      , needPadding = numset[1][0] === '0'
      , startWidth = numset[1].length
      , padded
      , end = +numset[2]
      , inc = start > end ? -1 : 1
      , set = []

    for (var i = start; i != (end + inc); i += inc) {
      padded = needPadding ? pad(i, startWidth) : i + ''
      // append all the suffixes
      for (var ii = 0, ll = suf.length; ii < ll; ii ++) {
        set.push(padded + suf[ii])
      }
    }
    return set
  }

  // ok, walk through the set
  // We hope, somewhat optimistically, that there
  // will be a } at the end.
  // If the closing brace isn't found, then the pattern is
  // interpreted as braceExpand("\\" + pattern) so that
  // the leading \{ will be interpreted literally.
  var i = 1 // skip the \{
    , depth = 1
    , set = []
    , member = ""
    , sawEnd = false
    , escaping = false

  function addMember () {
    set.push(member)
    member = ""
  }

  this.debug("Entering for")
  FOR: for (i = 1, l = pattern.length; i < l; i ++) {
    var c = pattern.charAt(i)
    this.debug("", i, c)

    if (escaping) {
      escaping = false
      member += "\\" + c
    } else {
      switch (c) {
        case "\\":
          escaping = true
          continue

        case "{":
          depth ++
          member += "{"
          continue

        case "}":
          depth --
          // if this closes the actual set, then we're done
          if (depth === 0) {
            addMember()
            // pluck off the close-brace
            i ++
            break FOR
          } else {
            member += c
            continue
          }

        case ",":
          if (depth === 1) {
            addMember()
          } else {
            member += c
          }
          continue

        default:
          member += c
          continue
      } // switch
    } // else
  } // for

  // now we've either finished the set, and the suffix is
  // pattern.substr(i), or we have *not* closed the set,
  // and need to escape the leading brace
  if (depth !== 0) {
    this.debug("didn't close", pattern)
    return braceExpand.call(this, "\\" + pattern, options)
  }

  // x{y,z} -> ["xy", "xz"]
  this.debug("set", set)
  this.debug("suffix", pattern.substr(i))
  var suf = braceExpand.call(this, pattern.substr(i), options)
  // ["b", "c{d,e}","{f,g}h"] ->
  //   [["b"], ["cd", "ce"], ["fh", "gh"]]
  var addBraces = set.length === 1
  this.debug("set pre-expanded", set)
  set = set.map(function (p) {
    return braceExpand.call(this, p, options)
  }, this)
  this.debug("set expanded", set)


  // [["b"], ["cd", "ce"], ["fh", "gh"]] ->
  //   ["b", "cd", "ce", "fh", "gh"]
  set = set.reduce(function (l, r) {
    return l.concat(r)
  })

  if (addBraces) {
    set = set.map(function (s) {
      return "{" + s + "}"
    })
  }

  // now attach the suffixes.
  var ret = []
  for (var i = 0, l = set.length; i < l; i ++) {
    for (var ii = 0, ll = suf.length; ii < ll; ii ++) {
      ret.push(set[i] + suf[ii])
    }
  }
  return ret
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === "**") return GLOBSTAR
  if (pattern === "") return ""

  var re = ""
    , hasMagic = !!options.nocase
    , escaping = false
    // ? => one single character
    , patternListStack = []
    , plType
    , stateChar
    , inClass = false
    , reClassStart = -1
    , classStart = -1
    // . and .. never match anything that doesn't start with .,
    // even when options.dot is set.
    , patternStart = pattern.charAt(0) === "." ? "" // anything
      // not (start or / followed by . or .. followed by / or end)
      : options.dot ? "(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))"
      : "(?!\\.)"
    , self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case "*":
          re += star
          hasMagic = true
          break
        case "?":
          re += qmark
          hasMagic = true
          break
        default:
          re += "\\"+stateChar
          break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for ( var i = 0, len = pattern.length, c
      ; (i < len) && (c = pattern.charAt(i))
      ; i ++ ) {

    this.debug("%s\t%s %s %j", pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += "\\" + c
      escaping = false
      continue
    }

    SWITCH: switch (c) {
      case "/":
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case "\\":
        clearStateChar()
        escaping = true
        continue

      // the various stateChar values
      // for the "extglob" stuff.
      case "?":
      case "*":
      case "+":
      case "@":
      case "!":
        this.debug("%s\t%s %s %j <-- stateChar", pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === "!" && i === classStart + 1) c = "^"
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
        continue

      case "(":
        if (inClass) {
          re += "("
          continue
        }

        if (!stateChar) {
          re += "\\("
          continue
        }

        plType = stateChar
        patternListStack.push({ type: plType
                              , start: i - 1
                              , reStart: re.length })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === "!" ? "(?:(?!" : "(?:"
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
        continue

      case ")":
        if (inClass || !patternListStack.length) {
          re += "\\)"
          continue
        }

        clearStateChar()
        hasMagic = true
        re += ")"
        plType = patternListStack.pop().type
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        switch (plType) {
          case "!":
            re += "[^/]*?)"
            break
          case "?":
          case "+":
          case "*": re += plType
          case "@": break // the default anyway
        }
        continue

      case "|":
        if (inClass || !patternListStack.length || escaping) {
          re += "\\|"
          escaping = false
          continue
        }

        clearStateChar()
        re += "|"
        continue

      // these are mostly the same in regexp and glob
      case "[":
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += "\\" + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
        continue

      case "]":
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += "\\" + c
          escaping = false
          continue
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
        continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
                   && !(c === "^" && inClass)) {
          re += "\\"
        }

        re += c

    } // switch
  } // for


  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    var cs = pattern.substr(classStart + 1)
      , sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + "\\[" + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  var pl
  while (pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + 3)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2})*)(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = "\\"
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + "|"
    })

    this.debug("tail=%j\n   %s", tail, tail)
    var t = pl.type === "*" ? star
          : pl.type === "?" ? qmark
          : "\\" + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart)
       + t + "\\("
       + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += "\\\\"
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case ".":
    case "[":
    case "(": addPatternStart = true
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== "" && hasMagic) re = "(?=.)" + re

  if (addPatternStart) re = patternStart + re

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [ re, hasMagic ]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? "i" : ""
    , regExp = new RegExp("^" + re + "$", flags)

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) return this.regexp = false
  var options = this.options

  var twoStar = options.noglobstar ? star
      : options.dot ? twoStarDot
      : twoStarNoDot
    , flags = options.nocase ? "i" : ""

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
           : (typeof p === "string") ? regExpEscape(p)
           : p._src
    }).join("\\\/")
  }).join("|")

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = "^(?:" + re + ")$"

  // can match anything, as long as it's not this.
  if (this.negate) re = "^(?!" + re + ").*$"

  try {
    return this.regexp = new RegExp(re, flags)
  } catch (ex) {
    return this.regexp = false
  }
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug("match", f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ""

  if (f === "/" && partial) return true

  var options = this.options

  // windows: need to use /, not \
  // On other platforms, \ is a valid (albeit bad) filename char.
  if (platform === "win32") {
    f = f.split("\\").join("/")
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, "split", f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, "set", set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename;
  for (var i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (var i = 0, l = set.length; i < l; i ++) {
    var pattern = set[i], file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug("matchOne",
              { "this": this
              , file: file
              , pattern: pattern })

  this.debug("matchOne", file.length, pattern.length)

  for ( var fi = 0
          , pi = 0
          , fl = file.length
          , pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi ++, pi ++ ) {

    this.debug("matchOne loop")
    var p = pattern[pi]
      , f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
        , pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for ( ; fi < fl; fi ++) {
          if (file[fi] === "." || file[fi] === ".." ||
              (!options.dot && file[fi].charAt(0) === ".")) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      WHILE: while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while',
                    file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === "." || swallowee === ".." ||
              (!options.dot && swallowee.charAt(0) === ".")) {
            this.debug("dot detected!", file, fr, pattern, pr)
            break WHILE
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr ++
        }
      }
      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug("\n>>> no match, partial?", file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === "string") {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug("string match", p, f, hit)
    } else {
      hit = f.match(p)
      this.debug("pattern match", p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === "")
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error("wtf?")
}


// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, "$1")
}


function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

})( typeof require === "function" ? require : null,
    this,
    typeof module === "object" ? module : null,
    typeof process === "object" ? process.platform : "win32"
  )

}).call(this,require('_process'))
},{"_process":41,"lru-cache":39,"path":40,"sigmund":43}],15:[function(require,module,exports){
(function (Buffer){
function FilerBuffer (subject, encoding, nonZero) {

  // Automatically turn ArrayBuffer into Uint8Array so that underlying
  // Buffer code doesn't just throw away and ignore ArrayBuffer data.
  if (subject instanceof ArrayBuffer) {
    subject = new Uint8Array(subject);
  }

  return new Buffer(subject, encoding, nonZero);
};

// Inherit prototype from Buffer
FilerBuffer.prototype = Object.create(Buffer.prototype);
FilerBuffer.prototype.constructor = FilerBuffer;

// Also copy static methods onto FilerBuffer ctor
Object.keys(Buffer).forEach(function (p) {
  if (Buffer.hasOwnProperty(p)) {
    FilerBuffer[p] = Buffer[p];
  }
});

module.exports = FilerBuffer;

}).call(this,require("buffer").Buffer)
},{"buffer":4}],16:[function(require,module,exports){
var O_READ = 'READ';
var O_WRITE = 'WRITE';
var O_CREATE = 'CREATE';
var O_EXCLUSIVE = 'EXCLUSIVE';
var O_TRUNCATE = 'TRUNCATE';
var O_APPEND = 'APPEND';
var XATTR_CREATE = 'CREATE';
var XATTR_REPLACE = 'REPLACE';

module.exports = {
  FILE_SYSTEM_NAME: 'local',

  FILE_STORE_NAME: 'files',

  IDB_RO: 'readonly',
  IDB_RW: 'readwrite',

  WSQL_VERSION: "1",
  WSQL_SIZE: 5 * 1024 * 1024,
  WSQL_DESC: "FileSystem Storage",

  MODE_FILE: 'FILE',
  MODE_DIRECTORY: 'DIRECTORY',
  MODE_SYMBOLIC_LINK: 'SYMLINK',
  MODE_META: 'META',

  SYMLOOP_MAX: 10,

  BINARY_MIME_TYPE: 'application/octet-stream',
  JSON_MIME_TYPE: 'application/json',

  ROOT_DIRECTORY_NAME: '/', // basename(normalize(path))

  // FS Mount Flags
  FS_FORMAT: 'FORMAT',
  FS_NOCTIME: 'NOCTIME',
  FS_NOMTIME: 'NOMTIME',
  FS_NODUPEIDCHECK: 'FS_NODUPEIDCHECK',

  // FS File Open Flags
  O_READ: O_READ,
  O_WRITE: O_WRITE,
  O_CREATE: O_CREATE,
  O_EXCLUSIVE: O_EXCLUSIVE,
  O_TRUNCATE: O_TRUNCATE,
  O_APPEND: O_APPEND,

  O_FLAGS: {
    'r': [O_READ],
    'r+': [O_READ, O_WRITE],
    'w': [O_WRITE, O_CREATE, O_TRUNCATE],
    'w+': [O_WRITE, O_READ, O_CREATE, O_TRUNCATE],
    'wx': [O_WRITE, O_CREATE, O_EXCLUSIVE, O_TRUNCATE],
    'wx+': [O_WRITE, O_READ, O_CREATE, O_EXCLUSIVE, O_TRUNCATE],
    'a': [O_WRITE, O_CREATE, O_APPEND],
    'a+': [O_WRITE, O_READ, O_CREATE, O_APPEND],
    'ax': [O_WRITE, O_CREATE, O_EXCLUSIVE, O_APPEND],
    'ax+': [O_WRITE, O_READ, O_CREATE, O_EXCLUSIVE, O_APPEND]
  },

  XATTR_CREATE: XATTR_CREATE,
  XATTR_REPLACE: XATTR_REPLACE,

  FS_READY: 'READY',
  FS_PENDING: 'PENDING',
  FS_ERROR: 'ERROR',

  SUPER_NODE_ID: '00000000-0000-0000-0000-000000000000',

  // Reserved File Descriptors for streams
  STDIN: 0,
  STDOUT: 1,
  STDERR: 2,
  FIRST_DESCRIPTOR: 3,

  ENVIRONMENT: {
    TMP: '/tmp',
    PATH: ''
  }
};

},{}],17:[function(require,module,exports){
var MODE_FILE = require('./constants.js').MODE_FILE;

module.exports = function DirectoryEntry(id, type) {
  this.id = id;
  this.type = type || MODE_FILE;
};

},{"./constants.js":16}],18:[function(require,module,exports){
(function (Buffer){
// Adapt encodings to work with Buffer or Uint8Array, they expect the latter
function decode(buf) {
  return buf.toString('utf8');
}

function encode(string) {
  return new Buffer(string, 'utf8');
}

module.exports = {
  encode: encode,
  decode: decode
};

}).call(this,require("buffer").Buffer)
},{"buffer":4}],19:[function(require,module,exports){
var errors = {};
[
  /**
   * node.js errors - we only use some of these, add as needed.
   */
  //'-1:UNKNOWN:unknown error',
  //'0:OK:success',
  //'1:EOF:end of file',
  //'2:EADDRINFO:getaddrinfo error',
  //'3:EACCES:permission denied',
  //'4:EAGAIN:resource temporarily unavailable',
  //'5:EADDRINUSE:address already in use',
  //'6:EADDRNOTAVAIL:address not available',
  //'7:EAFNOSUPPORT:address family not supported',
  //'8:EALREADY:connection already in progress',
  '9:EBADF:bad file descriptor',
  '10:EBUSY:resource busy or locked',
  //'11:ECONNABORTED:software caused connection abort',
  //'12:ECONNREFUSED:connection refused',
  //'13:ECONNRESET:connection reset by peer',
  //'14:EDESTADDRREQ:destination address required',
  //'15:EFAULT:bad address in system call argument',
  //'16:EHOSTUNREACH:host is unreachable',
  //'17:EINTR:interrupted system call',
  '18:EINVAL:invalid argument',
  //'19:EISCONN:socket is already connected',
  //'20:EMFILE:too many open files',
  //'21:EMSGSIZE:message too long',
  //'22:ENETDOWN:network is down',
  //'23:ENETUNREACH:network is unreachable',
  //'24:ENFILE:file table overflow',
  //'25:ENOBUFS:no buffer space available',
  //'26:ENOMEM:not enough memory',
  '27:ENOTDIR:not a directory',
  '28:EISDIR:illegal operation on a directory',
  //'29:ENONET:machine is not on the network',
  // errno 30 skipped, as per https://github.com/rvagg/node-errno/blob/master/errno.js
  //'31:ENOTCONN:socket is not connected',
  //'32:ENOTSOCK:socket operation on non-socket',
  //'33:ENOTSUP:operation not supported on socket',
  '34:ENOENT:no such file or directory',
  //'35:ENOSYS:function not implemented',
  //'36:EPIPE:broken pipe',
  //'37:EPROTO:protocol error',
  //'38:EPROTONOSUPPORT:protocol not supported',
  //'39:EPROTOTYPE:protocol wrong type for socket',
  //'40:ETIMEDOUT:connection timed out',
  //'41:ECHARSET:invalid Unicode character',
  //'42:EAIFAMNOSUPPORT:address family for hostname not supported',
  // errno 43 skipped, as per https://github.com/rvagg/node-errno/blob/master/errno.js
  //'44:EAISERVICE:servname not supported for ai_socktype',
  //'45:EAISOCKTYPE:ai_socktype not supported',
  //'46:ESHUTDOWN:cannot send after transport endpoint shutdown',
  '47:EEXIST:file already exists',
  //'48:ESRCH:no such process',
  //'49:ENAMETOOLONG:name too long',
  '50:EPERM:operation not permitted',
  '51:ELOOP:too many symbolic links encountered',
  //'52:EXDEV:cross-device link not permitted',
  '53:ENOTEMPTY:directory not empty',
  //'54:ENOSPC:no space left on device',
  '55:EIO:i/o error',
  //'56:EROFS:read-only file system',
  //'57:ENODEV:no such device',
  //'58:ESPIPE:invalid seek',
  //'59:ECANCELED:operation canceled',

  /**
   * Filer specific errors
   */
  '1000:ENOTMOUNTED:not mounted',
  '1001:EFILESYSTEMERROR:missing super node, use \'FORMAT\' flag to format filesystem.',
  '1002:ENOATTR:attribute does not exist'

].forEach(function(e) {
  e = e.split(':');
  var errno = +e[0];
  var errName = e[1];
  var defaultMessage = e[2];

  function FilerError(msg, path) {
    Error.call(this);

    this.name = errName;
    this.code = errName;
    this.errno = errno;
    this.message = msg || defaultMessage;
    if(path) {
      this.path = path;
    }
    this.stack = (new Error(this.message)).stack;
  }
  FilerError.prototype = Object.create(Error.prototype);
  FilerError.prototype.constructor = FilerError;
  FilerError.prototype.toString = function() {
    var pathInfo = this.path ? (', \'' + this.path + '\'') : '';
    return this.name + ': ' + this.message + pathInfo;
  };

  // We expose the error as both Errors.EINVAL and Errors[18]
  errors[errName] = errors[errno] = FilerError;
});

module.exports = errors;

},{}],20:[function(require,module,exports){
var _ = require('../../lib/nodash.js');

var Path = require('../path.js');
var normalize = Path.normalize;
var dirname = Path.dirname;
var basename = Path.basename;
var isAbsolutePath = Path.isAbsolute;
var isNullPath = Path.isNull;

var Constants = require('../constants.js');
var MODE_FILE = Constants.MODE_FILE;
var MODE_DIRECTORY = Constants.MODE_DIRECTORY;
var MODE_SYMBOLIC_LINK = Constants.MODE_SYMBOLIC_LINK;
var MODE_META = Constants.MODE_META;

var ROOT_DIRECTORY_NAME = Constants.ROOT_DIRECTORY_NAME;
var SUPER_NODE_ID = Constants.SUPER_NODE_ID;
var SYMLOOP_MAX = Constants.SYMLOOP_MAX;

var O_READ = Constants.O_READ;
var O_WRITE = Constants.O_WRITE;
var O_CREATE = Constants.O_CREATE;
var O_EXCLUSIVE = Constants.O_EXCLUSIVE;
var O_TRUNCATE = Constants.O_TRUNCATE;
var O_APPEND = Constants.O_APPEND;
var O_FLAGS = Constants.O_FLAGS;

var XATTR_CREATE = Constants.XATTR_CREATE;
var XATTR_REPLACE = Constants.XATTR_REPLACE;
var FS_NOMTIME = Constants.FS_NOMTIME;
var FS_NOCTIME = Constants.FS_NOCTIME;

var Encoding = require('../encoding.js');
var Errors = require('../errors.js');
var DirectoryEntry = require('../directory-entry.js');
var OpenFileDescription = require('../open-file-description.js');
var SuperNode = require('../super-node.js');
var Node = require('../node.js');
var Stats = require('../stats.js');
var Buffer = require('../buffer.js');

/**
 * Update node times. Only passed times are modified (undefined times are ignored)
 * and filesystem flags are examined in order to override update logic.
 */
function update_node_times(context, path, node, times, callback) {
  // Honour mount flags for how we update times
  var flags = context.flags;
  if(_(flags).contains(FS_NOCTIME)) {
    delete times.ctime;
  }
  if(_(flags).contains(FS_NOMTIME)) {
    delete times.mtime;
  }

  // Only do the update if required (i.e., times are still present)
  var update = false;
  if(times.ctime) {
    node.ctime = times.ctime;
    // We don't do atime tracking for perf reasons, but do mirror ctime
    node.atime = times.ctime;
    update = true;
  }
  if(times.atime) {
    // The only time we explicitly pass atime is when utimes(), futimes() is called.
    // Override ctime mirror here if so
    node.atime = times.atime;
    update = true;
  }
  if(times.mtime) {
    node.mtime = times.mtime;
    update = true;
  }

  function complete(error) {
    // Queue this change so we can send watch events.
    // Unlike node.js, we send the full path vs. basename/dirname only.
    context.changes.push({ event: 'change', path: path });
    callback(error);
  }

  if(update) {
    context.putObject(node.id, node, complete);
  } else {
    complete();
  }
}

/**
 * make_node()
 */
// in: file or directory path
// out: new node representing file/directory
function make_node(context, path, mode, callback) {
  if(mode !== MODE_DIRECTORY && mode !== MODE_FILE) {
    return callback(new Errors.EINVAL('mode must be a directory or file', path));
  }

  path = normalize(path);

  var name = basename(path);
  var parentPath = dirname(path);
  var parentNode;
  var parentNodeData;
  var node;

  // Check if the parent node exists
  function create_node_in_parent(error, parentDirectoryNode) {
    if(error) {
      callback(error);
    } else if(parentDirectoryNode.mode !== MODE_DIRECTORY) {
      callback(new Errors.ENOTDIR('a component of the path prefix is not a directory', path));
    } else {
      parentNode = parentDirectoryNode;
      find_node(context, path, check_if_node_exists);
    }
  }

  // Check if the node to be created already exists
  function check_if_node_exists(error, result) {
    if(!error && result) {
      callback(new Errors.EEXIST('path name already exists', path));
    } else if(error && !(error instanceof Errors.ENOENT)) {
      callback(error);
    } else {
      context.getObject(parentNode.data, create_node);
    }
  }

  // Create the new node
  function create_node(error, result) {
    if(error) {
      callback(error);
    } else {
      parentNodeData = result;
      Node.create({guid: context.guid, mode: mode}, function(error, result) {
        if(error) {
          callback(error);
          return;
        }
        node = result;
        node.nlinks += 1;
        context.putObject(node.id, node, update_parent_node_data);
      });
    }
  }

  // Update parent node time
  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, parentPath, node, { mtime: now, ctime: now }, callback);
    }
  }

  // Update the parent nodes data
  function update_parent_node_data(error) {
    if(error) {
      callback(error);
    } else {
      parentNodeData[name] = new DirectoryEntry(node.id, mode);
      context.putObject(parentNode.data, parentNodeData, update_time);
    }
  }

  // Find the parent node
  find_node(context, parentPath, create_node_in_parent);
}

/**
 * find_node
 */
// in: file or directory path
// out: node structure, or error
function find_node(context, path, callback) {
  path = normalize(path);
  if(!path) {
    return callback(new Errors.ENOENT('path is an empty string'));
  }
  var name = basename(path);
  var parentPath = dirname(path);
  var followedCount = 0;

  function read_root_directory_node(error, superNode) {
    if(error) {
      callback(error);
    } else if(!superNode || superNode.mode !== MODE_META || !superNode.rnode) {
      callback(new Errors.EFILESYSTEMERROR());
    } else {
      context.getObject(superNode.rnode, check_root_directory_node);
    }
  }

  function check_root_directory_node(error, rootDirectoryNode) {
    if(error) {
      callback(error);
    } else if(!rootDirectoryNode) {
      callback(new Errors.ENOENT());
    } else {
      callback(null, rootDirectoryNode);
    }
  }

  // in: parent directory node
  // out: parent directory data
  function read_parent_directory_data(error, parentDirectoryNode) {
    if(error) {
      callback(error);
    } else if(parentDirectoryNode.mode !== MODE_DIRECTORY || !parentDirectoryNode.data) {
      callback(new Errors.ENOTDIR('a component of the path prefix is not a directory', path));
    } else {
      context.getObject(parentDirectoryNode.data, get_node_from_parent_directory_data);
    }
  }

  // in: parent directory data
  // out: searched node
  function get_node_from_parent_directory_data(error, parentDirectoryData) {
    if(error) {
      callback(error);
    } else {
      if(!_(parentDirectoryData).has(name)) {
        callback(new Errors.ENOENT(null, path));
      } else {
        var nodeId = parentDirectoryData[name].id;
        context.getObject(nodeId, is_symbolic_link);
      }
    }
  }

  function is_symbolic_link(error, node) {
    if(error) {
      callback(error);
    } else {
      if(node.mode == MODE_SYMBOLIC_LINK) {
        followedCount++;
        if(followedCount > SYMLOOP_MAX){
          callback(new Errors.ELOOP(null, path));
        } else {
          follow_symbolic_link(node.data);
        }
      } else {
        callback(null, node);
      }
    }
  }

  function follow_symbolic_link(data) {
    data = normalize(data);
    parentPath = dirname(data);
    name = basename(data);
    if(ROOT_DIRECTORY_NAME == name) {
      context.getObject(SUPER_NODE_ID, read_root_directory_node);
    } else {
      find_node(context, parentPath, read_parent_directory_data);
    }
  }

  if(ROOT_DIRECTORY_NAME == name) {
    context.getObject(SUPER_NODE_ID, read_root_directory_node);
  } else {
    find_node(context, parentPath, read_parent_directory_data);
  }
}


/**
 * set extended attribute (refactor)
 */
function set_extended_attribute (context, path, node, name, value, flag, callback) {
  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      update_node_times(context, path, node, { ctime: Date.now() }, callback);
    }
  }

  var xattrs = node.xattrs;

  if (flag === XATTR_CREATE && xattrs.hasOwnProperty(name)) {
    callback(new Errors.EEXIST('attribute already exists', path));
  }
  else if (flag === XATTR_REPLACE && !xattrs.hasOwnProperty(name)) {
    callback(new Errors.ENOATTR(null, path));
  }
  else {
    xattrs[name] = value;
    context.putObject(node.id, node, update_time);
  }
}

/**
 * ensure_root_directory. Creates a root node if necessary.
 *
 * Note: this should only be invoked when formatting a new file system.
 * Multiple invocations of this by separate instances will still result
 * in only a single super node.
 */
function ensure_root_directory(context, callback) {
  var superNode;
  var directoryNode;
  var directoryData;

  function ensure_super_node(error, existingNode) {
    if(!error && existingNode) {
      // Another instance has beat us and already created the super node.
      callback();
    } else if(error && !(error instanceof Errors.ENOENT)) {
      callback(error);
    } else {
      SuperNode.create({guid: context.guid}, function(error, result) {
        if(error) {
          callback(error);
          return;
        }
        superNode = result;
        context.putObject(superNode.id, superNode, write_directory_node);
      });
    }
  }

  function write_directory_node(error) {
    if(error) {
      callback(error);
    } else {
      Node.create({guid: context.guid, id: superNode.rnode, mode: MODE_DIRECTORY}, function(error, result) {
        if(error) {
          callback(error);
          return;
        }
        directoryNode = result;
        directoryNode.nlinks += 1;
        context.putObject(directoryNode.id, directoryNode, write_directory_data);
      });
    }
  }

  function write_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      directoryData = {};
      context.putObject(directoryNode.data, directoryData, callback);
    }
  }

  context.getObject(SUPER_NODE_ID, ensure_super_node);
}

/**
 * make_directory
 */
function make_directory(context, path, callback) {
  path = normalize(path);
  var name = basename(path);
  var parentPath = dirname(path);

  var directoryNode;
  var directoryData;
  var parentDirectoryNode;
  var parentDirectoryData;

  function check_if_directory_exists(error, result) {
    if(!error && result) {
      callback(new Errors.EEXIST(null, path));
    } else if(error && !(error instanceof Errors.ENOENT)) {
      callback(error);
    } else {
      find_node(context, parentPath, read_parent_directory_data);
    }
  }

  function read_parent_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      parentDirectoryNode = result;
      context.getObject(parentDirectoryNode.data, write_directory_node);
    }
  }

  function write_directory_node(error, result) {
    if(error) {
      callback(error);
    } else {
      parentDirectoryData = result;
      Node.create({guid: context.guid, mode: MODE_DIRECTORY}, function(error, result) {
        if(error) {
          callback(error);
          return;
        }
        directoryNode = result;
        directoryNode.nlinks += 1;
        context.putObject(directoryNode.id, directoryNode, write_directory_data);
      });
    }
  }

  function write_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      directoryData = {};
      context.putObject(directoryNode.data, directoryData, update_parent_directory_data);
    }
  }

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, parentPath, parentDirectoryNode, { mtime: now, ctime: now }, callback);
    }
  }

  function update_parent_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      parentDirectoryData[name] = new DirectoryEntry(directoryNode.id, MODE_DIRECTORY);
      context.putObject(parentDirectoryNode.data, parentDirectoryData, update_time);
    }
  }

  find_node(context, path, check_if_directory_exists);
}

/**
 * remove_directory
 */
function remove_directory(context, path, callback) {
  path = normalize(path);
  var name = basename(path);
  var parentPath = dirname(path);

  var directoryNode;
  var directoryData;
  var parentDirectoryNode;
  var parentDirectoryData;

  function read_parent_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      parentDirectoryNode = result;
      context.getObject(parentDirectoryNode.data, check_if_node_exists);
    }
  }

  function check_if_node_exists(error, result) {
    if(error) {
      callback(error);
    } else if(ROOT_DIRECTORY_NAME == name) {
      callback(new Errors.EBUSY(null, path));
    } else if(!_(result).has(name)) {
      callback(new Errors.ENOENT(null, path));
    } else {
      parentDirectoryData = result;
      directoryNode = parentDirectoryData[name].id;
      context.getObject(directoryNode, check_if_node_is_directory);
    }
  }

  function check_if_node_is_directory(error, result) {
    if(error) {
      callback(error);
    } else if(result.mode != MODE_DIRECTORY) {
      callback(new Errors.ENOTDIR(null, path));
    } else {
      directoryNode = result;
      context.getObject(directoryNode.data, check_if_directory_is_empty);
    }
  }

  function check_if_directory_is_empty(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryData = result;
      if(_(directoryData).size() > 0) {
        callback(new Errors.ENOTEMPTY(null, path));
      } else {
        remove_directory_entry_from_parent_directory_node();
      }
    }
  }

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, parentPath, parentDirectoryNode, { mtime: now, ctime: now }, remove_directory_node);
    }
  }

  function remove_directory_entry_from_parent_directory_node() {
    delete parentDirectoryData[name];
    context.putObject(parentDirectoryNode.data, parentDirectoryData, update_time);
  }

  function remove_directory_node(error) {
    if(error) {
      callback(error);
    } else {
      context.delete(directoryNode.id, remove_directory_data);
    }
  }

  function remove_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      context.delete(directoryNode.data, callback);
    }
  }

  find_node(context, parentPath, read_parent_directory_data);
}

function open_file(context, path, flags, callback) {
  path = normalize(path);
  var name = basename(path);
  var parentPath = dirname(path);

  var directoryNode;
  var directoryData;
  var directoryEntry;
  var fileNode;
  var fileData;

  var followedCount = 0;

  if(ROOT_DIRECTORY_NAME == name) {
    if(_(flags).contains(O_WRITE)) {
      callback(new Errors.EISDIR('the named file is a directory and O_WRITE is set', path));
    } else {
      find_node(context, path, set_file_node);
    }
  } else {
    find_node(context, parentPath, read_directory_data);
  }

  function read_directory_data(error, result) {
    if(error) {
      callback(error);
    } else if(result.mode !== MODE_DIRECTORY) {
      callback(new Errors.ENOENT(null, path));
    } else {
      directoryNode = result;
      context.getObject(directoryNode.data, check_if_file_exists);
    }
  }

  function check_if_file_exists(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryData = result;
      if(_(directoryData).has(name)) {
        if(_(flags).contains(O_EXCLUSIVE)) {
          callback(new Errors.ENOENT('O_CREATE and O_EXCLUSIVE are set, and the named file exists', path));
        } else {
          directoryEntry = directoryData[name];
          if(directoryEntry.type == MODE_DIRECTORY && _(flags).contains(O_WRITE)) {
            callback(new Errors.EISDIR('the named file is a directory and O_WRITE is set', path));
          } else {
            context.getObject(directoryEntry.id, check_if_symbolic_link);
          }
        }
      } else {
        if(!_(flags).contains(O_CREATE)) {
          callback(new Errors.ENOENT('O_CREATE is not set and the named file does not exist', path));
        } else {
          write_file_node();
        }
      }
    }
  }

  function check_if_symbolic_link(error, result) {
    if(error) {
      callback(error);
    } else {
      var node = result;
      if(node.mode == MODE_SYMBOLIC_LINK) {
        followedCount++;
        if(followedCount > SYMLOOP_MAX){
          callback(new Errors.ELOOP(null, path));
        } else {
          follow_symbolic_link(node.data);
        }
      } else {
        set_file_node(undefined, node);
      }
    }
  }

  function follow_symbolic_link(data) {
    data = normalize(data);
    parentPath = dirname(data);
    name = basename(data);
    if(ROOT_DIRECTORY_NAME == name) {
      if(_(flags).contains(O_WRITE)) {
        callback(new Errors.EISDIR('the named file is a directory and O_WRITE is set', path));
      } else {
        find_node(context, path, set_file_node);
      }
    }
    find_node(context, parentPath, read_directory_data);
  }

  function set_file_node(error, result) {
    if(error) {
      callback(error);
    } else {
      fileNode = result;
      callback(null, fileNode);
    }
  }

  function write_file_node() {
    Node.create({guid: context.guid, mode: MODE_FILE}, function(error, result) {
      if(error) {
        callback(error);
        return;
      }
      fileNode = result;
      fileNode.nlinks += 1;
      context.putObject(fileNode.id, fileNode, write_file_data);
    });
  }

  function write_file_data(error) {
    if(error) {
      callback(error);
    } else {
      fileData = new Buffer(0);
      fileData.fill(0);
      context.putBuffer(fileNode.data, fileData, update_directory_data);
    }
  }

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, parentPath, directoryNode, { mtime: now, ctime: now }, handle_update_result);
    }
  }

  function update_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      directoryData[name] = new DirectoryEntry(fileNode.id, MODE_FILE);
      context.putObject(directoryNode.data, directoryData, update_time);
    }
  }

  function handle_update_result(error) {
    if(error) {
      callback(error);
    } else {
      callback(null, fileNode);
    }
  }
}

function replace_data(context, ofd, buffer, offset, length, callback) {
  var fileNode;

  function return_nbytes(error) {
    if(error) {
      callback(error);
    } else {
      callback(null, length);
    }
  }

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, ofd.path, fileNode, { mtime: now, ctime: now }, return_nbytes);
    }
  }

  function update_file_node(error) {
    if(error) {
      callback(error);
    } else {
      context.putObject(fileNode.id, fileNode, update_time);
    }
  }

  function write_file_data(error, result) {
    if(error) {
      callback(error);
    } else {
      fileNode = result;
      var newData = new Buffer(length);
      newData.fill(0);
      buffer.copy(newData, 0, offset, offset + length);
      ofd.position = length;

      fileNode.size = length;
      fileNode.version += 1;

      context.putBuffer(fileNode.data, newData, update_file_node);
    }
  }

  context.getObject(ofd.id, write_file_data);
}

function write_data(context, ofd, buffer, offset, length, position, callback) {
  var fileNode;
  var fileData;

  function return_nbytes(error) {
    if(error) {
      callback(error);
    } else {
      callback(null, length);
    }
  }

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, ofd.path, fileNode, { mtime: now, ctime: now }, return_nbytes);
    }
  }

  function update_file_node(error) {
    if(error) {
      callback(error);
    } else {
      context.putObject(fileNode.id, fileNode, update_time);
    }
  }

  function update_file_data(error, result) {
    if(error) {
      callback(error);
    } else {
      fileData = result;
      if(!fileData) {
        return callback(new Errors.EIO('Expected Buffer'));
      }
      var _position = (!(undefined === position || null === position)) ? position : ofd.position;
      var newSize = Math.max(fileData.length, _position + length);
      var newData = new Buffer(newSize);
      newData.fill(0);
      if(fileData) {
        fileData.copy(newData);
      }
      buffer.copy(newData, _position, offset, offset + length);
      if(undefined === position) {
        ofd.position += length;
      }

      fileNode.size = newSize;
      fileNode.version += 1;

      context.putBuffer(fileNode.data, newData, update_file_node);
    }
  }

  function read_file_data(error, result) {
    if(error) {
      callback(error);
    } else {
      fileNode = result;
      context.getBuffer(fileNode.data, update_file_data);
    }
  }

  context.getObject(ofd.id, read_file_data);
}

function read_data(context, ofd, buffer, offset, length, position, callback) {
  var fileNode;
  var fileData;

  function handle_file_data(error, result) {
    if(error) {
      callback(error);
    } else {
      fileData = result;
      if(!fileData) {
        return callback(new Errors.EIO('Expected Buffer'));
      }
      var _position = (!(undefined === position || null === position)) ? position : ofd.position;
      length = (_position + length > buffer.length) ? length - _position : length;
      fileData.copy(buffer, offset, _position, _position + length);
      if(undefined === position) {
        ofd.position += length;
      }
      callback(null, length);
    }
  }

  function read_file_data(error, result) {
    if(error) {
      callback(error);
    } else if(result.mode === 'DIRECTORY') {
      callback(new Errors.EISDIR('the named file is a directory', ofd.path));
    } else {
      fileNode = result;
      context.getBuffer(fileNode.data, handle_file_data);
    }
  }

  context.getObject(ofd.id, read_file_data);
}

function stat_file(context, path, callback) {
  path = normalize(path);
  var name = basename(path);
  find_node(context, path, callback);
}

function fstat_file(context, ofd, callback) {
  ofd.getNode(context, callback);
}

function lstat_file(context, path, callback) {
  path = normalize(path);
  var name = basename(path);
  var parentPath = dirname(path);

  var directoryNode;
  var directoryData;

  if(ROOT_DIRECTORY_NAME == name) {
    find_node(context, path, callback);
  } else {
    find_node(context, parentPath, read_directory_data);
  }

  function read_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryNode = result;
      context.getObject(directoryNode.data, check_if_file_exists);
    }
  }

  function check_if_file_exists(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryData = result;
      if(!_(directoryData).has(name)) {
        callback(new Errors.ENOENT('a component of the path does not name an existing file', path));
      } else {
        context.getObject(directoryData[name].id, callback);
      }
    }
  }
}

function link_node(context, oldpath, newpath, callback) {
  oldpath = normalize(oldpath);
  var oldname = basename(oldpath);
  var oldParentPath = dirname(oldpath);

  newpath = normalize(newpath);
  var newname = basename(newpath);
  var newParentPath = dirname(newpath);

  var oldDirectoryNode;
  var oldDirectoryData;
  var newDirectoryNode;
  var newDirectoryData;
  var fileNode;

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      update_node_times(context, newpath,  fileNode, { ctime: Date.now() }, callback);
    }
  }

  function update_file_node(error, result) {
    if(error) {
      callback(error);
    } else {
      fileNode = result;
      fileNode.nlinks += 1;
      context.putObject(fileNode.id, fileNode, update_time);
    }
  }

  function read_directory_entry(error, result) {
    if(error) {
      callback(error);
    } else {
      context.getObject(newDirectoryData[newname].id, update_file_node);
    }
  }

  function check_if_new_file_exists(error, result) {
    if(error) {
      callback(error);
    } else {
      newDirectoryData = result;
      if(_(newDirectoryData).has(newname)) {
        callback(new Errors.EEXIST('newpath resolves to an existing file', newname));
      } else {
        newDirectoryData[newname] = oldDirectoryData[oldname];
        context.putObject(newDirectoryNode.data, newDirectoryData, read_directory_entry);
      }
    }
  }

  function read_new_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      newDirectoryNode = result;
      context.getObject(newDirectoryNode.data, check_if_new_file_exists);
    }
  }

  function check_if_old_file_exists(error, result) {
    if(error) {
      callback(error);
    } else {
      oldDirectoryData = result;
      if(!_(oldDirectoryData).has(oldname)) {
        callback(new Errors.ENOENT('a component of either path prefix does not exist', oldname));
      } else if(oldDirectoryData[oldname].type === 'DIRECTORY') {
        callback(new Errors.EPERM('oldpath refers to a directory'));
      } else {
        find_node(context, newParentPath, read_new_directory_data);
      }
    }
  }

  function read_old_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      oldDirectoryNode = result;
      context.getObject(oldDirectoryNode.data, check_if_old_file_exists);
    }
  }

  find_node(context, oldParentPath, read_old_directory_data);
}

function unlink_node(context, path, callback) {
  path = normalize(path);
  var name = basename(path);
  var parentPath = dirname(path);

  var directoryNode;
  var directoryData;
  var fileNode;

  function update_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      delete directoryData[name];
      context.putObject(directoryNode.data, directoryData, function(error) {
        var now = Date.now();
        update_node_times(context, parentPath, directoryNode, { mtime: now, ctime: now }, callback);
      });
    }
  }

  function delete_file_data(error) {
    if(error) {
      callback(error);
    } else {
      context.delete(fileNode.data, update_directory_data);
    }
  }

  function update_file_node(error, result) {
    if(error) {
      callback(error);
    } else {
      fileNode = result;
      fileNode.nlinks -= 1;
      if(fileNode.nlinks < 1) {
        context.delete(fileNode.id, delete_file_data);
      } else {
        context.putObject(fileNode.id, fileNode, function(error) {
          update_node_times(context, path, fileNode, { ctime: Date.now() }, update_directory_data);
        });
      }
    }
  }

  function check_if_node_is_directory(error, result) {
    if(error) {
      callback(error);
    } else if(result.mode === 'DIRECTORY') {
      callback(new Errors.EPERM('unlink not permitted on directories', name));
    } else {
      update_file_node(null, result);
    }
  }

  function check_if_file_exists(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryData = result;
      if(!_(directoryData).has(name)) {
        callback(new Errors.ENOENT('a component of the path does not name an existing file', name));
      } else {
        context.getObject(directoryData[name].id, check_if_node_is_directory);
      }
    }
  }

  function read_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryNode = result;
      context.getObject(directoryNode.data, check_if_file_exists);
    }
  }

  find_node(context, parentPath, read_directory_data);
}

function read_directory(context, path, callback) {
  path = normalize(path);
  var name = basename(path);

  var directoryNode;
  var directoryData;

  function handle_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryData = result;
      var files = Object.keys(directoryData);
      callback(null, files);
    }
  }

  function read_directory_data(error, result) {
    if(error) {
      callback(error);
    } else if(result.mode !== MODE_DIRECTORY) {
      callback(new Errors.ENOTDIR(null, path));
    } else {
      directoryNode = result;
      context.getObject(directoryNode.data, handle_directory_data);
    }
  }

  find_node(context, path, read_directory_data);
}

function make_symbolic_link(context, srcpath, dstpath, callback) {
  dstpath = normalize(dstpath);
  var name = basename(dstpath);
  var parentPath = dirname(dstpath);

  var directoryNode;
  var directoryData;
  var fileNode;

  if(ROOT_DIRECTORY_NAME == name) {
    callback(new Errors.EEXIST(null, name));
  } else {
    find_node(context, parentPath, read_directory_data);
  }

  function read_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryNode = result;
      context.getObject(directoryNode.data, check_if_file_exists);
    }
  }

  function check_if_file_exists(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryData = result;
      if(_(directoryData).has(name)) {
        callback(new Errors.EEXIST(null, name));
      } else {
        write_file_node();
      }
    }
  }

  function write_file_node() {
    Node.create({guid: context.guid, mode: MODE_SYMBOLIC_LINK}, function(error, result) {
      if(error) {
        callback(error);
        return;
      }
      fileNode = result;
      fileNode.nlinks += 1;
      fileNode.size = srcpath.length;
      fileNode.data = srcpath;
      context.putObject(fileNode.id, fileNode, update_directory_data);
    });
  }

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, parentPath, directoryNode, { mtime: now, ctime: now }, callback);
    }
  }

  function update_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      directoryData[name] = new DirectoryEntry(fileNode.id, MODE_SYMBOLIC_LINK);
      context.putObject(directoryNode.data, directoryData, update_time);
    }
  }
}

function read_link(context, path, callback) {
  path = normalize(path);
  var name = basename(path);
  var parentPath = dirname(path);

  var directoryNode;
  var directoryData;

  find_node(context, parentPath, read_directory_data);

  function read_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryNode = result;
      context.getObject(directoryNode.data, check_if_file_exists);
    }
  }

  function check_if_file_exists(error, result) {
    if(error) {
      callback(error);
    } else {
      directoryData = result;
      if(!_(directoryData).has(name)) {
        callback(new Errors.ENOENT('a component of the path does not name an existing file', name));
      } else {
        context.getObject(directoryData[name].id, check_if_symbolic);
      }
    }
  }

  function check_if_symbolic(error, result) {
    if(error) {
      callback(error);
    } else {
      if(result.mode != MODE_SYMBOLIC_LINK) {
        callback(new Errors.EINVAL('path not a symbolic link', path));
      } else {
        callback(null, result.data);
      }
    }
  }
}

function truncate_file(context, path, length, callback) {
  path = normalize(path);

  var fileNode;

  function read_file_data (error, node) {
    if (error) {
      callback(error);
    } else if(node.mode == MODE_DIRECTORY ) {
      callback(new Errors.EISDIR(null, path));
    } else{
      fileNode = node;
      context.getBuffer(fileNode.data, truncate_file_data);
    }
  }

  function truncate_file_data(error, fileData) {
    if (error) {
      callback(error);
    } else {
      if(!fileData) {
        return callback(new Errors.EIO('Expected Buffer'));
      }
      var data = new Buffer(length);
      data.fill(0);
      if(fileData) {
        fileData.copy(data);
      }
      context.putBuffer(fileNode.data, data, update_file_node);
    }
  }

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, path, fileNode, { mtime: now, ctime: now }, callback);
    }
  }

  function update_file_node (error) {
    if(error) {
      callback(error);
    } else {
      fileNode.size = length;
      fileNode.version += 1;
      context.putObject(fileNode.id, fileNode, update_time);
    }
  }

  if(length < 0) {
    callback(new Errors.EINVAL('length cannot be negative'));
  } else {
    find_node(context, path, read_file_data);
  }
}

function ftruncate_file(context, ofd, length, callback) {
  var fileNode;

  function read_file_data (error, node) {
    if (error) {
      callback(error);
    } else if(node.mode == MODE_DIRECTORY ) {
      callback(new Errors.EISDIR());
    } else{
      fileNode = node;
      context.getBuffer(fileNode.data, truncate_file_data);
    }
  }

  function truncate_file_data(error, fileData) {
    if (error) {
      callback(error);
    } else {
      var data;
      if(!fileData) {
        return callback(new Errors.EIO('Expected Buffer'));
      }
      if(fileData) {
        data = fileData.slice(0, length);
      } else {
        data = new Buffer(length);
        data.fill(0);
      }
      context.putBuffer(fileNode.data, data, update_file_node);
    }
  }

  function update_time(error) {
    if(error) {
      callback(error);
    } else {
      var now = Date.now();
      update_node_times(context, ofd.path, fileNode, { mtime: now, ctime: now }, callback);
    }
  }

  function update_file_node (error) {
    if(error) {
      callback(error);
    } else {
      fileNode.size = length;
      fileNode.version += 1;
      context.putObject(fileNode.id, fileNode, update_time);
    }
  }

  if(length < 0) {
    callback(new Errors.EINVAL('length cannot be negative'));
  } else {
    ofd.getNode(context, read_file_data);
  }
}

function utimes_file(context, path, atime, mtime, callback) {
  path = normalize(path);

  function update_times(error, node) {
    if (error) {
      callback(error);
    } else {
      update_node_times(context, path, node, { atime: atime, ctime: mtime, mtime: mtime }, callback);
    }
  }

  if (typeof atime != 'number' || typeof mtime != 'number') {
    callback(new Errors.EINVAL('atime and mtime must be number', path));
  }
  else if (atime < 0 || mtime < 0) {
    callback(new Errors.EINVAL('atime and mtime must be positive integers', path));
  }
  else {
    find_node(context, path, update_times);
  }
}

function futimes_file(context, ofd, atime, mtime, callback) {

  function update_times (error, node) {
    if (error) {
      callback(error);
    } else {
      update_node_times(context, ofd.path, node, { atime: atime, ctime: mtime, mtime: mtime }, callback);
    }
  }

  if (typeof atime != 'number' || typeof mtime != 'number') {
    callback(new Errors.EINVAL('atime and mtime must be a number'));
  }
  else if (atime < 0 || mtime < 0) {
    callback(new Errors.EINVAL('atime and mtime must be positive integers'));
  }
  else {
    ofd.getNode(context, update_times);
  }
}

function setxattr_file(context, path, name, value, flag, callback) {
  path = normalize(path);

  function setxattr(error, node) {
    if(error) {
      return callback(error);
    }
    set_extended_attribute(context, path, node, name, value, flag, callback);
  }

  if (typeof name != 'string') {
    callback(new Errors.EINVAL('attribute name must be a string', path));
  }
  else if (!name) {
    callback(new Errors.EINVAL('attribute name cannot be an empty string', path));
  }
  else if (flag !== null &&
           flag !== XATTR_CREATE && flag !== XATTR_REPLACE) {
    callback(new Errors.EINVAL('invalid flag, must be null, XATTR_CREATE or XATTR_REPLACE', path));
  }
  else {
    find_node(context, path, setxattr);
  }
}

function fsetxattr_file (context, ofd, name, value, flag, callback) {
  function setxattr(error, node) {
    if(error) {
      return callback(error);
    }
    set_extended_attribute(context, ofd.path, node, name, value, flag, callback);
  }

  if (typeof name !== 'string') {
    callback(new Errors.EINVAL('attribute name must be a string'));
  }
  else if (!name) {
    callback(new Errors.EINVAL('attribute name cannot be an empty string'));
  }
  else if (flag !== null &&
           flag !== XATTR_CREATE && flag !== XATTR_REPLACE) {
    callback(new Errors.EINVAL('invalid flag, must be null, XATTR_CREATE or XATTR_REPLACE'));
  }
  else {
    ofd.getNode(context, setxattr);
  }
}

function getxattr_file (context, path, name, callback) {
  path = normalize(path);

  function get_xattr(error, node) {
    if(error) {
      return callback(error);
    }

    var xattrs = node.xattrs;

    if (!xattrs.hasOwnProperty(name)) {
      callback(new Errors.ENOATTR(null, path));
    }
    else {
      callback(null, xattrs[name]);
    }
  }

  if (typeof name != 'string') {
    callback(new Errors.EINVAL('attribute name must be a string', path));
  }
  else if (!name) {
    callback(new Errors.EINVAL('attribute name cannot be an empty string', path));
  }
  else {
    find_node(context, path, get_xattr);
  }
}

function fgetxattr_file (context, ofd, name, callback) {

  function get_xattr (error, node) {
    if (error) {
      return callback(error);
    }

    var xattrs = node.xattrs;

    if (!xattrs.hasOwnProperty(name)) {
      callback(new Errors.ENOATTR());
    }
    else {
      callback(null, xattrs[name]);
    }
  }

  if (typeof name != 'string') {
    callback(new Errors.EINVAL());
  }
  else if (!name) {
    callback(new Errors.EINVAL('attribute name cannot be an empty string'));
  }
  else {
    ofd.getNode(context, get_xattr);
  }
}

function removexattr_file (context, path, name, callback) {
  path = normalize(path);

  function remove_xattr (error, node) {
    if (error) {
      return callback(error);
    }

    function update_time(error) {
      if(error) {
        callback(error);
      } else {
        update_node_times(context, path, node, { ctime: Date.now() }, callback);
      }
    }

    var xattrs = node.xattrs;

    if (!xattrs.hasOwnProperty(name)) {
      callback(new Errors.ENOATTR(null, path));
    }
    else {
      delete xattrs[name];
      context.putObject(node.id, node, update_time);
    }
  }

  if (typeof name !== 'string') {
    callback(new Errors.EINVAL('attribute name must be a string', path));
  }
  else if (!name) {
    callback(new Errors.EINVAL('attribute name cannot be an empty string', path));
  }
  else {
    find_node(context, path, remove_xattr);
  }
}

function fremovexattr_file (context, ofd, name, callback) {

  function remove_xattr (error, node) {
    if (error) {
      return callback(error);
    }

    function update_time(error) {
      if(error) {
        callback(error);
      } else {
        update_node_times(context, ofd.path, node, { ctime: Date.now() }, callback);
      }
    }

    var xattrs = node.xattrs;

    if (!xattrs.hasOwnProperty(name)) {
      callback(new Errors.ENOATTR());
    }
    else {
      delete xattrs[name];
      context.putObject(node.id, node, update_time);
    }
  }

  if (typeof name != 'string') {
    callback(new Errors.EINVAL('attribute name must be a string'));
  }
  else if (!name) {
    callback(new Errors.EINVAL('attribute name cannot be an empty string'));
  }
  else {
    ofd.getNode(context, remove_xattr);
  }
}

function validate_flags(flags) {
  if(!_(O_FLAGS).has(flags)) {
    return null;
  }
  return O_FLAGS[flags];
}

function validate_file_options(options, enc, fileMode){
  if(!options) {
    options = { encoding: enc, flag: fileMode };
  } else if(typeof options === "function") {
    options = { encoding: enc, flag: fileMode };
  } else if(typeof options === "string") {
    options = { encoding: options, flag: fileMode };
  }
  return options;
}

function pathCheck(path, callback) {
  var err;

  if(!path) {
    err = new Errors.EINVAL('Path must be a string', path);
  } else if(isNullPath(path)) {
    err = new Errors.EINVAL('Path must be a string without null bytes.', path);
  } else if(!isAbsolutePath(path)) {
    err = new Errors.EINVAL('Path must be absolute.', path);
  }

  if(err) {
    callback(err);
    return false;
  }
  return true;
}


function open(fs, context, path, flags, mode, callback) {
  // NOTE: we support the same signature as node with a `mode` arg,
  // but ignore it.
  callback = arguments[arguments.length - 1];
  if(!pathCheck(path, callback)) return;

  function check_result(error, fileNode) {
    if(error) {
      callback(error);
    } else {
      var position;
      if(_(flags).contains(O_APPEND)) {
        position = fileNode.size;
      } else {
        position = 0;
      }
      var openFileDescription = new OpenFileDescription(path, fileNode.id, flags, position);
      var fd = fs.allocDescriptor(openFileDescription);
      callback(null, fd);
    }
  }

  flags = validate_flags(flags);
  if(!flags) {
    callback(new Errors.EINVAL('flags is not valid'), path);
  }

  open_file(context, path, flags, check_result);
}

function close(fs, context, fd, callback) {
  if(!_(fs.openFiles).has(fd)) {
    callback(new Errors.EBADF());
  } else {
    fs.releaseDescriptor(fd);
    callback(null);
  }
}

function mknod(fs, context, path, mode, callback) {
  if(!pathCheck(path, callback)) return;
  make_node(context, path, mode, callback);
}

function mkdir(fs, context, path, mode, callback) {
  // NOTE: we support passing a mode arg, but we ignore it internally for now.
  callback = arguments[arguments.length - 1];
  if(!pathCheck(path, callback)) return;
  make_directory(context, path, callback);
}

function rmdir(fs, context, path, callback) {
  if(!pathCheck(path, callback)) return;
  remove_directory(context, path, callback);
}

function stat(fs, context, path, callback) {
  if(!pathCheck(path, callback)) return;

  function check_result(error, result) {
    if(error) {
      callback(error);
    } else {
      var stats = new Stats(result, fs.name);
      callback(null, stats);
    }
  }

  stat_file(context, path, check_result);
}

function fstat(fs, context, fd, callback) {
  function check_result(error, result) {
    if(error) {
      callback(error);
    } else {
      var stats = new Stats(result, fs.name);
      callback(null, stats);
    }
  }

  var ofd = fs.openFiles[fd];
  if(!ofd) {
    callback(new Errors.EBADF());
  } else {
    fstat_file(context, ofd, check_result);
  }
}

function link(fs, context, oldpath, newpath, callback) {
  if(!pathCheck(oldpath, callback)) return;
  if(!pathCheck(newpath, callback)) return;
  link_node(context, oldpath, newpath, callback);
}

function unlink(fs, context, path, callback) {
  if(!pathCheck(path, callback)) return;
  unlink_node(context, path, callback);
}

function read(fs, context, fd, buffer, offset, length, position, callback) {
  // Follow how node.js does this
  function wrapped_cb(err, bytesRead) {
    // Retain a reference to buffer so that it can't be GC'ed too soon.
    callback(err, bytesRead || 0, buffer);
  }

  offset = (undefined === offset) ? 0 : offset;
  length = (undefined === length) ? buffer.length - offset : length;
  callback = arguments[arguments.length - 1];

  var ofd = fs.openFiles[fd];
  if(!ofd) {
    callback(new Errors.EBADF());
  } else if(!_(ofd.flags).contains(O_READ)) {
    callback(new Errors.EBADF('descriptor does not permit reading'));
  } else {
    read_data(context, ofd, buffer, offset, length, position, wrapped_cb);
  }
}

function readFile(fs, context, path, options, callback) {
  callback = arguments[arguments.length - 1];
  options = validate_file_options(options, null, 'r');

  if(!pathCheck(path, callback)) return;

  var flags = validate_flags(options.flag || 'r');
  if(!flags) {
    return callback(new Errors.EINVAL('flags is not valid', path));
  }

  open_file(context, path, flags, function(err, fileNode) {
    if(err) {
      return callback(err);
    }
    var ofd = new OpenFileDescription(path, fileNode.id, flags, 0);
    var fd = fs.allocDescriptor(ofd);

    function cleanup() {
      fs.releaseDescriptor(fd);
    }

    fstat_file(context, ofd, function(err, fstatResult) {
      if(err) {
        cleanup();
        return callback(err);
      }

      var stats = new Stats(fstatResult, fs.name);

      if(stats.isDirectory()) {
        cleanup();
        return callback(new Errors.EISDIR('illegal operation on directory', path));
      }

      var size = stats.size;
      var buffer = new Buffer(size);
      buffer.fill(0);

      read_data(context, ofd, buffer, 0, size, 0, function(err, nbytes) {
        cleanup();

        if(err) {
          return callback(err);
        }

        var data;
        if(options.encoding === 'utf8') {
          data = Encoding.decode(buffer);
        } else {
          data = buffer;
        }
        callback(null, data);
      });
    });
  });
}

function write(fs, context, fd, buffer, offset, length, position, callback) {
  callback = arguments[arguments.length - 1];
  offset = (undefined === offset) ? 0 : offset;
  length = (undefined === length) ? buffer.length - offset : length;

  var ofd = fs.openFiles[fd];
  if(!ofd) {
    callback(new Errors.EBADF());
  } else if(!_(ofd.flags).contains(O_WRITE)) {
    callback(new Errors.EBADF('descriptor does not permit writing'));
  } else if(buffer.length - offset < length) {
    callback(new Errors.EIO('intput buffer is too small'));
  } else {
    write_data(context, ofd, buffer, offset, length, position, callback);
  }
}

function writeFile(fs, context, path, data, options, callback) {
  callback = arguments[arguments.length - 1];
  options = validate_file_options(options, 'utf8', 'w');

  if(!pathCheck(path, callback)) return;

  var flags = validate_flags(options.flag || 'w');
  if(!flags) {
    return callback(new Errors.EINVAL('flags is not valid', path));
  }

  data = data || '';
  if(typeof data === "number") {
    data = '' + data;
  }
  if(typeof data === "string" && options.encoding === 'utf8') {
    data = Encoding.encode(data);
  }

  open_file(context, path, flags, function(err, fileNode) {
    if(err) {
      return callback(err);
    }
    var ofd = new OpenFileDescription(path, fileNode.id, flags, 0);
    var fd = fs.allocDescriptor(ofd);

    replace_data(context, ofd, data, 0, data.length, function(err, nbytes) {
      fs.releaseDescriptor(fd);

      if(err) {
        return callback(err);
      }
      callback(null);
    });
  });
}

function appendFile(fs, context, path, data, options, callback) {
  callback = arguments[arguments.length - 1];
  options = validate_file_options(options, 'utf8', 'a');

  if(!pathCheck(path, callback)) return;

  var flags = validate_flags(options.flag || 'a');
  if(!flags) {
    return callback(new Errors.EINVAL('flags is not valid', path));
  }

  data = data || '';
  if(typeof data === "number") {
    data = '' + data;
  }
  if(typeof data === "string" && options.encoding === 'utf8') {
    data = Encoding.encode(data);
  }

  open_file(context, path, flags, function(err, fileNode) {
    if(err) {
      return callback(err);
    }
    var ofd = new OpenFileDescription(path, fileNode.id, flags, fileNode.size);
    var fd = fs.allocDescriptor(ofd);

    write_data(context, ofd, data, 0, data.length, ofd.position, function(err, nbytes) {
      fs.releaseDescriptor(fd);

      if(err) {
        return callback(err);
      }
      callback(null);
    });
  });
}

function exists(fs, context, path, callback) {
  function cb(err, stats) {
    callback(err ? false : true);
  }
  stat(fs, context, path, cb);
}

function getxattr(fs, context, path, name, callback) {
  if (!pathCheck(path, callback)) return;
  getxattr_file(context, path, name, callback);
}

function fgetxattr(fs, context, fd, name, callback) {
  var ofd = fs.openFiles[fd];
  if (!ofd) {
    callback(new Errors.EBADF());
  }
  else {
    fgetxattr_file(context, ofd, name, callback);
  }
}

function setxattr(fs, context, path, name, value, flag, callback) {
  if(typeof flag === 'function') {
    callback = flag;
    flag = null;
  }

  if (!pathCheck(path, callback)) return;
  setxattr_file(context, path, name, value, flag, callback);
}

function fsetxattr(fs, context, fd, name, value, flag, callback) {
  if(typeof flag === 'function') {
    callback = flag;
    flag = null;
  }

  var ofd = fs.openFiles[fd];
  if (!ofd) {
    callback(new Errors.EBADF());
  }
  else if (!_(ofd.flags).contains(O_WRITE)) {
    callback(new Errors.EBADF('descriptor does not permit writing'));
  }
  else {
    fsetxattr_file(context, ofd, name, value, flag, callback);
  }
}

function removexattr(fs, context, path, name, callback) {
  if (!pathCheck(path, callback)) return;
  removexattr_file(context, path, name, callback);
}

function fremovexattr(fs, context, fd, name, callback) {
  var ofd = fs.openFiles[fd];
  if (!ofd) {
    callback(new Errors.EBADF());
  }
  else if (!_(ofd.flags).contains(O_WRITE)) {
    callback(new Errors.EBADF('descriptor does not permit writing'));
  }
  else {
    fremovexattr_file(context, ofd, name, callback);
  }
}

function lseek(fs, context, fd, offset, whence, callback) {
  function update_descriptor_position(error, stats) {
    if(error) {
      callback(error);
    } else {
      if(stats.size + offset < 0) {
        callback(new Errors.EINVAL('resulting file offset would be negative'));
      } else {
        ofd.position = stats.size + offset;
        callback(null, ofd.position);
      }
    }
  }

  var ofd = fs.openFiles[fd];
  if(!ofd) {
    callback(new Errors.EBADF());
  }

  if('SET' === whence) {
    if(offset < 0) {
      callback(new Errors.EINVAL('resulting file offset would be negative'));
    } else {
      ofd.position = offset;
      callback(null, ofd.position);
    }
  } else if('CUR' === whence) {
    if(ofd.position + offset < 0) {
      callback(new Errors.EINVAL('resulting file offset would be negative'));
    } else {
      ofd.position += offset;
      callback(null, ofd.position);
    }
  } else if('END' === whence) {
    fstat_file(context, ofd, update_descriptor_position);
  } else {
    callback(new Errors.EINVAL('whence argument is not a proper value'));
  }
}

function readdir(fs, context, path, callback) {
  if(!pathCheck(path, callback)) return;
  read_directory(context, path, callback);
}

function utimes(fs, context, path, atime, mtime, callback) {
  if(!pathCheck(path, callback)) return;

  var currentTime = Date.now();
  atime = (atime) ? atime : currentTime;
  mtime = (mtime) ? mtime : currentTime;

  utimes_file(context, path, atime, mtime, callback);
}

function futimes(fs, context, fd, atime, mtime, callback) {
  var currentTime = Date.now();
  atime = (atime) ? atime : currentTime;
  mtime = (mtime) ? mtime : currentTime;

  var ofd = fs.openFiles[fd];
  if(!ofd) {
    callback(new Errors.EBADF());
  } else if(!_(ofd.flags).contains(O_WRITE)) {
    callback(new Errors.EBADF('descriptor does not permit writing'));
  } else {
    futimes_file(context, ofd, atime, mtime, callback);
  }
}

function rename(fs, context, oldpath, newpath, callback) {
  if(!pathCheck(oldpath, callback)) return;
  if(!pathCheck(newpath, callback)) return;

  oldpath = normalize(oldpath);
  newpath = normalize(newpath);

  var oldParentPath = Path.dirname(oldpath);
  var newParentPath = Path.dirname(oldpath);
  var oldName = Path.basename(oldpath);
  var newName = Path.basename(newpath);
  var oldParentDirectory, oldParentData;
  var newParentDirectory, newParentData;

  function update_times(error, newNode) {
    if(error) {
      callback(error);
    } else {
      update_node_times(context, newpath,  newNode, { ctime: Date.now() }, callback);
    }
  }

  function read_new_directory(error) {
    if(error) {
      callback(error);
    } else {
      context.getObject(newParentData[newName].id, update_times);
    }
  }

  function update_old_parent_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      if(oldParentDirectory.id === newParentDirectory.id) {
        oldParentData = newParentData;
      }
      delete oldParentData[oldName];
      context.putObject(oldParentDirectory.data, oldParentData, read_new_directory);
    }
  }

  function update_new_parent_directory_data(error) {
    if(error) {
      callback(error);
    } else {
      newParentData[newName] = oldParentData[oldName];
      context.putObject(newParentDirectory.data, newParentData, update_old_parent_directory_data);
    }
  }

  function check_if_new_directory_exists(error, result) {
    if(error) {
      callback(error);
    } else {
      newParentData = result;
      if(_(newParentData).has(newName)) {
        remove_directory(context, newpath, update_new_parent_directory_data);
      } else {
        update_new_parent_directory_data();
      }
    }
  }

  function read_new_parent_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      newParentDirectory = result;
      context.getObject(newParentDirectory.data, check_if_new_directory_exists);
    }
  }

  function get_new_parent_directory(error, result) {
    if(error) {
      callback(error);
    } else {
      oldParentData = result;
      find_node(context, newParentPath, read_new_parent_directory_data);
    }
  }

  function read_parent_directory_data(error, result) {
    if(error) {
      callback(error);
    } else {
      oldParentDirectory = result;
      context.getObject(result.data, get_new_parent_directory);
    }
  }

  function unlink_old_file(error) {
    if(error) {
      callback(error);
    } else {
      unlink_node(context, oldpath, callback);
    }
  }

  function check_node_type(error, node) {
    if(error) {
      callback(error);
    } else if(node.mode === 'DIRECTORY') {
      find_node(context, oldParentPath, read_parent_directory_data);
    } else {
      link_node(context, oldpath, newpath, unlink_old_file);
    }
  }

  find_node(context, oldpath, check_node_type);
}

function symlink(fs, context, srcpath, dstpath, type, callback) {
  // NOTE: we support passing the `type` arg, but ignore it.
  callback = arguments[arguments.length - 1];
  if(!pathCheck(srcpath, callback)) return;
  if(!pathCheck(dstpath, callback)) return;
  make_symbolic_link(context, srcpath, dstpath, callback);
}

function readlink(fs, context, path, callback) {
  if(!pathCheck(path, callback)) return;
  read_link(context, path, callback);
}

function lstat(fs, context, path, callback) {
  if(!pathCheck(path, callback)) return;

  function check_result(error, result) {
    if(error) {
      callback(error);
    } else {
      var stats = new Stats(result, fs.name);
      callback(null, stats);
    }
  }

  lstat_file(context, path, check_result);
}

function truncate(fs, context, path, length, callback) {
  // NOTE: length is optional
  callback = arguments[arguments.length - 1];
  length = length || 0;

  if(!pathCheck(path, callback)) return;
  truncate_file(context, path, length, callback);
}

function ftruncate(fs, context, fd, length, callback) {
  // NOTE: length is optional
  callback = arguments[arguments.length - 1];
  length = length || 0;

  var ofd = fs.openFiles[fd];
  if(!ofd) {
    callback(new Errors.EBADF());
  } else if(!_(ofd.flags).contains(O_WRITE)) {
    callback(new Errors.EBADF('descriptor does not permit writing'));
  } else {
    ftruncate_file(context, ofd, length, callback);
  }
}

module.exports = {
  ensureRootDirectory: ensure_root_directory,
  open: open,
  close: close,
  mknod: mknod,
  mkdir: mkdir,
  rmdir: rmdir,
  unlink: unlink,
  stat: stat,
  fstat: fstat,
  link: link,
  read: read,
  readFile: readFile,
  write: write,
  writeFile: writeFile,
  appendFile: appendFile,
  exists: exists,
  getxattr: getxattr,
  fgetxattr: fgetxattr,
  setxattr: setxattr,
  fsetxattr: fsetxattr,
  removexattr: removexattr,
  fremovexattr: fremovexattr,
  lseek: lseek,
  readdir: readdir,
  utimes: utimes,
  futimes: futimes,
  rename: rename,
  symlink: symlink,
  readlink: readlink,
  lstat: lstat,
  truncate: truncate,
  ftruncate: ftruncate
};

},{"../../lib/nodash.js":13,"../buffer.js":15,"../constants.js":16,"../directory-entry.js":17,"../encoding.js":18,"../errors.js":19,"../node.js":24,"../open-file-description.js":25,"../path.js":26,"../stats.js":34,"../super-node.js":35}],21:[function(require,module,exports){
var _ = require('../../lib/nodash.js');

var isNullPath = require('../path.js').isNull;
var nop = require('../shared.js').nop;

var Constants = require('../constants.js');
var FILE_SYSTEM_NAME = Constants.FILE_SYSTEM_NAME;
var FS_FORMAT = Constants.FS_FORMAT;
var FS_READY = Constants.FS_READY;
var FS_PENDING = Constants.FS_PENDING;
var FS_ERROR = Constants.FS_ERROR;
var FS_NODUPEIDCHECK = Constants.FS_NODUPEIDCHECK;

var providers = require('../providers/index.js');

var Shell = require('../shell/shell.js');
var Intercom = require('../../lib/intercom.js');
var FSWatcher = require('../fs-watcher.js');
var Errors = require('../errors.js');
var defaultGuidFn = require('../shared.js').guid;

var STDIN = Constants.STDIN;
var STDOUT = Constants.STDOUT;
var STDERR = Constants.STDERR;
var FIRST_DESCRIPTOR = Constants.FIRST_DESCRIPTOR;

// The core fs operations live on impl
var impl = require('./implementation.js');

// node.js supports a calling pattern that leaves off a callback.
function maybeCallback(callback) {
  if(typeof callback === "function") {
    return callback;
  }
  return function(err) {
    if(err) {
      throw err;
    }
  };
}

// Default callback that logs an error if passed in
function defaultCallback(err) {
  if(err) {
    console.error('Filer error: ', err);
  }
}

/**
 * FileSystem
 *
 * A FileSystem takes an `options` object, which can specify a number of,
 * options.  All options are optional, and include:
 *
 * name: the name of the file system, defaults to "local"
 *
 * flags: one or more flags to use when creating/opening the file system.
 *        For example: "FORMAT" will cause the file system to be formatted.
 *        No explicit flags are set by default.
 *
 * provider: an explicit storage provider to use for the file
 *           system's database context provider.  A number of context
 *           providers are included (see /src/providers), and users
 *           can write one of their own and pass it in to be used.
 *           By default an IndexedDB provider is used.
 *
 * guid: a function for generating unique IDs for nodes in the filesystem.
 *       Use this to override the built-in UUID generation. (Used mainly for tests).
 *
 * callback: a callback function to be executed when the file system becomes
 *           ready for use. Depending on the context provider used, this might
 *           be right away, or could take some time. The callback should expect
 *           an `error` argument, which will be null if everything worked.  Also
 *           users should check the file system's `readyState` and `error`
 *           properties to make sure it is usable.
 */
function FileSystem(options, callback) {
  options = options || {};
  callback = callback || defaultCallback;

  var flags = options.flags;
  var guid = options.guid ? options.guid : defaultGuidFn;
  var provider = options.provider || new providers.Default(options.name || FILE_SYSTEM_NAME);
  // If we're given a provider, match its name unless we get an explicit name
  var name = options.name || provider.name;
  var forceFormatting = _(flags).contains(FS_FORMAT);

  var fs = this;
  fs.readyState = FS_PENDING;
  fs.name = name;
  fs.error = null;

  fs.stdin = STDIN;
  fs.stdout = STDOUT;
  fs.stderr = STDERR;

  // Expose Shell constructor
  this.Shell = Shell.bind(undefined, this);

  // Safely expose the list of open files and file
  // descriptor management functions
  var openFiles = {};
  var nextDescriptor = FIRST_DESCRIPTOR;
  Object.defineProperty(this, "openFiles", {
    get: function() { return openFiles; }
  });
  this.allocDescriptor = function(openFileDescription) {
    var fd = nextDescriptor ++;
    openFiles[fd] = openFileDescription;
    return fd;
  };
  this.releaseDescriptor = function(fd) {
    delete openFiles[fd];
  };

  // Safely expose the operation queue
  var queue = [];
  this.queueOrRun = function(operation) {
    var error;

    if(FS_READY == fs.readyState) {
      operation.call(fs);
    } else if(FS_ERROR == fs.readyState) {
      error = new Errors.EFILESYSTEMERROR('unknown error');
    } else {
      queue.push(operation);
    }

    return error;
  };
  function runQueued() {
    queue.forEach(function(operation) {
      operation.call(this);
    }.bind(fs));
    queue = null;
  }

  // We support the optional `options` arg from node, but ignore it
  this.watch = function(filename, options, listener) {
    if(isNullPath(filename)) {
      throw new Error('Path must be a string without null bytes.');
    }
    if(typeof options === 'function') {
      listener = options;
      options = {};
    }
    options = options || {};
    listener = listener || nop;

    var watcher = new FSWatcher();
    watcher.start(filename, false, options.recursive);
    watcher.on('change', listener);

    return watcher;
  };

  // Deal with various approaches to node ID creation
  function wrappedGuidFn(context) {
    return function(callback) {
      // Skip the duplicate ID check if asked to
      if(_(flags).contains(FS_NODUPEIDCHECK)) {
        callback(null, guid());
        return;
      }

      // Otherwise (default) make sure this id is unused first
      function guidWithCheck(callback) {
        var id = guid();
        context.getObject(id, function(err, value) {
          if(err) {
            callback(err);
            return;
          }

          // If this id is unused, use it, otherwise find another
          if(!value) {
            callback(null, id);
          } else {
            guidWithCheck(callback);
          }
        });
      }
      guidWithCheck(callback);
    };
  }

  // Let other instances (in this or other windows) know about
  // any changes to this fs instance.
  function broadcastChanges(changes) {
    if(!changes.length) {
      return;
    }
    var intercom = Intercom.getInstance();
    changes.forEach(function(change) {
      intercom.emit(change.event, change.path);
    });
  }

  // Open file system storage provider
  provider.open(function(err) {
    function complete(error) {
      function wrappedContext(methodName) {
        var context = provider[methodName]();
        context.flags = flags;
        context.changes = [];
        context.guid = wrappedGuidFn(context);

        // When the context is finished, let the fs deal with any change events
        context.close = function() {
          var changes = context.changes;
          broadcastChanges(changes);
          changes.length = 0;
        };

        return context;
      }

      // Wrap the provider so we can extend the context with fs flags and
      // an array of changes (e.g., watch event 'change' and 'rename' events
      // for paths updated during the lifetime of the context). From this
      // point forward we won't call open again, so it's safe to drop it.
      fs.provider = {
        openReadWriteContext: function() {
          return wrappedContext('getReadWriteContext');
        },
        openReadOnlyContext: function() {
          return wrappedContext('getReadOnlyContext');
        }
      };

      if(error) {
        fs.readyState = FS_ERROR;
      } else {
        fs.readyState = FS_READY;
      }
      runQueued();
      callback(error, fs);
    }

    if(err) {
      return complete(err);
    }

    var context = provider.getReadWriteContext();
    context.guid = wrappedGuidFn(context);

    // Mount the filesystem, formatting if necessary
    if(forceFormatting) {
      // Wipe the storage provider, then write root block
      context.clear(function(err) {
        if(err) {
          return complete(err);
        }
        impl.ensureRootDirectory(context, complete);
      });
    } else {
      // Use existing (or create new) root and mount
      impl.ensureRootDirectory(context, complete);
    }
  });
}

// Expose storage providers on FileSystem constructor
FileSystem.providers = providers;

/**
 * Public API for FileSystem
 */
[
  'open',
  'close',
  'mknod',
  'mkdir',
  'rmdir',
  'stat',
  'fstat',
  'link',
  'unlink',
  'read',
  'readFile',
  'write',
  'writeFile',
  'appendFile',
  'exists',
  'lseek',
  'readdir',
  'rename',
  'readlink',
  'symlink',
  'lstat',
  'truncate',
  'ftruncate',
  'utimes',
  'futimes',
  'setxattr',
  'getxattr',
  'fsetxattr',
  'fgetxattr',
  'removexattr',
  'fremovexattr'
].forEach(function(methodName) {
  FileSystem.prototype[methodName] = function() {
    var fs = this;
    var args = Array.prototype.slice.call(arguments, 0);
    var lastArgIndex = args.length - 1;

    // We may or may not get a callback, and since node.js supports
    // fire-and-forget style fs operations, we have to dance a bit here.
    var missingCallback = typeof args[lastArgIndex] !== 'function';
    var callback = maybeCallback(args[lastArgIndex]);

    var error = fs.queueOrRun(function() {
      var context = fs.provider.openReadWriteContext();

      // Fail early if the filesystem is in an error state (e.g.,
      // provider failed to open.
      if(FS_ERROR === fs.readyState) {
        var err = new Errors.EFILESYSTEMERROR('filesystem unavailable, operation canceled');
        return callback.call(fs, err);
      }

      // Wrap the callback so we can explicitly close the context
      function complete() {
        context.close();
        callback.apply(fs, arguments);
      }

      // Either add or replace the callback with our wrapper complete()
      if(missingCallback) {
        args.push(complete);
      } else {
        args[lastArgIndex] = complete;
      }

      // Forward this call to the impl's version, using the following
      // call signature, with complete() as the callback/last-arg now:
      // fn(fs, context, arg0, arg1, ... , complete);
      var fnArgs = [fs, context].concat(args);
      impl[methodName].apply(null, fnArgs);
    });
    if(error) {
      callback(error);
    }
  };
});

module.exports = FileSystem;

},{"../../lib/intercom.js":12,"../../lib/nodash.js":13,"../constants.js":16,"../errors.js":19,"../fs-watcher.js":22,"../path.js":26,"../providers/index.js":27,"../shared.js":31,"../shell/shell.js":33,"./implementation.js":20}],22:[function(require,module,exports){
var EventEmitter = require('../lib/eventemitter.js');
var Path = require('./path.js');
var Intercom = require('../lib/intercom.js');

/**
 * FSWatcher based on node.js' FSWatcher
 * see https://github.com/joyent/node/blob/master/lib/fs.js
 */
function FSWatcher() {
  EventEmitter.call(this);
  var self = this;
  var recursive = false;
  var recursivePathPrefix;
  var filename;

  function onchange(path) {
    // Watch for exact filename, or parent path when recursive is true.
    if(filename === path || (recursive && path.indexOf(recursivePathPrefix) === 0)) {
      self.trigger('change', 'change', path);
    }
  }

  // We support, but ignore the second arg, which node.js uses.
  self.start = function(filename_, persistent_, recursive_) {
    // Bail if we've already started (and therefore have a filename);
    if(filename) {
      return;
    }

    if(Path.isNull(filename_)) {
      throw new Error('Path must be a string without null bytes.');
    }

    // TODO: get realpath for symlinks on filename...

    // Filer's Path.normalize strips trailing slashes, which we use here.
    // See https://github.com/js-platform/filer/issues/105
    filename = Path.normalize(filename_);

    // Whether to watch beneath this path or not
    recursive = recursive_ === true;
    // If recursive, construct a path prefix portion for comparisons later
    // (i.e., '/path' becomes '/path/' so we can search within a filename for the
    // prefix). We also take care to allow for '/' on its own.
    if(recursive) {
      recursivePathPrefix = filename === '/' ? '/' : filename + '/';
    }

    var intercom = Intercom.getInstance();
    intercom.on('change', onchange);
  };

  self.close = function() {
    var intercom = Intercom.getInstance();
    intercom.off('change', onchange);
    self.removeAllListeners('change');
  };
}
FSWatcher.prototype = new EventEmitter();
FSWatcher.prototype.constructor = FSWatcher;

module.exports = FSWatcher;

},{"../lib/eventemitter.js":11,"../lib/intercom.js":12,"./path.js":26}],23:[function(require,module,exports){
module.exports = {
  FileSystem: require('./filesystem/interface.js'),
  Buffer: require('./buffer.js'),
  Path: require('./path.js'),
  Errors: require('./errors.js'),
  Shell: require('./shell/shell.js')
};

},{"./buffer.js":15,"./errors.js":19,"./filesystem/interface.js":21,"./path.js":26,"./shell/shell.js":33}],24:[function(require,module,exports){
var MODE_FILE = require('./constants.js').MODE_FILE;

function Node(options) {
  var now = Date.now();

  this.id = options.id;
  this.mode = options.mode || MODE_FILE;  // node type (file, directory, etc)
  this.size = options.size || 0; // size (bytes for files, entries for directories)
  this.atime = options.atime || now; // access time (will mirror ctime after creation)
  this.ctime = options.ctime || now; // creation/change time
  this.mtime = options.mtime || now; // modified time
  this.flags = options.flags || []; // file flags
  this.xattrs = options.xattrs || {}; // extended attributes
  this.nlinks = options.nlinks || 0; // links count
  this.version = options.version || 0; // node version
  this.blksize = undefined; // block size
  this.nblocks = 1; // blocks count
  this.data = options.data; // id for data object
}

// Make sure the options object has an id on property,
// either from caller or one we generate using supplied guid fn.
function ensureID(options, prop, callback) {
  if(options[prop]) {
    callback(null);
  } else {
    options.guid(function(err, id) {
      options[prop] = id;
      callback(err);
    });
  }
}

Node.create = function(options, callback) {
  // We expect both options.id and options.data to be provided/generated.
  ensureID(options, 'id', function(err) {
    if(err) {
      callback(err);
      return;
    }

    ensureID(options, 'data', function(err) {
      if(err) {
        callback(err);
        return;
      }

      callback(null, new Node(options));
    });
  });
};

module.exports = Node;

},{"./constants.js":16}],25:[function(require,module,exports){
var Errors = require('./errors.js');

function OpenFileDescription(path, id, flags, position) {
  this.path = path;
  this.id = id;
  this.flags = flags;
  this.position = position;
}

// Tries to find the node associated with an ofd's `id`.
// If not found, an error is returned on the callback.
OpenFileDescription.prototype.getNode = function(context, callback) {
  var id = this.id;
  var path = this.path;

  function check_if_node_exists(error, node) {
    if(error) {
      return callback(error);
    }

    if(!node) {
      return callback(new Errors.EBADF('file descriptor refers to unknown node', path));
    }

    callback(null, node);
  }

  context.getObject(id, check_if_node_exists);
};

module.exports = OpenFileDescription;

},{"./errors.js":19}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Based on https://github.com/joyent/node/blob/41e53e557992a7d552a8e23de035f9463da25c99/lib/path.js

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
      /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
var splitPath = function(filename) {
  var result = splitPathRe.exec(filename);
  return [result[1] || '', result[2] || '', result[3] || '', result[4] || ''];
};

// path.resolve([from ...], to)
function resolve() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    // XXXfiler: we don't have process.cwd() so we use '/' as a fallback
    var path = (i >= 0) ? arguments[i] : '/';

    // Skip empty and invalid entries
    if (typeof path !== 'string' || !path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}

// path.normalize(path)
function normalize(path) {
  var isAbsolute = path.charAt(0) === '/',
      trailingSlash = path.substr(-1) === '/';

  // Normalize the path
  path = normalizeArray(path.split('/').filter(function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  /*
   if (path && trailingSlash) {
   path += '/';
   }
   */

  return (isAbsolute ? '/' : '') + path;
}

function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(paths.filter(function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
}

// path.relative(from, to)
function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
}

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  // XXXfiler: node.js just does `return f`
  return f === "" ? "/" : f;
}

function extname(path) {
  return splitPath(path)[3];
}

function isAbsolute(path) {
  if(path.charAt(0) === '/') {
    return true;
  }
  return false;
}

function isNull(path) {
  if (('' + path).indexOf('\u0000') !== -1) {
    return true;
  }
  return false;
}

// Make sure we don't double-add a trailing slash (e.g., '/' -> '//')
function addTrailing(path) {
  return path.replace(/\/*$/, '/');
}

// Deal with multiple slashes at the end, one, or none
// and make sure we don't return the empty string.
function removeTrailing(path) {
  path = path.replace(/\/*$/, '');
  return path === '' ? '/' : path;
}

// XXXfiler: we don't support path.exists() or path.existsSync(), which
// are deprecated, and need a FileSystem instance to work. Use fs.stat().

module.exports = {
  normalize: normalize,
  resolve: resolve,
  join: join,
  relative: relative,
  sep: '/',
  delimiter: ':',
  dirname: dirname,
  basename: basename,
  extname: extname,
  isAbsolute: isAbsolute,
  isNull: isNull,
  // Non-node but useful...
  addTrailing: addTrailing,
  removeTrailing: removeTrailing
};

},{}],27:[function(require,module,exports){
var IndexedDB = require('./indexeddb.js');
var WebSQL = require('./websql.js');
var Memory = require('./memory.js');

module.exports = {
  IndexedDB: IndexedDB,
  WebSQL: WebSQL,
  Memory: Memory,

  /**
   * Convenience Provider references
   */

  // The default provider to use when none is specified
  Default: IndexedDB,

  // The Fallback provider does automatic fallback checks
  Fallback: (function() {
    if(IndexedDB.isSupported()) {
      return IndexedDB;
    }

    if(WebSQL.isSupported()) {
      return WebSQL;
    }

    function NotSupported() {
      throw "[Filer Error] Your browser doesn't support IndexedDB or WebSQL.";
    }
    NotSupported.isSupported = function() {
      return false;
    };
    return NotSupported;
  }())
};

},{"./indexeddb.js":28,"./memory.js":29,"./websql.js":30}],28:[function(require,module,exports){
(function (global,Buffer){
var FILE_SYSTEM_NAME = require('../constants.js').FILE_SYSTEM_NAME;
var FILE_STORE_NAME = require('../constants.js').FILE_STORE_NAME;
var IDB_RW = require('../constants.js').IDB_RW;
var IDB_RO = require('../constants.js').IDB_RO;
var Errors = require('../errors.js');
var FilerBuffer = require('../buffer.js');

var indexedDB = global.indexedDB       ||
                global.mozIndexedDB    ||
                global.webkitIndexedDB ||
                global.msIndexedDB;

function IndexedDBContext(db, mode) {
  var transaction = db.transaction(FILE_STORE_NAME, mode);
  this.objectStore = transaction.objectStore(FILE_STORE_NAME);
}

IndexedDBContext.prototype.clear = function(callback) {
  try {
    var request = this.objectStore.clear();
    request.onsuccess = function(event) {
      callback();
    };
    request.onerror = function(error) {
      callback(error);
    };
  } catch(e) {
    callback(e);
  }
};

function _get(objectStore, key, callback) {
  try {
    var request = objectStore.get(key);
    request.onsuccess = function onsuccess(event) {
      var result = event.target.result;
      callback(null, result);
    };
    request.onerror = function onerror(error) {
      callback(error);
    };
  } catch(e) {
    callback(e);
  }
}
IndexedDBContext.prototype.getObject = function(key, callback) {
  _get(this.objectStore, key, callback);
};
IndexedDBContext.prototype.getBuffer = function(key, callback) {
  _get(this.objectStore, key, function(err, arrayBuffer) {
    if(err) {
      return callback(err);
    }
    callback(null, new FilerBuffer(arrayBuffer));
  });
};

function _put(objectStore, key, value, callback) {
  try {
    var request = objectStore.put(value, key);
    request.onsuccess = function onsuccess(event) {
      var result = event.target.result;
      callback(null, result);
    };
    request.onerror = function onerror(error) {
      callback(error);
    };
  } catch(e) {
    callback(e);
  }
}
IndexedDBContext.prototype.putObject = function(key, value, callback) {
  _put(this.objectStore, key, value, callback);
};
IndexedDBContext.prototype.putBuffer = function(key, uint8BackedBuffer, callback) {
  var buf;
  if(!Buffer._useTypedArrays) { // workaround for fxos 1.3
    buf = uint8BackedBuffer.toArrayBuffer();
  } else {
    buf = uint8BackedBuffer.buffer;
  }
  _put(this.objectStore, key, buf, callback);
};

IndexedDBContext.prototype.delete = function(key, callback) {
  try {
    var request = this.objectStore.delete(key);
    request.onsuccess = function onsuccess(event) {
      var result = event.target.result;
      callback(null, result);
    };
    request.onerror = function(error) {
      callback(error);
    };
  } catch(e) {
    callback(e);
  }
};


function IndexedDB(name) {
  this.name = name || FILE_SYSTEM_NAME;
  this.db = null;
}
IndexedDB.isSupported = function() {
  return !!indexedDB;
};

IndexedDB.prototype.open = function(callback) {
  var that = this;

  // Bail if we already have a db open
  if(that.db) {
    return callback();
  }

  // NOTE: we're not using versioned databases.
  var openRequest = indexedDB.open(that.name);

  // If the db doesn't exist, we'll create it
  openRequest.onupgradeneeded = function onupgradeneeded(event) {
    var db = event.target.result;

    if(db.objectStoreNames.contains(FILE_STORE_NAME)) {
      db.deleteObjectStore(FILE_STORE_NAME);
    }
    db.createObjectStore(FILE_STORE_NAME);
  };

  openRequest.onsuccess = function onsuccess(event) {
    that.db = event.target.result;
    callback();
  };
  openRequest.onerror = function onerror(error) {
    callback(new Errors.EINVAL('IndexedDB cannot be accessed. If private browsing is enabled, disable it.'));
  };
};
IndexedDB.prototype.getReadOnlyContext = function() {
  // Due to timing issues in Chrome with readwrite vs. readonly indexeddb transactions
  // always use readwrite so we can make sure pending commits finish before callbacks.
  // See https://github.com/js-platform/filer/issues/128
  return new IndexedDBContext(this.db, IDB_RW);
};
IndexedDB.prototype.getReadWriteContext = function() {
  return new IndexedDBContext(this.db, IDB_RW);
};

module.exports = IndexedDB;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"../buffer.js":15,"../constants.js":16,"../errors.js":19,"buffer":4}],29:[function(require,module,exports){
var FILE_SYSTEM_NAME = require('../constants.js').FILE_SYSTEM_NAME;
// NOTE: prefer setImmediate to nextTick for proper recursion yielding.
// see https://github.com/js-platform/filer/pull/24
var asyncCallback = require('../../lib/async.js').setImmediate;

/**
 * Make shared in-memory DBs possible when using the same name.
 */
var createDB = (function() {
  var pool = {};
  return function getOrCreate(name) {
    if(!pool.hasOwnProperty(name)) {
      pool[name] = {};
    }
    return pool[name];
  };
}());

function MemoryContext(db, readOnly) {
  this.readOnly = readOnly;
  this.objectStore = db;
}

MemoryContext.prototype.clear = function(callback) {
  if(this.readOnly) {
    asyncCallback(function() {
      callback("[MemoryContext] Error: write operation on read only context");
    });
    return;
  }
  var objectStore = this.objectStore;
  Object.keys(objectStore).forEach(function(key){
    delete objectStore[key];
  });
  asyncCallback(callback);
};

// Memory context doesn't care about differences between Object and Buffer
MemoryContext.prototype.getObject =
MemoryContext.prototype.getBuffer =
function(key, callback) {
  var that = this;
  asyncCallback(function() {
    callback(null, that.objectStore[key]);
  });
};
MemoryContext.prototype.putObject =
MemoryContext.prototype.putBuffer =
function(key, value, callback) {
  if(this.readOnly) {
    asyncCallback(function() {
      callback("[MemoryContext] Error: write operation on read only context");
    });
    return;
  }
  this.objectStore[key] = value;
  asyncCallback(callback);
};

MemoryContext.prototype.delete = function(key, callback) {
  if(this.readOnly) {
    asyncCallback(function() {
      callback("[MemoryContext] Error: write operation on read only context");
    });
    return;
  }
  delete this.objectStore[key];
  asyncCallback(callback);
};


function Memory(name) {
  this.name = name || FILE_SYSTEM_NAME;
}
Memory.isSupported = function() {
  return true;
};

Memory.prototype.open = function(callback) {
  this.db = createDB(this.name);
  asyncCallback(callback);
};
Memory.prototype.getReadOnlyContext = function() {
  return new MemoryContext(this.db, true);
};
Memory.prototype.getReadWriteContext = function() {
  return new MemoryContext(this.db, false);
};

module.exports = Memory;

},{"../../lib/async.js":10,"../constants.js":16}],30:[function(require,module,exports){
(function (global){
var FILE_SYSTEM_NAME = require('../constants.js').FILE_SYSTEM_NAME;
var FILE_STORE_NAME = require('../constants.js').FILE_STORE_NAME;
var WSQL_VERSION = require('../constants.js').WSQL_VERSION;
var WSQL_SIZE = require('../constants.js').WSQL_SIZE;
var WSQL_DESC = require('../constants.js').WSQL_DESC;
var Errors = require('../errors.js');
var FilerBuffer = require('../buffer.js');
var base64ArrayBuffer = require('base64-arraybuffer');

function WebSQLContext(db, isReadOnly) {
  var that = this;
  this.getTransaction = function(callback) {
    if(that.transaction) {
      callback(that.transaction);
      return;
    }
    // Either do readTransaction() (read-only) or transaction() (read/write)
    db[isReadOnly ? 'readTransaction' : 'transaction'](function(transaction) {
      that.transaction = transaction;
      callback(transaction);
    });
  };
}

WebSQLContext.prototype.clear = function(callback) {
  function onError(transaction, error) {
    callback(error);
  }
  function onSuccess(transaction, result) {
    callback(null);
  }
  this.getTransaction(function(transaction) {
    transaction.executeSql("DELETE FROM " + FILE_STORE_NAME + ";",
                           [], onSuccess, onError);
  });
};

function _get(getTransaction, key, callback) {
  function onSuccess(transaction, result) {
    // If the key isn't found, return null
    var value = result.rows.length === 0 ? null : result.rows.item(0).data;
    callback(null, value);
  }
  function onError(transaction, error) {
    callback(error);
  }
  getTransaction(function(transaction) {
    transaction.executeSql("SELECT data FROM " + FILE_STORE_NAME + " WHERE id = ? LIMIT 1;",
                           [key], onSuccess, onError);
  });
}
WebSQLContext.prototype.getObject = function(key, callback) {
  _get(this.getTransaction, key, function(err, result) {
    if(err) {
      return callback(err);
    }

    try {
      if(result) {
        result = JSON.parse(result);
      }
    } catch(e) {
      return callback(e);
    }

    callback(null, result);
  });
};
WebSQLContext.prototype.getBuffer = function(key, callback) {
  _get(this.getTransaction, key, function(err, result) {
    if(err) {
      return callback(err);
    }

    // Deal with zero-length ArrayBuffers, which will be encoded as ''
    if(result || result === '') {
      var arrayBuffer = base64ArrayBuffer.decode(result);
      result = new FilerBuffer(arrayBuffer);
    }

    callback(null, result);
  });
};

function _put(getTransaction, key, value, callback) {
  function onSuccess(transaction, result) {
    callback(null);
  }
  function onError(transaction, error) {
    callback(error);
  }
  getTransaction(function(transaction) {
    transaction.executeSql("INSERT OR REPLACE INTO " + FILE_STORE_NAME + " (id, data) VALUES (?, ?);",
                           [key, value], onSuccess, onError);
  });
}
WebSQLContext.prototype.putObject = function(key, value, callback) {
  var json = JSON.stringify(value);
  _put(this.getTransaction, key, json, callback);
};
WebSQLContext.prototype.putBuffer = function(key, uint8BackedBuffer, callback) {
  var base64 = base64ArrayBuffer.encode(uint8BackedBuffer.buffer);
  _put(this.getTransaction, key, base64, callback);
};

WebSQLContext.prototype.delete = function(key, callback) {
  function onSuccess(transaction, result) {
    callback(null);
  }
  function onError(transaction, error) {
    callback(error);
  }
  this.getTransaction(function(transaction) {
    transaction.executeSql("DELETE FROM " + FILE_STORE_NAME + " WHERE id = ?;",
                           [key], onSuccess, onError);
  });
};


function WebSQL(name) {
  this.name = name || FILE_SYSTEM_NAME;
  this.db = null;
}
WebSQL.isSupported = function() {
  return !!global.openDatabase;
};

WebSQL.prototype.open = function(callback) {
  var that = this;

  // Bail if we already have a db open
  if(that.db) {
    return callback();
  }

  var db = global.openDatabase(that.name, WSQL_VERSION, WSQL_DESC, WSQL_SIZE);
  if(!db) {
    callback("[WebSQL] Unable to open database.");
    return;
  }

  function onError(transaction, error) {
    if (error.code === 5) {
      callback(new Errors.EINVAL('WebSQL cannot be accessed. If private browsing is enabled, disable it.'));
    }
    callback(error);
  }
  function onSuccess(transaction, result) {
    that.db = db;
    callback();
  }

  // Create the table and index we'll need to store the fs data.
  db.transaction(function(transaction) {
    function createIndex(transaction) {
      transaction.executeSql("CREATE INDEX IF NOT EXISTS idx_" + FILE_STORE_NAME + "_id" +
                             " on " + FILE_STORE_NAME + " (id);",
                             [], onSuccess, onError);
    }
    transaction.executeSql("CREATE TABLE IF NOT EXISTS " + FILE_STORE_NAME + " (id unique, data TEXT);",
                           [], createIndex, onError);
  });
};
WebSQL.prototype.getReadOnlyContext = function() {
  return new WebSQLContext(this.db, true);
};
WebSQL.prototype.getReadWriteContext = function() {
  return new WebSQLContext(this.db, false);
};

module.exports = WebSQL;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../buffer.js":15,"../constants.js":16,"../errors.js":19,"base64-arraybuffer":1}],31:[function(require,module,exports){
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  }).toUpperCase();
}

function nop() {}

/**
 * Convert a Uint8Array to a regular array
 */
function u8toArray(u8) {
  var array = [];
  var len = u8.length;
  for(var i = 0; i < len; i++) {
    array[i] = u8[i];
  }
  return array;
}

module.exports = {
  guid: guid,
  u8toArray: u8toArray,
  nop: nop
};

},{}],32:[function(require,module,exports){
var defaults = require('../constants.js').ENVIRONMENT;

module.exports = function Environment(env) {
  env = env || {};
  env.TMP = env.TMP || defaults.TMP;
  env.PATH = env.PATH || defaults.PATH;

  this.get = function(name) {
    return env[name];
  };

  this.set = function(name, value) {
    env[name] = value;
  };
};

},{"../constants.js":16}],33:[function(require,module,exports){
var Path = require('../path.js');
var Errors = require('../errors.js');
var Environment = require('./environment.js');
var async = require('../../lib/async.js');
var Encoding = require('../encoding.js');
var minimatch = require('minimatch');

function Shell(fs, options) {
  options = options || {};

  var env = new Environment(options.env);
  var cwd = '/';

  /**
   * The bound FileSystem (cannot be changed)
   */
  Object.defineProperty(this, 'fs', {
    get: function() { return fs; },
    enumerable: true
  });

  /**
   * The shell's environment (e.g., for things like
   * path, tmp, and other env vars). Use env.get()
   * and env.set() to work with variables.
   */
  Object.defineProperty(this, 'env', {
    get: function() { return env; },
    enumerable: true
  });

  /**
   * Change the current working directory. We
   * include `cd` on the `this` vs. proto so that
   * we can access cwd without exposing it externally.
   */
  this.cd = function(path, callback) {
    path = Path.resolve(cwd, path);
    // Make sure the path actually exists, and is a dir
    fs.stat(path, function(err, stats) {
      if(err) {
        callback(new Errors.ENOTDIR(null, path));
        return;
      }
      if(stats.type === 'DIRECTORY') {
        cwd = path;
        callback();
      } else {
        callback(new Errors.ENOTDIR(null, path));
      }
    });
  };

  /**
   * Get the current working directory (changed with `cd()`)
   */
  this.pwd = function() {
    return cwd;
  };
}

/**
 * Execute the .js command located at `path`. Such commands
 * should assume the existence of 3 arguments, which will be
 * defined at runtime:
 *
 *   * fs - the current shell's bound filesystem object
 *   * args - a list of arguments for the command, or an empty list if none
 *   * callback - a callback function(error, result) to call when done.
 *
 * The .js command's contents should be the body of a function
 * that looks like this:
 *
 * function(fs, args, callback) {
 *   // .js code here
 * }
 */
Shell.prototype.exec = function(path, args, callback) {
  /* jshint evil:true */
  var sh = this;
  var fs = sh.fs;
  if(typeof args === 'function') {
    callback = args;
    args = [];
  }
  args = args || [];
  callback = callback || function(){};
  path = Path.resolve(sh.pwd(), path);

  fs.readFile(path, "utf8", function(error, data) {
    if(error) {
      callback(error);
      return;
    }
    try {
      var cmd = new Function('fs', 'args', 'callback', data);
      cmd(fs, args, callback);
    } catch(e) {
      callback(e);
    }
  });
};

/**
 * Create a file if it does not exist, or update access and
 * modified times if it does. Valid options include:
 *
 *  * updateOnly - whether to create the file if missing (defaults to false)
 *  * date - use the provided Date value instead of current date/time
 */
Shell.prototype.touch = function(path, options, callback) {
  var sh = this;
  var fs = sh.fs;
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  callback = callback || function(){};
  path = Path.resolve(sh.pwd(), path);

  function createFile(path) {
    fs.writeFile(path, '', callback);
  }

  function updateTimes(path) {
    var now = Date.now();
    var atime = options.date || now;
    var mtime = options.date || now;

    fs.utimes(path, atime, mtime, callback);
  }

  fs.stat(path, function(error, stats) {
    if(error) {
      if(options.updateOnly === true) {
        callback();
      } else {
        createFile(path);
      }
    } else {
      updateTimes(path);
    }
  });
};

/**
 * Concatenate multiple files into a single String, with each
 * file separated by a newline. The `files` argument should
 * be a String (path to single file) or an Array of Strings
 * (multiple file paths).
 */
Shell.prototype.cat = function(files, callback) {
  var sh = this;
  var fs = sh.fs;
  var all = '';
  callback = callback || function(){};

  if(!files) {
    callback(new Errors.EINVAL('Missing files argument'));
    return;
  }

  files = typeof files === 'string' ? [ files ] : files;

  function append(item, callback) {
    var filename = Path.resolve(sh.pwd(), item);
    fs.readFile(filename, 'utf8', function(error, data) {
      if(error) {
        callback(error);
        return;
      }
      all += data + '\n';
      callback();
    });
  }

  async.eachSeries(files, append, function(error) {
    if(error) {
      callback(error);
    } else {
      callback(null, all.replace(/\n$/, ''));
    }
  });
};

/**
 * Get the listing of a directory, returning an array of
 * file entries in the following form:
 *
 * {
 *   path: <String> the basename of the directory entry
 *   links: <Number> the number of links to the entry
 *   size: <Number> the size in bytes of the entry
 *   modified: <Number> the last modified date/time
 *   type: <String> the type of the entry
 *   contents: <Array> an optional array of child entries
 * }
 *
 * By default ls() gives a shallow listing. If you want
 * to follow directories as they are encountered, use
 * the `recursive=true` option.
 */
Shell.prototype.ls = function(dir, options, callback) {
  var sh = this;
  var fs = sh.fs;
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  callback = callback || function(){};

  if(!dir) {
    callback(new Errors.EINVAL('Missing dir argument'));
    return;
  }

  function list(path, callback) {
    var pathname = Path.resolve(sh.pwd(), path);
    var result = [];

    fs.readdir(pathname, function(error, entries) {
      if(error) {
        callback(error);
        return;
      }

      function getDirEntry(name, callback) {
        name = Path.join(pathname, name);
        fs.stat(name, function(error, stats) {
          if(error) {
            callback(error);
            return;
          }
          var entry = {
            path: Path.basename(name),
            links: stats.nlinks,
            size: stats.size,
            modified: stats.mtime,
            type: stats.type
          };

          if(options.recursive && stats.type === 'DIRECTORY') {
            list(Path.join(pathname, entry.path), function(error, items) {
              if(error) {
                callback(error);
                return;
              }
              entry.contents = items;
              result.push(entry);
              callback();
            });
          } else {
            result.push(entry);
            callback();
          }
        });
      }

      async.eachSeries(entries, getDirEntry, function(error) {
        callback(error, result);
      });
    });
  }

  list(dir, callback);
};

/**
 * Removes the file or directory at `path`. If `path` is a file
 * it will be removed. If `path` is a directory, it will be
 * removed if it is empty, otherwise the callback will receive
 * an error. In order to remove non-empty directories, use the
 * `recursive=true` option.
 */
Shell.prototype.rm = function(path, options, callback) {
  var sh = this;
  var fs = sh.fs;
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  callback = callback || function(){};

  if(!path) {
    callback(new Errors.EINVAL('Missing path argument'));
    return;
  }

  function remove(pathname, callback) {
    pathname = Path.resolve(sh.pwd(), pathname);
    fs.stat(pathname, function(error, stats) {
      if(error) {
        callback(error);
        return;
      }

      // If this is a file, delete it and we're done
      if(stats.type === 'FILE') {
        fs.unlink(pathname, callback);
        return;
      }

      // If it's a dir, check if it's empty
      fs.readdir(pathname, function(error, entries) {
        if(error) {
          callback(error);
          return;
        }

        // If dir is empty, delete it and we're done
        if(entries.length === 0) {
          fs.rmdir(pathname, callback);
          return;
        }

        // If not, see if we're allowed to delete recursively
        if(!options.recursive) {
          callback(new Errors.ENOTEMPTY(null, pathname));
          return;
        }

        // Remove each dir entry recursively, then delete the dir.
        entries = entries.map(function(filename) {
          // Root dir entries absolutely
          return Path.join(pathname, filename);
        });
        async.eachSeries(entries, remove, function(error) {
          if(error) {
            callback(error);
            return;
          }
          fs.rmdir(pathname, callback);
        });
      });
    });
  }

  remove(path, callback);
};

/**
 * Gets the path to the temporary directory, creating it if not
 * present. The directory used is the one specified in
 * env.TMP. The callback receives (error, tempDirName).
 */
Shell.prototype.tempDir = function(callback) {
  var sh = this;
  var fs = sh.fs;
  var tmp = sh.env.get('TMP');
  callback = callback || function(){};

  // Try and create it, and it will either work or fail
  // but either way it's now there.
  fs.mkdir(tmp, function(err) {
    callback(null, tmp);
  });
};

/**
 * Recursively creates the directory at `path`. If the parent
 * of `path` does not exist, it will be created.
 * Based off EnsureDir by Sam X. Xu
 * https://www.npmjs.org/package/ensureDir
 * MIT License
 */
Shell.prototype.mkdirp = function(path, callback) {
  var sh = this;
  var fs = sh.fs;
  callback = callback || function(){};

  if(!path) {
    callback(new Errors.EINVAL('Missing path argument'));
    return;
  }
  else if (path === '/') {
    callback();
    return;
  }
  function _mkdirp(path, callback) {
    fs.stat(path, function (err, stat) {
      if(stat) {
        if(stat.isDirectory()) {
          callback();
          return;
        }
        else if (stat.isFile()) {
          callback(new Errors.ENOTDIR(null, path));
          return;
        }
      }
      else if (err && err.code !== 'ENOENT') {
        callback(err);
        return;
      }
      else {
        var parent = Path.dirname(path);
        if(parent === '/') {
          fs.mkdir(path, function (err) {
            if (err && err.code != 'EEXIST') {
              callback(err);
              return;
            }
            callback();
            return;
          });
        }
        else {
          _mkdirp(parent, function (err) {
            if (err) return callback(err);
            fs.mkdir(path, function (err) {
              if (err && err.code != 'EEXIST') {
                callback(err);
                return;
              }
              callback();
              return;
            });
          });
        }
      }
    });
  }

  _mkdirp(path, callback);
};

/**
 * Recursively walk a directory tree, reporting back all paths
 * that were found along the way. The `path` must be a dir.
 * Valid options include a `regex` for pattern matching paths
 * and an `exec` function of the form `function(path, next)` where
 * `path` is the current path that was found (dir paths have an '/'
 * appended) and `next` is a callback to call when done processing
 * the current path, passing any error object back as the first argument.
 * `find` returns a flat array of absolute paths for all matching/found
 * paths as the final argument to the callback.
 */
 Shell.prototype.find = function(path, options, callback) {
  var sh = this;
  var fs = sh.fs;
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  callback = callback || function(){};

  var exec = options.exec || function(path, next) { next(); };
  var found = [];

  if(!path) {
    callback(new Errors.EINVAL('Missing path argument'));
    return;
  }

  function processPath(path, callback) {
    exec(path, function(err) {
      if(err) {
        callback(err);
        return;
      }

      found.push(path);
      callback();
    });
  }

  function maybeProcessPath(path, callback) {
    // Test the path against the user's regex, name, path primaries (if any)
    // and remove any trailing slashes added previously.
    var rawPath = Path.removeTrailing(path);

    // Check entire path against provided regex, if any
    if(options.regex && !options.regex.test(rawPath)) {
      callback();
      return;
    }

    // Check basename for matches against name primary, if any
    if(options.name && !minimatch(Path.basename(rawPath), options.name)) {
      callback();
      return;
    }

    // Check dirname for matches against path primary, if any
    if(options.path && !minimatch(Path.dirname(rawPath), options.path)) {
      callback();
      return;
    }

    processPath(path, callback);
  }

  function walk(path, callback) {
    path = Path.resolve(sh.pwd(), path);

    // The path is either a file or dir, and instead of doing
    // a stat() to determine it first, we just try to readdir()
    // and it will either work or not, and we handle the non-dir error.
    fs.readdir(path, function(err, entries) {
      if(err) {
        if(err.code === 'ENOTDIR' /* file case, ignore error */) {
          maybeProcessPath(path, callback);
        } else {
          callback(err);
        }
        return;
      }

      // Path is really a dir, add a trailing / and report it found
      maybeProcessPath(Path.addTrailing(path), function(err) {
        if(err) {
          callback(err);
          return;
        }

        entries = entries.map(function(entry) {
          return Path.join(path, entry);
        });

        async.eachSeries(entries, walk, function(err) {
          callback(err, found);
        });
      });
    });
  }

  // Make sure we are starting with a dir path
  fs.stat(path, function(err, stats) {
    if(err) {
      callback(err);
      return;
    }
    if(!stats.isDirectory()) {
      callback(new Errors.ENOTDIR(null, path));
      return;
    }

    walk(path, callback);
  });
};

module.exports = Shell;

},{"../../lib/async.js":10,"../encoding.js":18,"../errors.js":19,"../path.js":26,"./environment.js":32,"minimatch":14}],34:[function(require,module,exports){
var Constants = require('./constants.js');

function Stats(fileNode, devName) {
  this.node = fileNode.id;
  this.dev = devName;
  this.size = fileNode.size;
  this.nlinks = fileNode.nlinks;
  this.atime = fileNode.atime;
  this.mtime = fileNode.mtime;
  this.ctime = fileNode.ctime;
  this.type = fileNode.mode;
}

Stats.prototype.isFile = function() {
  return this.type === Constants.MODE_FILE;
};

Stats.prototype.isDirectory = function() {
  return this.type === Constants.MODE_DIRECTORY;
};

Stats.prototype.isSymbolicLink = function() {
  return this.type === Constants.MODE_SYMBOLIC_LINK;
};

// These will always be false in Filer.
Stats.prototype.isSocket          =
Stats.prototype.isFIFO            =
Stats.prototype.isCharacterDevice =
Stats.prototype.isBlockDevice     =
function() {
  return false;
};

module.exports = Stats;

},{"./constants.js":16}],35:[function(require,module,exports){
var Constants = require('./constants.js');

function SuperNode(options) {
  var now = Date.now();

  this.id = Constants.SUPER_NODE_ID;
  this.mode = Constants.MODE_META;
  this.atime = options.atime || now;
  this.ctime = options.ctime || now;
  this.mtime = options.mtime || now;
  // root node id (randomly generated)
  this.rnode = options.rnode;
}

SuperNode.create = function(options, callback) {
  options.guid(function(err, rnode) {
    if(err) {
      callback(err);
      return;
    }
    options.rnode = options.rnode || rnode;
    callback(null, new SuperNode(options));
  });
};

module.exports = SuperNode;

},{"./constants.js":16}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],39:[function(require,module,exports){
;(function () { // closure for web browsers

if (typeof module === 'object' && module.exports) {
  module.exports = LRUCache
} else {
  // just set the global for non-node platforms.
  this.LRUCache = LRUCache
}

function hOP (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function naiveLength () { return 1 }

function LRUCache (options) {
  if (!(this instanceof LRUCache))
    return new LRUCache(options)

  if (typeof options === 'number')
    options = { max: options }

  if (!options)
    options = {}

  this._max = options.max
  // Kind of weird to have a default max of Infinity, but oh well.
  if (!this._max || !(typeof this._max === "number") || this._max <= 0 )
    this._max = Infinity

  this._lengthCalculator = options.length || naiveLength
  if (typeof this._lengthCalculator !== "function")
    this._lengthCalculator = naiveLength

  this._allowStale = options.stale || false
  this._maxAge = options.maxAge || null
  this._dispose = options.dispose
  this.reset()
}

// resize the cache when the max changes.
Object.defineProperty(LRUCache.prototype, "max",
  { set : function (mL) {
      if (!mL || !(typeof mL === "number") || mL <= 0 ) mL = Infinity
      this._max = mL
      if (this._length > this._max) trim(this)
    }
  , get : function () { return this._max }
  , enumerable : true
  })

// resize the cache when the lengthCalculator changes.
Object.defineProperty(LRUCache.prototype, "lengthCalculator",
  { set : function (lC) {
      if (typeof lC !== "function") {
        this._lengthCalculator = naiveLength
        this._length = this._itemCount
        for (var key in this._cache) {
          this._cache[key].length = 1
        }
      } else {
        this._lengthCalculator = lC
        this._length = 0
        for (var key in this._cache) {
          this._cache[key].length = this._lengthCalculator(this._cache[key].value)
          this._length += this._cache[key].length
        }
      }

      if (this._length > this._max) trim(this)
    }
  , get : function () { return this._lengthCalculator }
  , enumerable : true
  })

Object.defineProperty(LRUCache.prototype, "length",
  { get : function () { return this._length }
  , enumerable : true
  })


Object.defineProperty(LRUCache.prototype, "itemCount",
  { get : function () { return this._itemCount }
  , enumerable : true
  })

LRUCache.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  var i = 0;
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    i++
    var hit = this._lruList[k]
    if (this._maxAge && (Date.now() - hit.now > this._maxAge)) {
      del(this, hit)
      if (!this._allowStale) hit = undefined
    }
    if (hit) {
      fn.call(thisp, hit.value, hit.key, this)
    }
  }
}

LRUCache.prototype.keys = function () {
  var keys = new Array(this._itemCount)
  var i = 0
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    var hit = this._lruList[k]
    keys[i++] = hit.key
  }
  return keys
}

LRUCache.prototype.values = function () {
  var values = new Array(this._itemCount)
  var i = 0
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    var hit = this._lruList[k]
    values[i++] = hit.value
  }
  return values
}

LRUCache.prototype.reset = function () {
  if (this._dispose && this._cache) {
    for (var k in this._cache) {
      this._dispose(k, this._cache[k].value)
    }
  }

  this._cache = Object.create(null) // hash of items by key
  this._lruList = Object.create(null) // list of items in order of use recency
  this._mru = 0 // most recently used
  this._lru = 0 // least recently used
  this._length = 0 // number of items in the list
  this._itemCount = 0
}

// Provided for debugging/dev purposes only. No promises whatsoever that
// this API stays stable.
LRUCache.prototype.dump = function () {
  return this._cache
}

LRUCache.prototype.dumpLru = function () {
  return this._lruList
}

LRUCache.prototype.set = function (key, value) {
  if (hOP(this._cache, key)) {
    // dispose of the old one before overwriting
    if (this._dispose) this._dispose(key, this._cache[key].value)
    if (this._maxAge) this._cache[key].now = Date.now()
    this._cache[key].value = value
    this.get(key)
    return true
  }

  var len = this._lengthCalculator(value)
  var age = this._maxAge ? Date.now() : 0
  var hit = new Entry(key, value, this._mru++, len, age)

  // oversized objects fall out of cache automatically.
  if (hit.length > this._max) {
    if (this._dispose) this._dispose(key, value)
    return false
  }

  this._length += hit.length
  this._lruList[hit.lu] = this._cache[key] = hit
  this._itemCount ++

  if (this._length > this._max) trim(this)
  return true
}

LRUCache.prototype.has = function (key) {
  if (!hOP(this._cache, key)) return false
  var hit = this._cache[key]
  if (this._maxAge && (Date.now() - hit.now > this._maxAge)) {
    return false
  }
  return true
}

LRUCache.prototype.get = function (key) {
  return get(this, key, true)
}

LRUCache.prototype.peek = function (key) {
  return get(this, key, false)
}

LRUCache.prototype.pop = function () {
  var hit = this._lruList[this._lru]
  del(this, hit)
  return hit || null
}

LRUCache.prototype.del = function (key) {
  del(this, this._cache[key])
}

function get (self, key, doUse) {
  var hit = self._cache[key]
  if (hit) {
    if (self._maxAge && (Date.now() - hit.now > self._maxAge)) {
      del(self, hit)
      if (!self._allowStale) hit = undefined
    } else {
      if (doUse) use(self, hit)
    }
    if (hit) hit = hit.value
  }
  return hit
}

function use (self, hit) {
  shiftLU(self, hit)
  hit.lu = self._mru ++
  if (self._maxAge) hit.now = Date.now()
  self._lruList[hit.lu] = hit
}

function trim (self) {
  while (self._lru < self._mru && self._length > self._max)
    del(self, self._lruList[self._lru])
}

function shiftLU (self, hit) {
  delete self._lruList[ hit.lu ]
  while (self._lru < self._mru && !self._lruList[self._lru]) self._lru ++
}

function del (self, hit) {
  if (hit) {
    if (self._dispose) self._dispose(hit.key, hit.value)
    self._length -= hit.length
    self._itemCount --
    delete self._cache[ hit.key ]
    shiftLU(self, hit)
  }
}

// classy, since V8 prefers predictable objects.
function Entry (key, value, lu, length, now) {
  this.key = key
  this.value = value
  this.lu = lu
  this.length = length
  this.now = now
}

})()

},{}],40:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":41}],41:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
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
    var timeout = runTimeout(cleanUpNextTick);
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
    runClearTimeout(timeout);
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
        runTimeout(drainQueue);
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

},{}],42:[function(require,module,exports){
'use strict';

module.exports = function(date, options) {
    var sep;
    var order;
    var ret;
    var day;
    var month;
    var year;
    
    date = date || new Date();
    
    check(date, options);
    
    if (!options) {
        options = {};
    }
    
    sep     = options.sep || '.';
    order   = options.order || 'big'
    
    day     = date.getDate();
    month   = date.getMonth() + 1;
    year    = date.getFullYear();
     
    if (month <= 9)
        month   = '0' + month;
    
    if (day <= 9)
        day     = '0' + day;
    
    switch(order) {
    case 'big':
        ret         = [year, month, day].join(sep);
        break;
    case 'middle':
        ret         = [month, day, year].join(sep);
        break;
    case 'little':
        ret         = [day, month, year].join(sep);
        break;
    default:
        throw Error('order could be "big", "middle" and "little" only!');
    }
    
    return ret;
};

function check(date, options) {
    var type = {}.toString.call(date);
    
    if (date && type !== '[object Date]')
        throw Error('date should be Date!');
    
    if (options && typeof options !== 'object')
        throw Error('options should be object!');
 }


},{}],43:[function(require,module,exports){
module.exports = sigmund
function sigmund (subject, maxSessions) {
    maxSessions = maxSessions || 10;
    var notes = [];
    var analysis = '';
    var RE = RegExp;

    function psychoAnalyze (subject, session) {
        if (session > maxSessions) return;

        if (typeof subject === 'function' ||
            typeof subject === 'undefined') {
            return;
        }

        if (typeof subject !== 'object' || !subject ||
            (subject instanceof RE)) {
            analysis += subject;
            return;
        }

        if (notes.indexOf(subject) !== -1 || session === maxSessions) return;

        notes.push(subject);
        analysis += '{';
        Object.keys(subject).forEach(function (issue, _, __) {
            // pseudo-private values.  skip those.
            if (issue.charAt(0) === '_') return;
            var to = typeof subject[issue];
            if (to === 'function' || to === 'undefined') return;
            analysis += issue;
            psychoAnalyze(subject[issue], session + 1);
        });
    }
    psychoAnalyze(subject, 0);
    return analysis;
}

// vim: set softtabstop=4 shiftwidth=4:

},{}],44:[function(require,module,exports){
(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = squad;
    else
        global.squad    = squad;
    
    function squad() {
        var funcs = [].slice.call(arguments);
                
        check('function', funcs);
        
        return function() {
            return funcs
                .reduceRight(apply, arguments)
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

},{}],"readify.js":[function(require,module,exports){
(function (process){
'use strict';

var format = require('format-io');
var exec = require('execon');
var squad = require('squad');
var shortdate = require('shortdate');
var promisify = require('es6-promisify');
var currify = require('currify');

var WIN = process.platform === 'win32';

var map = function map(fn, array) {
    return array.map(fn);
};
var sort = function sort(fn, array) {
    return array.sort(fn);
};
var parseStats = exec.with(map, parseStat);

var getAllStats_ = currify(getAllStats);

var fs = void 0;
var nicki = void 0;

module.exports = readify;

if (typeof window !== 'undefined') {
    var Filer = require('filer');
    fs = new Filer.FileSystem();
} else {
    fs = require('fs');
    nicki = !WIN && require('nicki');
}

var readdir = promisify(fs.readdir, fs);

/* sorting on Win and node v0.8.0 */
var sortFiles = exec.with(sort, function (a, b) {
    return a.name > b.name ? 1 : -1;
});

function readify(path, callback) {
    check(path, callback);

    readdir(path).then(getAllStats_(path, callback)).catch(callback);
}

function check(path, callback) {
    var pathMsg = 'path should be string!';
    var callbackMsg = 'callback should be function!';

    if (typeof path !== 'string') throw Error(pathMsg);

    if (typeof callback !== 'function') throw Error(callbackMsg);
}

/**
 * @param path
 * @param names
 */
function getAllStats(path, callback, names) {
    var length = names.length;
    var dir = format.addSlashToEnd(path);

    if (!length) return fillJSON(dir, [], callback);

    var funcs = names.map(function (name) {
        return exec.with(getStat, name, dir + name);
    });

    exec.parallel(funcs, function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var files = args.slice(1);
        fillJSON(dir, files, callback);
    });
}

function emptyStat() {
    return {
        mode: 0,
        size: 0,
        mtime: 0,
        isDirectory: function isDirectory() {}
    };
}

function getStat(name, path, callback) {
    fs.stat(path, function (error) {
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : emptyStat();

        data.name = name;

        callback(null, data);
    });
}

function parseStat(stat) {
    /* Переводим права доступа в 8-ричную систему */
    var modeStr = Number(stat.mode).toString(8);
    var owner = stat.uid || '';
    var mode = Number(modeStr) || '';
    var isDir = stat.isDirectory();
    var size = isDir ? 'dir' : stat.size;
    var mtime = !stat.mtime ? '' : shortdate(stat.mtime, {
        order: 'little'
    });

    return {
        'name': stat.name,
        'size': format.size(size),
        'date': mtime,
        'owner': owner,
        'mode': mode && format.permissions.symbolic(mode)
    };
}

/**
 * Function fill JSON by file stats
 *
 * @param params - { files, stats, path }
 */
function fillJSON(path, stats, callback) {
    var processFiles = squad(changeOrder, sortFiles, parseStats);
    var json = {
        path: '',
        files: processFiles(stats)
    };

    json.path = format.addSlashToEnd(path);

    changeUIDToName(json, function (error, files) {
        json.files = files;
        callback(null, json);
    });
}

function changeUIDToName(json, callback) {
    if (!nicki) callback(null, json.files);else nicki(function (error, names) {
        var files = void 0;

        if (error) files = json.files.slice();else files = json.files.map(function (file) {
            var owner = file.owner;

            if (names[owner]) file.owner = names[owner];

            return file;
        });

        callback(error, files);
    });
}

function isDir(file) {
    return file.size === 'dir';
}

function not(fn) {
    return function () {
        return !fn.apply(undefined, arguments);
    };
}

function changeOrder(json) {
    var isFile = not(isDir);
    var dirs = json.filter(isDir);
    var files = json.filter(isFile);
    var sorted = dirs.concat(files);

    return sorted;
}

}).call(this,require('_process'))
},{"_process":41,"currify":5,"es6-promisify":8,"execon":9,"filer":23,"format-io":36,"fs":3,"nicki":undefined,"shortdate":42,"squad":44}]},{},["readify.js"])("readify.js")
});