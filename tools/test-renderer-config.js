'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'js', 'plugins.js'), 'utf8'),
    sandbox
);

const communityBasic = sandbox.$plugins.find(function(plugin) {
    return plugin.name === 'Community_Basic';
});

assert(communityBasic, 'Community_Basic plugin is missing');
assert.strictEqual(communityBasic.parameters.renderingMode, 'auto');
console.log('renderer configuration test passed');
