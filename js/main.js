//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

(function() {
    'use strict';

    var patchScripts = [
        'dzmm-visible-translation-supplement.js',
        'dzmm-translation.js',
        'dzmm-ui-localization.js',
        'dzmm-browser-compat.js',
        'dzmm-case-sensitive-assets.js',
        'dzmm-mobile-touch-compat.js',
        'dzmm-hide-protagonist-portraits.js',
        'dzmm-responsive-display.js',
        'dzmm-save-adapter.js',
        'dzmm-choice-window-compat.js'
    ];

    function loadPatchScript(name) {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = 'js/' + name + '?v=20260909-12';
            script.onload = resolve;
            script.onerror = function() {
                reject(new Error('Failed to load browser patch: ' + name));
            };
            document.body.appendChild(script);
        });
    }

    function startGame() {
        var visibleTranslations = loadPatchScript(patchScripts[0]);
        var translationRuntime = visibleTranslations.then(function() {
            return loadPatchScript(patchScripts[1]);
        });
        var independentNames = patchScripts.slice(2);
        var independentPatches = independentNames.map(loadPatchScript);
        var saveAdapterIndex = independentNames.indexOf('dzmm-save-adapter.js');
        var saveReady = independentPatches[saveAdapterIndex].then(function() {
            return window.XRKXQSaveAdapter ?
                window.XRKXQSaveAdapter.initialize() : Promise.resolve();
        });

        Promise.all([translationRuntime, saveReady].concat(independentPatches)).then(function() {
            SceneManager.run(Scene_Boot);
        }).catch(function(error) {
            console.error(error);
            SceneManager.run(Scene_Boot);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGame, { once: true });
    } else {
        startGame();
    }
})();
