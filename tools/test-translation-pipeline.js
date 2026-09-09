'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global;
global.DRKXQ_TRANSLATIONS = {
    '叔父さんがいるし\n今はやめておこう……': '叔父在这里\n还是算了吧……',
    '今はやめておこう……': '现在还是算了吧……',
    'はい': '是',
    'いいえ': '否'
};

global.DRKXQ_TRANSLATIONS['\u30c6\u30b9\u30c8\u3067\u3059\uff01'] = '\u6d4b\u8bd5\u3002';

function Window_Base() {}
Window_Base.prototype.convertEscapeCharacters = function(text) { return text; };

function Game_Message() {
    this._texts = [];
}
Game_Message.prototype.add = function(text) { this._texts.push(text); };
Game_Message.prototype.allText = function() { return this._texts.join('\n'); };
Game_Message.prototype.setChoices = function(choices) { this._choices = choices; };

function Bitmap() {}
Bitmap.prototype.drawText = function() {};

global.Window_Base = Window_Base;
global.Game_Message = Game_Message;
global.Bitmap = Bitmap;

const script = path.join(__dirname, '..', 'js', 'dzmm-translation.js');
vm.runInThisContext(fs.readFileSync(script, 'utf8'), { filename: script });

const message = new Game_Message();
message.add('叔父さんがいるし');
message.add('今はやめておこう……');
assert.strictEqual(message.allText(), '叔父さんがいるし\n今はやめておこう……');

const windowBase = new Window_Base();
assert.strictEqual(windowBase.convertEscapeCharacters(message.allText()),
    '叔父在这里\n还是算了吧……');

message.setChoices(['はい', 'いいえ'], 0, 1);
assert.deepStrictEqual(message._choices, ['是', '否']);

assert.strictEqual(windowBase.convertEscapeCharacters(
    '\\c[14]\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\\c[0]\u3078'),
    '\\c[14]\u7ef4\u62a4\\c[0]');
assert.strictEqual(windowBase.convertEscapeCharacters(
    '\\c[14]\u6700\u65b0\u30c9\u30ed\u30fc\u30f3\u304c\\c[0]\u98db\u3093\u3067\u308b\uff01'),
    '\\c[14]\u6700\u65b0\u578b\u65e0\u4eba\u673a\\c[0]\u6b63\u5728\u98de\uff01');
assert.strictEqual(windowBase.convertEscapeCharacters('\u30c6\u30b9\u30c8\u3067\u3059?'), '\u6d4b\u8bd5\u3002');

console.log('translation pipeline tests passed');
