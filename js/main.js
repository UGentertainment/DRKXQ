//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

(function() {
    'use strict';

    var patchScripts = [
        'dzmm-translation.js',
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
            script.src = 'js/' + name + '?v=20260908-3';
            script.onload = resolve;
            script.onerror = function() {
                reject(new Error('Failed to load browser patch: ' + name));
            };
            document.body.appendChild(script);
        });
    }

    function startGame() {
        patchScripts.reduce(function(chain, name) {
            return chain.then(function() { return loadPatchScript(name); });
        }, Promise.resolve()).then(function() {
            return window.XRKXQSaveAdapter ?
                window.XRKXQSaveAdapter.initialize() : Promise.resolve();
        }).then(function() {
            SceneManager.run(Scene_Boot);
        }).catch(function(error) {
            console.error(error);
            SceneManager.run(Scene_Boot);
        });
    }

    window.addEventListener('load', startGame, { once: true });
})();
