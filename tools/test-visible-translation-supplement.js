'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'js', 'dzmm-visible-translation-supplement.js');
const source = fs.readFileSync(file, 'utf8');
const prefix = 'window.DRKXQ_VISIBLE_TRANSLATIONS=';
if (!source.startsWith(prefix)) throw new Error('Unexpected supplement prefix');
const dictionary = JSON.parse(source.slice(prefix.length).replace(/;\s*$/, ''));
const controlPattern = /\\(?:[A-Za-z]+(?:\[[^\]]*\])?|[.>|<!^{}])/g;
const failures = [];

Object.keys(dictionary).forEach(function(original) {
    const translated = dictionary[original];
    const originalControls = original.match(controlPattern) || [];
    const translatedControls = translated.match(controlPattern) || [];
    const originalLines = (original.match(/\n/g) || []).length;
    const translatedLines = (translated.match(/\n/g) || []).length;
    if (JSON.stringify(originalControls) !== JSON.stringify(translatedControls) ||
            originalLines !== translatedLines || /DZMM|data-dzmm|<span|<br/i.test(translated)) {
        failures.push({ original, translated, originalControls, translatedControls,
            originalLines, translatedLines });
    }
});

if (failures.length) {
    console.error(JSON.stringify(failures.slice(0, 20), null, 2));
    throw new Error(failures.length + ' supplement entries changed formatting controls');
}
console.log('Validated ' + Object.keys(dictionary).length +
    ' supplemental translations with intact controls and newlines');
