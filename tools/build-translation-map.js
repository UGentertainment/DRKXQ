const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = process.argv[2] ? path.resolve(process.argv[2]) : null;
const target = path.join(root, 'js', 'dzmm-translation-map.js');
if (!source || !fs.existsSync(source)) {
    throw new Error('Usage: node tools/build-translation-map.js <path-to-翻译文件.json>');
}
const translations = JSON.parse(fs.readFileSync(source, 'utf8').replace(/^\uFEFF/, ''));

delete translations['# 【声明】写在最前'];
fs.writeFileSync(target,
    'window.DRKXQ_TRANSLATIONS=' + JSON.stringify(translations) + ';\n', 'utf8');
console.log('Built ' + target + ' with ' + Object.keys(translations).length + ' entries.');
