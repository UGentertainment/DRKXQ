'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global;
global.Bitmap = function Bitmap(width, height) {
    this.width = width;
    this.height = height;
    this.drawnText = [];
};
Bitmap.prototype.fillRect = function() {};
Bitmap.prototype.fillAll = function() {};
Bitmap.prototype.drawText = function(text) { this.drawnText.push(text); };

let delegated = null;
global.ImageManager = {
    loadPicture(filename, hue) {
        delegated = { filename, hue };
        return delegated;
    }
};

const scriptPath = path.join(__dirname, '..', 'js', 'dzmm-ui-localization.js');
vm.runInThisContext(fs.readFileSync(scriptPath, 'utf8'), { filename: scriptPath });

const start = ImageManager.loadPicture('title_\u306f\u3058\u3081\u304b\u3089', 0);
assert.deepStrictEqual([start.width, start.height], [176, 16]);
assert(start.drawnText.includes('\u5f00\u59cb\u6e38\u620f'));
assert.strictEqual(ImageManager.loadPicture('title_\u306f\u3058\u3081\u304b\u3089', 0), start);

const notice = ImageManager.loadPicture('OP_\u6ce8\u610f', 0);
assert.deepStrictEqual([notice.width, notice.height], [745, 450]);
assert(notice.drawnText.includes('\u6ce8\u610f'));
assert(notice.drawnText.some(text => text.includes('\u590f\u65e5\u72c2\u60f3\u66f2')));

const fallback = ImageManager.loadPicture('ordinary-picture', 30);
assert.deepStrictEqual(fallback, { filename: 'ordinary-picture', hue: 30 });

console.log('UI localization tests passed');
