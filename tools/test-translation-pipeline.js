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

console.log('translation pipeline tests passed');
