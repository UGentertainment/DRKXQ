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
