/* Hide only the 139x217 male dialogue portrait animation series. */
(function() {
    'use strict';

    var portrait = /^主人公(?:\(パ\)|\(裸\))?\d*(?:カメラ)?_\d{4}$/i;
    var transparentBitmap = null;

    function emptyBitmap() {
        if (!transparentBitmap) {
            transparentBitmap = new Bitmap(139, 217);
            transparentBitmap.smooth = true;
            // Preserve picture-button hit testing where a portrait is clickable.
            transparentBitmap.getAlphaPixel = function() { return 255; };
        }
        return transparentBitmap;
    }

    var originalLoadPicture = ImageManager.loadPicture;
    ImageManager.loadPicture = function(filename, hue) {
        if (portrait.test(String(filename || ''))) return emptyBitmap();
        return originalLoadPicture.call(this, filename, hue);
    };

    window.DRKXQ_PROTAGONIST_PORTRAITS_HIDDEN = true;
})();
