const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function collect(baseDir, extensions, keyForDirectory) {
    const result = {};
    const absoluteBase = path.join(root, baseDir);
    const pending = [absoluteBase];
    while (pending.length) {
        const directory = pending.pop();
        const files = fs.readdirSync(directory, { withFileTypes: true });
        const values = {};
        for (const file of files) {
            if (file.isDirectory()) {
                pending.push(path.join(directory, file.name));
                continue;
            }
            if (!file.isFile()) continue;
            const extension = path.extname(file.name).toLowerCase();
            if (!extensions.includes(extension)) continue;
            const basename = file.name.slice(0, -extension.length);
            values[basename.toLowerCase()] = basename;
        }
        if (Object.keys(values).length) {
            const relative = path.relative(absoluteBase, directory).replace(/\\/g, '/');
            result[keyForDirectory(relative)] = values;
        }
    }
    return result;
}

function collectDirectoryNames(baseDir, keyForDirectory, valueForDirectory) {
    const result = {};
    const absoluteBase = path.join(root, baseDir);
    const pending = [absoluteBase];
    while (pending.length) {
        const directory = pending.pop();
        const relative = path.relative(absoluteBase, directory).replace(/\\/g, '/');
        if (relative) result[keyForDirectory(relative)] = valueForDirectory(relative);
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            if (entry.isDirectory()) pending.push(path.join(directory, entry.name));
        }
    }
    return result;
}

const manifest = {
    image: collect('img', ['.rpgmvp', '.png', '.jpg', '.jpeg', '.webp'], name => 'img/' + name.toLowerCase() + '/'),
    imageFolders: collectDirectoryNames('img', name => 'img/' + name.toLowerCase() + '/', name => 'img/' + name + '/'),
    audio: collect('audio', ['.rpgmvo', '.ogg', '.m4a'], name => name.toLowerCase()),
    audioFolders: collectDirectoryNames('audio', name => name.toLowerCase(), name => name)
};

const output = '(function(){window.XRKXQ_ASSET_CASE_MAP=' + JSON.stringify(manifest) + ';})();\n';
fs.writeFileSync(path.join(root, 'js', 'dzmm-asset-case-map.js'), output, 'utf8');
console.log('generated js/dzmm-asset-case-map.js (' + Buffer.byteLength(output) + ' bytes)');
