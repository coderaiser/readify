# Readify

Read directory content with file attributes: size, owner, mode.

## Install

With npm:

```
npm i readify --save
```

With bower:

```
npm i bower --save
```

## How to use?

Readify could be used in node.js based applications or in browsers
with help of [filer](https://github.com/filerjs/filer "Node-like file system for browsers"), [execon](https://github.com/coderaiser/execon "Patterns of function calls") and [format](https://github.com/coderaiser/format-io "Node library for format size, permissions").

`node.js` example:

```js
var readify = require('readify');

radify('/', function(error, data) {
    console.log(error || data);
});
```

`browser` example:

```js
var fs = new Filer.FileSystem();

readify('/', function(error, data) {
    console.log(error || data);
});
```

Possible data:

```json
  { "path": "./",
  "files":
   [ { "name": ".git",
       "size": "dir",
       "owner": "coderaiser",
       "mode": "rwx rwx r-x" },
     { "name": "lib",
       "size": "dir",
       "owner": "coderaiser",
       "mode": "rwx rwx r-x" },
     { "name": "node_modules",
       "size": "dir",
       "owner": "coderaiser",
       "mode": "rwx rwx r-x" },
     { "name": ".gitignore",
       "size": "13b",
       "owner": "coderaiser",
       "mode": "rw- rw- r--" },
     { "name": "LICENSE",
       "size": "1.05kb",
       "owner": "coderaiser",
       "mode": "rw- rw- r--" },
     { "name": "README.md",
       "size": "1.07kb",
       "owner": "coderaiser",
       "mode": "rw- rw- r--" },
     { "name": "package.json",
       "size": "514b",
       "owner": "coderaiser",
       "mode": "rw- rw- r--" }
   ] }
```

## License

MIT
