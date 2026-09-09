'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

(async function() {
    const appended = [];
    let started = 0;
    const sandbox = {
        Promise,
        console,
        $plugins: [],
        PluginManager: { setup() {} },
        Scene_Boot: function Scene_Boot() {},
        SceneManager: { run() { started++; } },
        window: { XRKXQSaveAdapter: null },
        document: {
            readyState: 'complete',
            createElement() { return {}; },
            body: {
                appendChild(script) {
                    appended.push(script.src);
                    Promise.resolve().then(script.onload);
                }
            }
        }
    };
    sandbox.window.window = sandbox.window;
    vm.createContext(sandbox);

    const mainPath = path.join(__dirname, '..', 'js', 'main.js');
    vm.runInContext(fs.readFileSync(mainPath, 'utf8'), sandbox, { filename: mainPath });

    assert.strictEqual(appended.length, 9, 'independent patches should start in parallel');
    assert(!appended.some(src => src.includes('dzmm-translation.js')),
        'translation runtime must wait for its supplemental data');

    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(appended.length, 10);
    assert(appended.some(src => src.includes('dzmm-translation.js')));
    assert.strictEqual(started, 1);

    console.log('startup loader tests passed');
})().catch(function(error) {
    console.error(error);
    process.exitCode = 1;
});
