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

    /*
     * A canvas becomes permanently tainted after a cross-origin image is drawn
     * onto it. PIXI then throws while uploading that canvas to WebGL. Keep the
     * texture's dimensions but replace only the blocked pixels with a clean,
     * transparent allocation so one optional picture cannot stop the game.
     */
    var GLTexture = window.PIXI && PIXI.glCore && PIXI.glCore.GLTexture;
    if (GLTexture && !GLTexture.prototype._drkxqTaintGuard) {
        var originalTextureUpload = GLTexture.prototype.upload;

        GLTexture.prototype.upload = function(source) {
            var width = Math.max(1, Number(source && (source.videoWidth || source.width)) || 1);
            var height = Math.max(1, Number(source && (source.videoHeight || source.height)) || 1);

            if (this._drkxqTaintedSource === source &&
                    this.width === width && this.height === height) {
                return;
            }

            try {
                return originalTextureUpload.apply(this, arguments);
            } catch (error) {
                var message = String(error && (error.message || error));
                var isTainted = error && (error.name === 'SecurityError' ||
                    /tainted canvas|cross-origin/i.test(message));
                if (!isTainted) throw error;

                this.bind();
                var gl = this.gl;
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
                gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0,
                    this.format, this.type, null);
                this.width = width;
                this.height = height;
                this._drkxqTaintedSource = source;
            }
        };

        GLTexture.prototype._drkxqTaintGuard = true;
    }

    window.DRKXQ_BROWSER_COMPAT = true;
})();
