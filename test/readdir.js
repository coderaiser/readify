import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {readdir as _readdir} from '../lib/readdir.js';

const noop = () => {};

test('readdir: empty dir', async (t) => {
    const readdir = stub().resolves([]);
    
    const [, result] = await tryToCatch(_readdir, '.', {
        readdir,
    });
    
    t.deepEqual(result, [], 'should return empty array');
    t.end();
});

test('readdir: empty stat', async (t) => {
    const superstat = stub().rejects(Error('some'));
    const readdir = stub().resolves(['hello']);
    
    const [, result] = await tryToCatch(_readdir, '/', {
        readdir,
        superstat,
    });
    
    const expected = [{
        name: 'hello',
        size: 0,
        date: 0,
        owner: 0,
        mode: 0,
        type: 'file',
    }];
    
    t.deepEqual(result, expected, 'should return empty array');
    t.end();
});

test('readdir: result', async (t) => {
    const name = 'hello.txt';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    const readdir = stub().resolves([
        name,
    ]);
    
    const superstat = stub().resolves({
        isDirectory: noop,
        isSymbolicLink: noop,
        name,
        mode,
        size,
        mtime,
        uid,
    });
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: 'file',
    }];
    
    const [, result] = await tryToCatch(_readdir, '.', {
        readdir,
        superstat,
    });
    
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});

test('readdir: result: no error', async (t) => {
    const name = 'hello.txt';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    const readdir = stub().resolves([
        name,
    ]);
    
    const superstat = stub().resolves({
        isDirectory: noop,
        isSymbolicLink: noop,
        name,
        mode,
        size,
        mtime,
        uid,
    });
    
    const [e] = await tryToCatch(_readdir, '.', {
        readdir,
        superstat,
    });
    
    t.notOk(e, e?.message || 'should not receive error');
    t.end();
});

test('readdir: result: directory link', async (t) => {
    const name = 'hello';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    const readdir = stub().resolves([
        name,
    ]);
    
    const info = {
        isDirectory: stub().returns(true),
        isSymbolicLink: stub().returns(true),
        name,
        mode,
        size,
        mtime,
        uid,
        ino: 1337,
        dev: 1337,
    };
    
    const superstat = stub().resolves(info);
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: 'directory-link',
    }];
    
    const [, result] = await tryToCatch(_readdir, '.', {
        readdir,
        superstat,
    });
    
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});

test('readdir: result: zip link', async (t) => {
    const name = 'hello.zip';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    const readdir = stub().resolves([
        name,
    ]);
    
    const info = {
        isDirectory: stub().returns(false),
        isSymbolicLink: stub().returns(true),
        name,
        mode,
        size,
        mtime,
        uid,
        ino: 1337,
        dev: 1337,
    };
    
    const superstat = stub().resolves(info);
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode,
        type: 'archive-link',
    }];
    
    const [, result] = await tryToCatch(_readdir, '.', {
        readdir,
        superstat,
    });
    
    t.deepEqual(result, expected, 'should get raw values');
    t.end();
});

test('readdir: result: directory link: no error', async (t) => {
    const name = 'hello';
    const mode = 16_893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    const readdir = stub().resolves([
        name,
    ]);
    
    const superstat = stub().resolves({
        isDirectory: stub().returns(true),
        isSymbolicLink: stub().returns(true),
        name,
        mode,
        size,
        mtime,
        uid,
    });
    
    const [e] = await tryToCatch(_readdir, '.', {
        readdir,
        superstat,
    });
    
    t.notOk(e, e?.message || 'should not receive error');
    t.end();
});
