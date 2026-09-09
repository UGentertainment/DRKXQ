const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sources = process.argv.slice(2).map(file => path.resolve(file));
const target = path.join(root, 'js', 'dzmm-translation-map.js');
if (!sources.length || sources.some(file => !fs.existsSync(file))) {
    throw new Error('Usage: node tools/build-translation-map.js <primary.json> [fallback.json ...]');
}
const translations = JSON.parse(fs.readFileSync(sources[0], 'utf8').replace(/^\uFEFF/, ''));

sources.slice(1).forEach(file => {
    const fallback = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    Object.keys(fallback).forEach(key => {
        if (!Object.prototype.hasOwnProperty.call(translations, key) || translations[key] === key) {
            translations[key] = fallback[key];
        }
    });
});

delete translations['# 【声明】写在最前'];
fs.writeFileSync(target,
    'window.DRKXQ_TRANSLATIONS=' + JSON.stringify(translations) + ';\n', 'utf8');
console.log('Built ' + target + ' with ' + Object.keys(translations).length +
    ' entries from ' + sources.length + ' source file(s).');
