/* Browser and iframe guards for APIs that desktop NW.js assumes are available. */
(function() {
    'use strict';

    var originalPollGamepads = Input._pollGamepads;
    Input._pollGamepads = function() {
        if (this._drkxqGamepadBlocked) return;
        try {
            originalPollGamepads.apply(this, arguments);
        } catch (error) {
            if (error && (error.name === 'SecurityError' || /gamepad/i.test(String(error)))) {
                this._drkxqGamepadBlocked = true;
                return;
            }
            throw error;
        }
    };

    var originalGetPixel = Bitmap.prototype.getPixel;
    Bitmap.prototype.getPixel = function(x, y) {
        try { return originalGetPixel.apply(this, arguments); }
        catch (_) { return '#ffffff'; }
    };

    var originalGetAlphaPixel = Bitmap.prototype.getAlphaPixel;
    Bitmap.prototype.getAlphaPixel = function(x, y) {
        try { return originalGetAlphaPixel.apply(this, arguments); }
        catch (_) { return 255; }
    };

    window.DRKXQ_BROWSER_COMPAT = true;
})();
