'use strict';

const {
    run
} = require('madrun');

module.exports = {
    "putout": () => 'putout lib test madrun.js',
    "lint": () => run(['putout', 'lint:*']),
    "fix:lint": () => run(['putout', 'lint:*'], '--fix'),
    "lint:eslint:lib": () => 'eslint lib',
    "lint:eslint:test": () => 'eslint -c .eslintrc.test test',
    "report": () => 'nyc report --reporter=text-lcov | coveralls',
    "coverage": () => 'nyc npm test',
    "test": () => 'tape test/*.js',
    "watch:coverage": () => run(['watcher'], 'npm run coverage'),
    "watch:test": () => run(['watcher'], 'npm test'),
    "watcher": () => 'nodemon -w test -w lib --exec'
};

