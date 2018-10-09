# Readify [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/readify.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/readify/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/coderaiser/readify.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/readify "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/readify  "Build Status"
[DependencyStatusURL]:      https://david-dm.org/coderaiser/readify "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

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
{
    path: '/',
    files:  [{
        name: 'readify.js',
        size: '4.22kb',
        date: '20.02.2016',
        owner: 'coderaiser',
        mode: 'rw- rw- r--',
        type: 'file',
    }]
}
});

readify('/', {type: 'raw'})
    .then(console.log);
    // output
    {
        path: '/',
        files:  [{
            name: 'readify.js',
            size: 4735,
            date: 2016-11-21T13:37:55.275Z,
            owner: 1000,
            mode: 33204,
            type: 'file',
        }]
    }
});

readify('/', {type: 'raw', sort: 'size', order: 'desc'})
    .then(console.log);
    // output
    {
        path: '/',
        files:  [{
            name: 'readify.js',
            size: 4735,
            date: 2016-11-21T13:37:55.275Z,
            owner: 1000,
            mode: 33204,
            type: 'file',
        }]
    }
});
```
## License

MIT

[CoverageURL]:              https://coveralls.io/github/coderaiser/readify?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/readify/badge.svg?branch=master&service=github

