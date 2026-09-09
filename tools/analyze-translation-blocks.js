'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mapText = fs.readFileSync(path.join(root, 'js', 'dzmm-translation-map.js'), 'utf8');
const dictionary = JSON.parse(mapText.replace(/^window\.DRKXQ_TRANSLATIONS=/, '').replace(/;\s*$/, ''));
const owns = Object.prototype.hasOwnProperty;

function translated(value) {
    return owns.call(dictionary, value) && typeof dictionary[value] === 'string' ?
        dictionary[value] : value;
}

let blocks = 0;
let wholeBlockMatches = 0;
let brokenByEarlyTranslation = 0;
const samples = [];

function inspectList(list, location) {
    if (!Array.isArray(list)) return;
    for (let index = 0; index < list.length; index++) {
        const command = list[index];
        if (!command || (command.code !== 101 && command.code !== 105)) continue;
        const textCode = command.code === 101 ? 401 : 405;
        const lines = [];
        let cursor = index + 1;
        while (list[cursor] && list[cursor].code === textCode) {
            lines.push(list[cursor].parameters[0]);
            cursor++;
        }
        if (!lines.length) continue;
        blocks++;
        const originalBlock = lines.join('\n');
        const earlyBlock = lines.map(translated).join('\n');
        if (translated(originalBlock) !== originalBlock) {
            wholeBlockMatches++;
            const expectedBlock = translated(originalBlock);
            if (lines.length > 1 && earlyBlock !== originalBlock &&
                    expectedBlock !== earlyBlock && translated(earlyBlock) === earlyBlock) {
                brokenByEarlyTranslation++;
                if (samples.length < 8) {
                    samples.push({
                        location: location + '[' + index + ']',
                        originalLines: lines,
                        earlyLines: earlyBlock.split('\n'),
                        translatedLines: expectedBlock.split('\n')
                    });
                }
            }
        }
    }
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
    return name.endsWith('.json');
}).forEach(function(name) {
    walk(JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8')
        .replace(/^\uFEFF/, '')), name);
});

console.log(JSON.stringify({ blocks, wholeBlockMatches, brokenByEarlyTranslation, samples }, null, 2));
