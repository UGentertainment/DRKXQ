'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.resolve(root, '..', '[神作SLG汉化全动态]冬日狂想曲 v1.061d AI精翻汉化正式版');
const sourceFiles = ['翻译文件.json', '(备选)翻译文件1.json'];

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function stripControls(value) {
    return String(value)
        .replace(/^((?:\\(?:[A-Za-z]+\[[^\]]*\]|[.>|<!^{}]))+)/, '')
        .replace(/((?:\\(?:[A-Za-z]+\[[^\]]*\]|[.>|<!^{}]))+)$/, '')
        .trim();
}

function isJapanese(value) {
    return /[\u3040-\u30ff]/.test(value);
}

const dictionaries = sourceFiles.map(function(name) {
    const file = path.join(sourceRoot, name);
    return { name, data: readJson(file) };
});
const currentText = fs.readFileSync(path.join(root, 'js', 'dzmm-translation-map.js'), 'utf8');
const current = JSON.parse(currentText.replace(/^window\.DRKXQ_TRANSLATIONS=/, '').replace(/;\s*$/, ''));

const counts = new Map();
function record(value, location) {
    if (typeof value !== 'string' || !isJapanese(value)) return;
    const item = counts.get(value) || { count: 0, locations: [] };
    item.count++;
    if (item.locations.length < 3) item.locations.push(location);
    counts.set(value, item);
}

function walk(value, location) {
    if (Array.isArray(value)) {
        value.forEach(function(child, index) { walk(child, location + '[' + index + ']'); });
        return;
    }
    if (!value || typeof value !== 'object') return;

    if (typeof value.code === 'number' && Array.isArray(value.parameters)) {
        if ((value.code === 401 || value.code === 405) && typeof value.parameters[0] === 'string') {
            record(value.parameters[0], location + '.parameters[0]');
        } else if (value.code === 102 && Array.isArray(value.parameters[0])) {
            value.parameters[0].forEach(function(choice, index) {
                record(choice, location + '.parameters[0][' + index + ']');
            });
        }
    }

    Object.keys(value).forEach(function(key) {
        const child = value[key];
        if (['name', 'nickname', 'description', 'profile', 'message1', 'message2',
                'message3', 'message4'].includes(key) && typeof child === 'string') {
            record(child, location + '.' + key);
        } else if (typeof child === 'object' && child !== null) {
            walk(child, location + '.' + key);
        }
    });
}

fs.readdirSync(path.join(root, 'data')).filter(function(name) {
    return name.endsWith('.json');
}).forEach(function(name) {
    walk(readJson(path.join(root, 'data', name)), name);
});

function lookup(dictionary, source) {
    if (Object.prototype.hasOwnProperty.call(dictionary, source)) return dictionary[source];
    const clean = stripControls(source);
    if (Object.prototype.hasOwnProperty.call(dictionary, clean)) return dictionary[clean];
    return null;
}

function report(dictionary, name) {
    let occurrences = 0;
    let coveredOccurrences = 0;
    const missing = [];
    counts.forEach(function(item, source) {
        occurrences += item.count;
        const translated = lookup(dictionary, source);
        if (typeof translated === 'string' && translated !== source && translated !== stripControls(source)) {
            coveredOccurrences += item.count;
        } else {
            missing.push({ source, count: item.count, locations: item.locations });
        }
    });
    missing.sort(function(a, b) { return b.count - a.count || b.source.length - a.source.length; });
    console.log(JSON.stringify({
        dictionary: name,
        entries: Object.keys(dictionary).length,
        uniqueJapaneseStrings: counts.size,
        occurrences,
        coveredOccurrences,
        coveragePercent: occurrences ? +(coveredOccurrences * 100 / occurrences).toFixed(2) : 100,
        missingUnique: missing.length,
        missingSamples: missing.slice(0, 30)
    }, null, 2));
}

report(current, 'current web map');
dictionaries.forEach(function(item) { report(item.data, item.name); });

const merged = Object.assign({}, dictionaries[0].data);
Object.keys(dictionaries[1].data).forEach(function(key) {
    const currentValue = merged[key];
    const fallbackValue = dictionaries[1].data[key];
    if (!Object.prototype.hasOwnProperty.call(merged, key) || currentValue === key) {
        merged[key] = fallbackValue;
    }
});
report(merged, 'primary plus untranslated backup entries');
