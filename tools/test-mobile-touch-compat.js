const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

global.window = global;
global.TouchInput = {
    mouseX: 0,
    mouseY: 0,
    _onTrigger() {},
    _onMove() {},
    _onRelease() {}
};

const values = { 827: 2, 833: 1 };
global.$gameVariables = {
    value(id) { return values[id]; },
    setValue(id, value) { values[id] = value; }
};
global.$gameMap = { mapId() { return 34; } };
global.$gameSwitches = {
    values: { 240: true },
    value(id) { return !!this.values[id]; },
    setValue(id, value) { this.values[id] = value; }
};
global.$gameTemp = { cleared: false, clearDestination() { this.cleared = true; } };
global.$dataMap = { events: [null, { name: 'シーン中射精' }] };
global.SoundManager = { played: false, playOk() { this.played = true; } };
global.Graphics = { boxWidth: 816, boxHeight: 624 };

global.Game_Interpreter = function() {};
Game_Interpreter.prototype.command111 = function() {
    this.observedSelection = $gameVariables.value(833);
    return true;
};

global.Scene_Map = function() { this.children = []; };
Scene_Map.prototype.createDisplayObjects = function() {};
Scene_Map.prototype.updateChildren = function() {};
Scene_Map.prototype.addChild = function(child) { this.children.push(child); };

global.Bitmap = function() {};
Bitmap.prototype.fillRect = function() {};
Bitmap.prototype.drawText = function() {};
global.Sprite_Button = function() {};
Sprite_Button.prototype.setClickHandler = function(handler) { this.click = handler; };

const source = fs.readFileSync('js/dzmm-mobile-touch-compat.js', 'utf8');
vm.runInThisContext(source, { filename: 'dzmm-mobile-touch-compat.js' });

const interpreter = new Game_Interpreter();
interpreter._params = [1, 827, 1, 833, 0];
interpreter.command111();
assert.strictEqual(interpreter.observedSelection, 2, 'arithmetic judge should see the correct slot');

const scene = new Scene_Map();
scene.createDisplayObjects();
scene.updateChildren();
assert.strictEqual(scene._dzmmClimaxButton.visible, true, 'button should be visible on scene maps');
scene._dzmmClimaxButton.click();
assert.strictEqual($gameSwitches.value(963), true, 'button should enable the scene climax switch');
assert.strictEqual($gameTemp.cleared, true, 'button should clear map touch destination');
assert.strictEqual(SoundManager.played, true, 'button should play confirmation sound');
scene.updateChildren();
assert.strictEqual(scene._dzmmClimaxButton.visible, false, 'button should hide while action is running');

$gameSwitches.values[963] = false;
$gameSwitches.values[240] = false;
scene.updateChildren();
assert.strictEqual(scene._dzmmClimaxButton.visible, false, 'button must stay hidden outside a scene');

console.log('mobile touch compatibility tests passed');
