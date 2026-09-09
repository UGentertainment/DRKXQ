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
Window_MessageEx.prototype.getPopupTargetCharacter = function() {
    return this._originalTarget || null;
};
Window_MessageEx.prototype.update = function() {
    // The compatibility layer must leave an active, placed popup alone.
};

global.Window_ChoiceListEx = Window_ChoiceListEx;
global.Window_MessageEx = Window_MessageEx;
global.$gamePlayer = { id: 'player' };

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
    openness: 0,
    _opening: true,
    isPopup() { return true; },
    isOpen() { return this.openness >= 255; },
    isOpening() { return this._opening; },
    updateTargetCharacterId() { this.targetUpdated = true; },
    updatePlacementPopup() { this.popupPlacementUpdated = true; }
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
choiceWindow.updatePlacementPopup = function() {
    this.x = 210;
    this.y = 95;
    this.popupPlacementUpdated = true;
};

const compatPath = path.join(__dirname, '..', 'js', 'dzmm-choice-window-compat.js');
vm.runInThisContext(fs.readFileSync(compatPath, 'utf8'), { filename: compatPath });

choiceWindow.start();
assert.strictEqual(choiceWindow.isPopup(), true, 'opening parent must count as popup');
assert.strictEqual(messageWindow.targetUpdated, true);
assert.strictEqual(messageWindow.popupPlacementUpdated, true);
assert.strictEqual(choiceWindow.popupPlacementUpdated, true);
assert.strictEqual(choiceWindow.x, 210);
assert.strictEqual(choiceWindow.y, 95);

const extendedMessageWindow = new Window_MessageEx();
extendedMessageWindow._windowId = 1;
extendedMessageWindow._targetCharacterId = 6;
extendedMessageWindow._gameMessage = gameMessage;
extendedMessageWindow._choiceWindow = choiceWindow;
extendedMessageWindow.update();
assert.strictEqual(choiceWindow.x, 210);
assert.strictEqual(choiceWindow.y, 95);
assert.strictEqual(extendedMessageWindow.getPopupTargetCharacter(), global.$gamePlayer);
assert.strictEqual(global.__DRKXQ_POPUP_FALLBACK__.requestedCharacterId, 6);

const existingAnchor = { id: 'map-event-6' };
extendedMessageWindow._originalTarget = existingAnchor;
assert.strictEqual(extendedMessageWindow.getPopupTargetCharacter(), existingAnchor);

extendedMessageWindow._originalTarget = null;
extendedMessageWindow._targetCharacterId = 0;
assert.strictEqual(extendedMessageWindow.getPopupTargetCharacter(), null);

console.log('extended choice positioning tests passed');
