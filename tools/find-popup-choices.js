'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const results = [];

function summarize(command, index) {
    if (!command) return null;
    if (![101, 102, 401, 356].includes(command.code)) return null;
    return { index, code: command.code, indent: command.indent, parameters: command.parameters };
}

function inspectList(list, location) {
    if (!Array.isArray(list)) return;
    list.forEach(function(command, index) {
        if (!command || command.code !== 102) return;
        const nearby = [];
        for (let i = Math.max(0, index - 18); i <= Math.min(list.length - 1, index + 4); i++) {
            const item = summarize(list[i], i);
            if (item) nearby.push(item);
        }
        if (nearby.some(function(item) {
            return item.code === 356 && /(?:MWP|EMW)/i.test(String(item.parameters[0] || ''));
        })) results.push({ location: location + '[' + index + ']', nearby });
    });
}

function walk(value, location) {
    if (Array.isArray(value)) {
        value.forEach(function(child, index) { walk(child, location + '[' + index + ']'); });
    } else if (value && typeof value === 'object') {
        if (Array.isArray(value.list)) inspectList(value.list, location + '.list');
        Object.keys(value).forEach(function(key) {
            if (key !== 'list') walk(value[key], location + '.' + key);
        });
    }
}

fs.readdirSync(path.join(root, 'data')).filter(function(name) {
    return /^(?:Map\d+|CommonEvents)\.json$/.test(name);
}).forEach(function(name) {
    const data = JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8')
        .replace(/^\uFEFF/, ''));
    walk(data, name);
});

console.log(JSON.stringify({ count: results.length, results: results.slice(0, 80) }, null, 2));
