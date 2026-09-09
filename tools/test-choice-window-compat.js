'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global;
global.Graphics = { boxWidth: 745, boxHeight: 400 };

function Window_ChoiceListEx() {}
Window_ChoiceListEx.prototype.start = function() {
    // Simulate MessageWindowPopup's successful placement.
    this.x = 32;
    this.y = 120;
};
Window_ChoiceListEx.prototype.maxChoiceWidth = function() { return 120; };
Window_ChoiceListEx.prototype.fittingHeight = function(rows) { return rows * 36 + 36; };
Window_ChoiceListEx.prototype.contentsWidth = function() { return this.width - 36; };
Window_ChoiceListEx.prototype.contentsHeight = function() { return this.height - 36; };
Window_ChoiceListEx.prototype.createContents = function() {
    this.contents = { width: this.contentsWidth(), height: this.contentsHeight() };
};
Window_ChoiceListEx.prototype.refresh = function() {};
Window_ChoiceListEx.prototype.index = function() { return this._index; };
Window_ChoiceListEx.prototype.select = function(index) { this._index = index; };
Window_ChoiceListEx.prototype.isClosed = function() { return this.openness <= 0; };
Window_ChoiceListEx.prototype.open = function() { this.openness = 255; };
Window_ChoiceListEx.prototype.activate = function() { this.active = true; };

function Window_MessageEx() {}
Window_MessageEx.prototype.update = function() {
    // The compatibility layer must leave an active, placed popup alone.
};

global.Window_ChoiceListEx = Window_ChoiceListEx;
global.Window_MessageEx = Window_MessageEx;

const gameMessage = {
    choices() { return ['Yes', 'No']; },
    choiceDefaultType() { return 0; },
    isChoice() { return true; }
};
const messageWindow = {
    x: 100,
    y: 300,
    width: 500,
    height: 100,
    visible: true,
    openness: 255
};
const choiceWindow = new Window_ChoiceListEx();
Object.assign(choiceWindow, {
    _gameMessage: gameMessage,
    _messageWindow: messageWindow,
    width: 160,
    height: 80,
    x: 0,
    y: 0,
    padding: 18,
    contents: { width: 124, height: 44 },
    contentsOpacity: 255,
    visible: true,
    openness: 255,
    active: true,
    _index: 0
});

const compatPath = path.join(__dirname, '..', 'js', 'dzmm-choice-window-compat.js');
vm.runInThisContext(fs.readFileSync(compatPath, 'utf8'), { filename: compatPath });

choiceWindow.start();
assert.strictEqual(choiceWindow.x, 32);
assert.strictEqual(choiceWindow.y, 120);

const extendedMessageWindow = new Window_MessageEx();
extendedMessageWindow._gameMessage = gameMessage;
extendedMessageWindow._choiceWindow = choiceWindow;
extendedMessageWindow.update();
assert.strictEqual(choiceWindow.x, 32);
assert.strictEqual(choiceWindow.y, 120);

console.log('extended choice positioning tests passed');
