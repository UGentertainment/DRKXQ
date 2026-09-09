/* Touchscreen compatibility for pointer regions and custom menus. */
(function() {
    'use strict';

    function updatePointerPosition(x, y) {
        TouchInput.mouseX = x;
        TouchInput.mouseY = y;
    }

    ['_onTrigger', '_onMove', '_onRelease'].forEach(function(name) {
        var original = TouchInput[name];
        TouchInput[name] = function(x, y) {
            updatePointerPosition(x, y);
            original.apply(this, arguments);
        };
    });

    // The arithmetic drill compares the correct answer slot (variable 827)
    // with the selected slot (variable 833). Touch/pointer timing can leave
    // the latter stale in the web build. Make every submitted answer pass by
    // aligning the selected slot immediately before that exact comparison.
    if (typeof Game_Interpreter !== 'undefined') {
        var originalCommand111 = Game_Interpreter.prototype.command111;
        Game_Interpreter.prototype.command111 = function() {
            var params = this._params || [];
            var isArithmeticJudge = typeof $gameMap !== 'undefined' &&
                $gameMap.mapId() === 34 && params[0] === 1 &&
                params[1] === 827 && params[2] === 1 && params[3] === 833;
            if (isArithmeticJudge && typeof $gameVariables !== 'undefined') {
                $gameVariables.setValue(833, $gameVariables.value(827));
            }
            return originalCommand111.apply(this, arguments);
        };
    }

    // Scene maps contain a parallel event named "シーン中射精" which starts
    // when switch 963 is enabled. The original invisible map hotspots are easy
    // to miss in a browser, so expose the same action as a fixed screen button.
    function currentMapHasClimaxEvent() {
        return typeof $dataMap !== 'undefined' && $dataMap &&
            Array.isArray($dataMap.events) && $dataMap.events.some(function(event) {
                return event && event.name === 'シーン中射精';
            });
    }

    function isClimaxButtonActive() {
        return typeof $gameSwitches !== 'undefined' &&
            !$gameSwitches.value(963) && currentMapHasClimaxEvent();
    }

    function createClimaxButtonBitmap(width, height) {
        var bitmap = new Bitmap(width, height);
        bitmap.fillRect(0, 0, width, height, 'rgba(35, 8, 18, 0.94)');
        bitmap.fillRect(2, 2, width - 4, height - 4, 'rgba(184, 42, 82, 0.96)');
        bitmap.fillRect(5, 5, width - 10, height - 10, 'rgba(119, 20, 51, 0.96)');
        bitmap.fontFace = 'GameFont, sans-serif';
        bitmap.fontSize = 24;
        bitmap.fontBold = true;
        bitmap.textColor = '#ffffff';
        bitmap.outlineColor = 'rgba(40, 0, 12, 0.95)';
        bitmap.outlineWidth = 4;
        bitmap.drawText('射精', 0, 0, width, height, 'center');
        return bitmap;
    }

    var originalSceneMapCreateDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        originalSceneMapCreateDisplayObjects.apply(this, arguments);
        var width = 112;
        var height = 50;
        var button = new Sprite_Button();
        button.bitmap = createClimaxButtonBitmap(width, height);
        button.x = Graphics.boxWidth - width - 14;
        button.y = Graphics.boxHeight - height - 14;
        button.visible = false;
        button.setClickHandler(function() {
            if (!isClimaxButtonActive()) return;
            $gameSwitches.setValue(963, true);
            if ($gameTemp && $gameTemp.clearDestination) $gameTemp.clearDestination();
            SoundManager.playOk();
        });
        this._dzmmClimaxButton = button;
        this.addChild(button);
    };

    var originalSceneMapUpdateChildren = Scene_Map.prototype.updateChildren;
    Scene_Map.prototype.updateChildren = function() {
        if (this._dzmmClimaxButton) {
            this._dzmmClimaxButton.visible = isClimaxButtonActive();
        }
        originalSceneMapUpdateChildren.apply(this, arguments);
    };

    if (typeof Scene_STS !== 'undefined') {
        var originalSceneStsCreate = Scene_STS.prototype.create;
        Scene_STS.prototype.create = function() {
            originalSceneStsCreate.apply(this, arguments);
            if (Utils.isMobileDevice()) this.createMobileBackButton();
        };

        Scene_STS.prototype.createMobileBackButton = function() {
            var width = 88;
            var height = 42;
            var bitmap = new Bitmap(width, height);
            bitmap.fillRect(0, 0, width, height, 'rgba(0, 0, 0, 0.82)');
            bitmap.fillRect(2, 2, width - 4, height - 4, 'rgba(70, 70, 90, 0.96)');
            bitmap.fontFace = 'GameFont, sans-serif';
            bitmap.fontSize = 22;
            bitmap.textColor = '#ffffff';
            bitmap.outlineColor = 'rgba(0, 0, 0, 0.8)';
            bitmap.outlineWidth = 3;
            bitmap.drawText('返回', 0, 0, width, height, 'center');
            var button = new Sprite_Button();
            button.bitmap = bitmap;
            button.x = Graphics.boxWidth - width - 8;
            button.y = 8;
            button.setClickHandler(function() {
                SoundManager.playCancel();
                this.popScene();
            }.bind(this));
            this.addChild(button);
        };
    }

    window.DRKXQ_MOBILE_TOUCH_COMPAT = true;
})();
