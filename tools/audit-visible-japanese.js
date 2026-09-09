'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mapText = fs.readFileSync(path.join(root, 'js', 'dzmm-translation-map.js'), 'utf8');
const dictionary = JSON.parse(mapText.replace(/^window\.DRKXQ_TRANSLATIONS=/, '').replace(/;\s*$/, ''));
Object.assign(dictionary, {
    '\\c[14]メンテナンス\\c[0]へ': '\\c[14]维护\\c[0]',
    '\\c[14]深夜のジカン\\c[0]へ': '前往\\c[14]深夜时段\\c[0]',
    '\\c[14]該当データの保存': '\\c[14]保存对应数据',
    '(誰を呼び出そうかな)': '（叫谁过来呢？）',
    '◆レアリティ：': '◆稀有度：',
    'が釣れた！やったね！': '钓到了！太好了！',
    '解散しようかな？': '要解散吗？',
    '帰ろうかな？': '要回去吗？',
    'どうしよう…？': '该怎么办呢……？',
    '\\C[14](どうしよう…？)': '\\C[14]（该怎么办呢……？）',
    '\\c[14]（最新ドローンが\n　飛んでる！）': '\\c[14]（最新型无人机\n　正在飞！）',
    '\\c[14]（僕もちょっと\n　やってみたいな…）': '\\c[14]（我也有点\n　想试试看……）',
    'この画面では１日の終わりの処理を行うことができ、\n主に\\c[14]スキルの習得\\c[0]や\\c[14]絵日記を描く\\c[0]等ができます。': '在这个画面可以处理一天结束时的事务，\n主要能\\c[14]学习技能\\c[0]、\\c[14]绘制日记\\c[0]等。',
    'ゲーム本編中、イベントをこなしたり\nエッチをすることで左下の\\c[14]「思い出ゲージ」\\c[0]が\n徐々に溜まっていきます。': '游戏过程中，完成事件或亲密互动后，\n左下角的\\c[14]“回忆槽”\\c[0]会逐渐累积。',
    '\\c[14]その日に起こした行動が絵日記のフラグ\\c[0]となっており、\n起こしていないイベントは描写することはできません。\\!\n沢山のイベントを探してみましょう！': '\\c[14]当天做过的行动会成为绘制日记的条件\\c[0]，\n没有触发过的事件无法画进日记。\\!\n请尽量寻找更多事件吧！',
    '以上でチュートリアルは終了です。\\!\nそれでは良いあまえんぼライフを(⌒▽⌒)丿': '教程到这里就结束了。\\!\n祝你享受愉快的撒娇生活！(⌒▽⌒)丿'
});
const owns = Object.prototype.hasOwnProperty;
const remaining = new Map();
const phraseIndex = Object.create(null);
const normalizedDictionary = Object.create(null);

function normalizeLookupKey(value) {
    return String(value).replace(/[\s\u3000。、，,！!？?…‥・「」『』【】（）()～〜―—\-]/g, '');
}

Object.keys(dictionary).forEach(source => {
    const target = dictionary[source];
    if (typeof target !== 'string' || target === source || /\\/.test(source) ||
            /[\u3040-\u30ff]/.test(target)) return;
    const normalized = normalizeLookupKey(source);
    if (normalized.length < 3) return;
    if (!owns.call(normalizedDictionary, normalized)) normalizedDictionary[normalized] = target;
    else if (normalizedDictionary[normalized] !== target) normalizedDictionary[normalized] = null;
});

Object.keys(dictionary).forEach(source => {
    const target = dictionary[source];
    if (typeof target !== 'string' || source === target || source.includes('\\') ||
            target.includes('\\') || source.includes('\n') || target.includes('\n') ||
            !hasJapanese(source) || hasJapanese(target) || source.length < 3) return;
    const first = source.charAt(0);
    (phraseIndex[first] || (phraseIndex[first] = [])).push({ source, target });
});
Object.keys(phraseIndex).forEach(first => phraseIndex[first].sort((a, b) => b.source.length - a.source.length));

function hasJapanese(value) {
    return /[\u3040-\u30ff]/.test(String(value));
}

function translateExact(value) {
    if (owns.call(dictionary, value) && typeof dictionary[value] === 'string') {
        const translated = dictionary[value];
        return hasJapanese(translated) ? translateByKnownPhrases(translated) : translated;
    }
    if (!/\\/.test(value)) {
        const normalized = normalizeLookupKey(value);
        if (normalized.length >= 3 && typeof normalizedDictionary[normalized] === 'string') {
            const translated = normalizedDictionary[normalized];
            return hasJapanese(translated) ? translateByKnownPhrases(translated) : translated;
        }
    }
    return value;
}

function translateLine(value) {
    const direct = translateExact(value);
    if (direct !== value) return direct;
    let leading = '';
    let trailing = '';
    let clean = value;
    const leadingMatch = clean.match(/^((?:\\(?:[A-Za-z]+\[[^\]]*\]|[.>|<!^{}]))+)/);
    if (leadingMatch) {
        leading = leadingMatch[1];
        clean = clean.slice(leading.length);
    }
    const whitespaceMatch = clean.match(/^[ \u3000]+/);
    if (whitespaceMatch) {
        leading += whitespaceMatch[0];
        clean = clean.slice(whitespaceMatch[0].length);
    }
    const trailingMatch = clean.match(/((?:\\(?:[A-Za-z]+\[[^\]]*\]|[.>|<!^{}]))+)$/);
    if (trailingMatch) {
        trailing = trailingMatch[1];
        clean = clean.slice(0, -trailing.length);
    }
    const translated = translateExact(clean);
    if (translated !== clean) return leading + translated + trailing;
    const controlPattern = /(\\(?:[A-Za-z]+(?:\[[^\]]*\])?|[.>|<!^{}]))/g;
    const pieces = clean.split(controlPattern);
    let changed = false;
    if (pieces.length > 1) {
        const output = pieces.map(piece => {
            controlPattern.lastIndex = 0;
            if (!piece || controlPattern.test(piece)) {
                controlPattern.lastIndex = 0;
                return piece;
            }
            controlPattern.lastIndex = 0;
            const match = piece.match(/^([ \u3000]*)(.*?)([ \u3000]*)$/);
            const pieceTranslation = match ? translateExact(match[2]) : translateExact(piece);
            if (match && pieceTranslation !== match[2]) {
                changed = true;
                return match[1] + pieceTranslation + match[3];
            }
            if (!match && pieceTranslation !== piece) changed = true;
            return pieceTranslation;
        });
        if (changed) return leading + output.join('') + trailing;
    }
    return value;
}

function translate(value) {
    const direct = translateExact(value);
    if (direct !== value) return direct;
    return value.split('\n').map(translateLine).join('\n');
}

function translateByKnownPhrases(value) {
    return String(value).split(/(\\(?:[A-Za-z]+(?:\[[^\]]*\])?|[.>|<!^{}]))/g).map(piece => {
        if (!piece || /^\\/.test(piece)) return piece;
        let output = '';
        for (let index = 0; index < piece.length;) {
            const candidates = phraseIndex[piece.charAt(index)] || [];
            const match = candidates.find(item => piece.startsWith(item.source, index));
            if (match) {
                output += match.target;
                index += match.source.length;
            } else {
                output += piece.charAt(index++);
            }
        }
        return output;
    }).join('');
}

function record(source, location, kind) {
    if (typeof source !== 'string' || !hasJapanese(source)) return;
    const result = translate(source);
    if (!hasJapanese(result)) return;
    const item = remaining.get(source) || { source, result, count: 0, kinds: [], locations: [] };
    item.count++;
    if (!item.kinds.includes(kind)) item.kinds.push(kind);
    if (item.locations.length < 5) item.locations.push(location);
    remaining.set(source, item);
}

function inspectList(list, location) {
    if (!Array.isArray(list)) return;
    for (let index = 0; index < list.length; index++) {
        const command = list[index];
        if (!command || !Array.isArray(command.parameters)) continue;
        if (command.code === 101 || command.code === 105) {
            const textCode = command.code === 101 ? 401 : 405;
            const lines = [];
            let cursor = index + 1;
            while (list[cursor] && list[cursor].code === textCode) {
                lines.push(list[cursor].parameters[0]);
                cursor++;
            }
            if (lines.length) record(lines.join('\n'), location + '[' + index + ']', 'message-block');
            index = cursor - 1;
        } else if (command.code === 102 && Array.isArray(command.parameters[0])) {
            command.parameters[0].forEach((choice, choiceIndex) =>
                record(choice, location + '[' + index + '].choices[' + choiceIndex + ']', 'choice'));
        }
    }
}

function walkLists(value, location) {
    if (Array.isArray(value)) {
        value.forEach((child, index) => walkLists(child, location + '[' + index + ']'));
    } else if (value && typeof value === 'object') {
        if (Array.isArray(value.list)) inspectList(value.list, location + '.list');
        Object.keys(value).forEach(key => {
            if (key !== 'list') walkLists(value[key], location + '.' + key);
        });
    }
}

const databaseFields = new Set([
    'displayName', 'name', 'nickname', 'description', 'profile',
    'message1', 'message2', 'message3', 'message4'
]);
function walkDatabase(value, location) {
    if (Array.isArray(value)) {
        value.forEach((child, index) => walkDatabase(child, location + '[' + index + ']'));
    } else if (value && typeof value === 'object') {
        Object.keys(value).forEach(key => {
            const child = value[key];
            if (databaseFields.has(key) && typeof child === 'string') {
                record(child, location + '.' + key, 'database');
            } else if (child && typeof child === 'object') {
                walkDatabase(child, location + '.' + key);
            }
        });
    }
}

const dataDir = path.join(root, 'data');
fs.readdirSync(dataDir).filter(name => name.endsWith('.json')).forEach(name => {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8').replace(/^\uFEFF/, ''));
    walkLists(data, name);
    if (!/^Map\d+\.json$/.test(name) && name !== 'CommonEvents.json') walkDatabase(data, name);
});

const requestedKind = process.env.DRKXQ_AUDIT_KIND;
const result = Array.from(remaining.values())
    .filter(item => !requestedKind || item.kinds.includes(requestedKind))
    .sort((a, b) => b.count - a.count || b.source.length - a.source.length);
const output = {
    remainingUnique: result.length,
    remainingOccurrences: result.reduce((sum, item) => sum + item.count, 0),
    byKind: result.reduce((all, item) => {
        item.kinds.forEach(kind => { all[kind] = (all[kind] || 0) + item.count; });
        return all;
    }, {}),
    afterKnownPhrasePass: {
        remainingUnique: result.filter(item => hasJapanese(translateByKnownPhrases(item.result))).length,
        remainingOccurrences: result.filter(item => hasJapanese(translateByKnownPhrases(item.result)))
            .reduce((sum, item) => sum + item.count, 0)
    },
    samples: result.slice(0, Number(process.env.DRKXQ_AUDIT_SAMPLES || 100))
};
console.log(JSON.stringify(output, null, 2));
