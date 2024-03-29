# Readify [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/readify.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/readify/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/readify/workflows/Node%20CI/badge.svg
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]: https://npmjs.org/package/readify "npm"
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]: https://coveralls.io/github/coderaiser/readify?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/readify/badge.svg?branch=master&service=github

Read directory content with file attributes: size, date, owner, mode and type.

## Install

With npm:

```
npm i readify
```

## API

### readify(dir [, options, ])

- **dir** - path of a directory
- **options** - `object` can contain:
  - `type` - type of result, could be "raw"
  - `sort` - sort by: name, size, date
  - `order` - "asc" or "desc" for ascending and descending order (default: "asc")

## Examples

```js
const readify = require('readify');
const tryToCatch = require('try-to-catch');

const [error, data] = await tryToCatch(readify, '/');
console.log(data);
// output
({
    path: '/',
    files: [{
        name: 'readify.js',
        size: '4.22kb',
        date: '20.02.2016',
        owner: 'coderaiser',
        mode: 'rw- rw- r--',
        type: 'file',
    }],
});

readify('/', {
    type: 'raw',
}).then(console.log);

// output
({
    path: '/',
    files: [{
        name: 'readify.js',
        size: 4735,
        date: '2016-11-21T13:37:55.275Z',
        owner: 1000,
        mode: 33_204,
        type: 'file',
    }],
});

readify('/', {
    type: 'raw',
    sort: 'size',
    order: 'desc',
}).then(console.log);

// output
({
    path: '/',
    files: [{
        name: 'readify.js',
        size: 4735,
        date: '2016-11-21T13:37:55.275Z',
        owner: 1000,
        mode: 33_204,
        type: 'file',
    }],
});
```

## License

MIT
