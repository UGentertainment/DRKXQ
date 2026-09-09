'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global;
global.Input = { _pollGamepads() {} };
global.Bitmap = function Bitmap() {};
Bitmap.prototype.getPixel = function() { return '#000000'; };
Bitmap.prototype.getAlphaPixel = function() { return 0; };

const calls = [];
function GLTexture() {
    this.width = 0;
    this.height = 0;
    this.format = 6408;
    this.type = 5121;
    this.premultiplyAlpha = true;
    this.gl = {
        TEXTURE_2D: 3553,
        UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37440,
        pixelStorei() {},
        texImage2D() { calls.push(Array.from(arguments)); }
    };
}
GLTexture.prototype.bind = function() {};
GLTexture.prototype.upload = function() {
    const error = new Error('Tainted canvases may not be loaded.');
    error.name = 'SecurityError';
    throw error;
};

global.PIXI = { glCore: { GLTexture } };

const compatPath = path.join(__dirname, '..', 'js', 'dzmm-browser-compat.js');
vm.runInThisContext(fs.readFileSync(compatPath, 'utf8'), { filename: compatPath });

const texture = new GLTexture();
const source = { width: 320, height: 180 };
texture.upload(source);

assert.strictEqual(texture.width, 320);
assert.strictEqual(texture.height, 180);
assert.strictEqual(calls.length, 1);
assert.deepStrictEqual(calls[0].slice(0, 9), [3553, 0, 6408, 320, 180, 0, 6408, 5121, null]);

texture.upload(source);
assert.strictEqual(calls.length, 1, 'blocked source should not be uploaded every frame');

console.log('browser compatibility tests passed');
