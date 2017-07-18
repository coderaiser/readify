'use strict';

module.exports = (f) => {
    return function() {
        const args = Array.from(arguments);
        f.apply(null, [null].concat(args));
    };
};

