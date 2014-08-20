# Readify

Read directory content with file attributes: size, owner, mode.

## Install

```
npm i readify
```

## How to use?

### read
Read content of directory with permisions and sizes.

```js
var readify = require('readify');

radify('.', function(error, data) {
    console.log(error || data);
});

/*
 * Possible data
 *
  { path: './',
  files:
   [ { name: '.git',
       size: 'dir',
       owner: 'coderaiser',
       mode: 'rwx rwx r-x' },
     { name: 'lib',
       size: 'dir',
       owner: 'coderaiser',
       mode: 'rwx rwx r-x' },
     { name: 'node_modules',
       size: 'dir',
       owner: 'coderaiser',
       mode: 'rwx rwx r-x' },
     { name: '.gitignore',
       size: '13b',
       owner: 'coderaiser',
       mode: 'rw- rw- r--' },
     { name: 'LICENSE',
       size: '1.05kb',
       owner: 'coderaiser',
       mode: 'rw- rw- r--' },
     { name: 'README.md',
       size: '1.07kb',
       owner: 'coderaiser',
       mode: 'rw- rw- r--' },
     { name: 'package.json',
       size: '514b',
       owner: 'coderaiser',
       mode: 'rw- rw- r--' } ] }
    */
```

## License

MIT
