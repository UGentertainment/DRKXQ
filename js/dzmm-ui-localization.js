(function() {
    'use strict';

    var labels = Object.create(null);
    labels['title_\u306f\u3058\u3081\u304b\u3089'] = '\u5f00\u59cb\u6e38\u620f';
    labels['title_\u3064\u3065\u304d\u304b\u3089'] = '\u7ee7\u7eed\u6e38\u620f';
    labels['title_\u30aa\u30d7\u30b7\u30e7\u30f3'] = '\u6e38\u620f\u8bbe\u7f6e';
    labels['title_\u56de\u60f3\u90e8\u5c4b'] = '\u56de\u60f3\u623f\u95f4';

    var localized = Object.create(null);
    var originalLoadPicture = ImageManager.loadPicture;

    function makeTitleButton(label) {
        var bitmap = new Bitmap(176, 16);
        bitmap.fontFace = 'GameFont, Microsoft YaHei, sans-serif';
        bitmap.fontSize = 14;
        bitmap.textColor = '#242424';
        bitmap.outlineWidth = 0;
        bitmap.fillRect(0, 7, 16, 1, '#555555');
        bitmap.fillRect(160, 7, 16, 1, '#555555');
        bitmap.drawText(label, 20, 0, 136, 16, 'center');
        return bitmap;
    }

    function makeOpeningNotice() {
        var bitmap = new Bitmap(745, 450);
        bitmap.fillAll('#ffffff');
        bitmap.fontFace = 'GameFont, Microsoft YaHei, sans-serif';
        bitmap.outlineWidth = 0;
        bitmap.fontSize = 24;
        bitmap.textColor = '#d85a5a';
        bitmap.drawText('\u6ce8\u610f', 0, 88, 745, 34, 'center');
        bitmap.fontSize = 19;
        bitmap.textColor = '#333333';
        bitmap.drawText('\u672c\u4f5c\u662f\u300a\u590f\u65e5\u72c2\u60f3\u66f2\u300b\u53ca\u5176\u6269\u5c55\u5185\u5bb9\u7684\u7eed\u4f5c\u3002',
            0, 145, 745, 28, 'center');
        bitmap.drawText('\u6e38\u73a9\u300a\u51ac\u65e5\u72c2\u60f3\u66f2\u300b\u524d\uff0c', 0, 205, 745, 28, 'center');
        bitmap.drawText('\u5f3a\u70c8\u5efa\u8bae\u5148\u4f53\u9a8c\u524d\u4f5c\u300a\u590f\u65e5\u72c2\u60f3\u66f2\u300b\u53ca\u5176\u6269\u5c55\u5185\u5bb9\u3002',
            0, 235, 745, 28, 'center');
        return bitmap;
    }

    ImageManager.loadPicture = function(filename, hue) {
        if (filename === 'OP_\u6ce8\u610f') {
            if (!localized.openingNotice) localized.openingNotice = makeOpeningNotice();
            return localized.openingNotice;
        }
        if (!Object.prototype.hasOwnProperty.call(labels, filename)) {
            return originalLoadPicture.call(this, filename, hue);
        }
        var key = filename + ':' + (hue || 0);
        if (!localized[key]) localized[key] = makeTitleButton(labels[filename]);
        return localized[key];
    };
})();
