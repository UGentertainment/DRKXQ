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
let originalBltCalls = 0;
Bitmap.prototype.blt = function() { originalBltCalls++; };

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
let videoPlayCalls = 0;
global.Graphics = {
    _videoUnlocked: false,
    _video: {
        paused: true,
        play() {
            videoPlayCalls++;
            return Promise.reject(new Error('autoplay blocked'));
        }
    },
    _isVideoVisible() { return false; },
    _onTouchEnd() {}
};

const compatPath = path.join(__dirname, '..', 'js', 'dzmm-browser-compat.js');
vm.runInThisContext(fs.readFileSync(compatPath, 'utf8'), { filename: compatPath });

const destination = new Bitmap();
const taintedSource = {
    _canvas: { width: 10, height: 10 },
    _context: {
        getImageData() {
            const error = new Error('The canvas has been tainted by cross-origin data.');
            error.name = 'SecurityError';
            throw error;
        }
    }
};
destination.blt(taintedSource);
assert.strictEqual(originalBltCalls, 0, 'tainted source must not spread to another bitmap');

const cleanSource = {
    _canvas: { width: 10, height: 10 },
    _context: { getImageData() { return { data: new Uint8ClampedArray(4) }; } }
};
destination.blt(cleanSource);
assert.strictEqual(originalBltCalls, 1);

const texture = new GLTexture();
const source = { width: 320, height: 180 };
texture.upload(source);

assert.strictEqual(texture.width, 320);
assert.strictEqual(texture.height, 180);
assert.strictEqual(calls.length, 1);
assert.deepStrictEqual(calls[0].slice(0, 9), [3553, 0, 6408, 320, 180, 0, 6408, 5121, null]);

texture.upload(source);
assert.strictEqual(calls.length, 1, 'blocked source should not be uploaded every frame');

assert.doesNotThrow(() => Graphics._onTouchEnd());
assert.strictEqual(Graphics._videoUnlocked, true);
assert.strictEqual(videoPlayCalls, 1);

console.log('browser compatibility tests passed');
