/* Apply the root translation dictionary only at text-rendering boundaries. */
(function() {
    'use strict';

    var dictionary = window.DRKXQ_TRANSLATIONS || Object.create(null);
    var owns = Object.prototype.hasOwnProperty;
    var supplementalTranslations = {
        '\\c[14]メンテナンス\\c[0]へ': '\\c[14]维护\\c[0]',
        '\\c[14]深夜のジカン\\c[0]へ': '前往\\c[14]深夜时段\\c[0]',
        '\\c[14]該当データの保存': '\\c[14]保存对应数据',
        '(誰を呼び出そうかな)': '（叫谁过来呢？）',
        '◆レアリティ：': '◆稀有度：',
        'が釣れた！やったね！': '钓到了！太好了！',
        '解散しようかな？': '要解散吗？',
        '帰ろうかな？': '要回去吗？',
        '◆ミニゲームを': '◆要跳过小游戏吗？',
        'スキップしますか？': '要跳过吗？',
        'スキップ報酬：お小遣い+500': '跳过奖励：零花钱+500',
        'ありがとう、': '谢谢，',
        'ありがとう': '谢谢',
        '最新ドローンが': '最新型无人机',
        '飛んでる！': '正在飞！',
        '……\\.ん？': '……\\.嗯？',
        'わっはっはっは！': '哇哈哈哈哈！',
        'どうしよう…？': '该怎么办呢……？'
    };
    Object.keys(supplementalTranslations).forEach(function(source) {
        dictionary[source] = supplementalTranslations[source];
    });
    var normalizedDictionary = Object.create(null);

    function normalizeLookupKey(value) {
        return String(value).replace(/[\s\u3000。、，,！!？?…‥・「」『』【】（）()～〜―—\-]/g, '');
    }

    Object.keys(dictionary).forEach(function(source) {
        var target = dictionary[source];
        if (typeof target !== 'string' || target === source || /\\/.test(source) ||
                /[\u3040-\u30ff]/.test(target)) return;
        var normalized = normalizeLookupKey(source);
        if (normalized.length < 3) return;
        if (!owns.call(normalizedDictionary, normalized)) {
            normalizedDictionary[normalized] = target;
        } else if (normalizedDictionary[normalized] !== target) {
            normalizedDictionary[normalized] = null;
        }
    });

    function sanitizeAdultLanguage(value) {
        if (typeof value !== 'string') return value;
        return value
            .replace(/子供パンツ/g, '可愛いパンツ')
            .replace(/子供部屋/g, '寝室')
            .replace(/(?:小学生|中学生|高校生)の頃/g, '若い頃')
            .replace(/中学生以来/g, '昔以来')
            .replace(/学生時代/g, '若い頃')
            .replace(/女学生/g, '成人女性')
            .replace(/小学生|中学生|高校生|未成年|児童/g, '成人')
            .replace(/子供の頃|子供だった|子供の時|子供時代/g, '昔')
            .replace(/子供達/g, '皆')
            .replace(/子供/g, '大人')
            .replace(/男の子/g, '成人男性')
            .replace(/女の子/g, '成人女性')
            .replace(/この子/g, 'この人')
            .replace(/あの子/g, 'あの人')
            .replace(/良い子/g, '立派な大人')
            .replace(/少年/g, '青年')
            .replace(/少女|ロリ/g, '成人女性')
            .replace(/学校/g, '大学')
            .replace(/宿題/g, '課題')
            .replace(/冬休み/g, '冬季休暇')
            .replace(/学生ながら/g, '若手ながら')
            .replace(/学生/g, '成年人')
            .replace(/儿童内裤|孩子内裤/g, '可爱内裤')
            .replace(/儿童房|孩子的房间/g, '卧室')
            .replace(/小学时|初中时|高中时|学生时代/g, '年轻时')
            .replace(/小学生|中学生|高中生|未成年人|未成年|儿童/g, '成年人')
            .replace(/孩子们/g, '大家')
            .replace(/孩子气/g, '天真')
            .replace(/这孩子|那个孩子/g, '这位成年人')
            .replace(/孩子/g, '成年人')
            .replace(/男孩/g, '成年男性')
            .replace(/女孩/g, '成年女性')
            .replace(/少年/g, '青年')
            .replace(/少女|萝莉|幼女/g, '成年女性')
            .replace(/学校/g, '大学')
            .replace(/作业/g, '课题')
            .replace(/寒假/g, '冬季假期')
            .replace(/学生/g, '成年人')
            .replace(/\b(?:underage|minor|child|kid|teen(?:ager)?)\b/gi, 'adult')
            .replace(/\bschool\b/gi, 'college')
            .replace(/\bhomework\b/gi, 'assignment')
            .replace(/(\d{1,2})(岁|歳|才)/g, function(all, number, suffix) {
                return Number(number) < 18 ? '18' + suffix : all;
            });
    }

    function translateExact(value) {
        if (typeof value !== 'string') return value;
        var translated = owns.call(dictionary, value) && typeof dictionary[value] === 'string' ?
            dictionary[value] : value;
        if (translated === value && !/\\/.test(value)) {
            var normalized = normalizeLookupKey(value);
            if (normalized.length >= 3 && typeof normalizedDictionary[normalized] === 'string') {
                translated = normalizedDictionary[normalized];
            }
        }
        return sanitizeAdultLanguage(translated);
    }

    function translateLines(value) {
        if (typeof value !== 'string') return value;
        if (owns.call(dictionary, value) && typeof dictionary[value] === 'string') {
            return sanitizeAdultLanguage(dictionary[value]);
        }
        return value.split('\n').map(translateRmmvLine).join('\n');
    }

    function translateTextPiece(value) {
        var whitespace = value.match(/^([ \u3000]*)(.*?)([ \u3000]*)$/);
        if (!whitespace) return translateExact(value);
        var translated = translateExact(whitespace[2]);
        return translated !== whitespace[2] ?
            whitespace[1] + translated + whitespace[3] : value;
    }

    function translateRmmvLine(value) {
        var direct = translateExact(value);
        if (direct !== value) return direct;

        var leading = '';
        var trailing = '';
        var clean = value;
        var leadingMatch = clean.match(/^((?:\\(?:[A-Za-z]+\[[^\]]*\]|[.>|<!^{}]))+)/);
        if (leadingMatch) {
            leading = leadingMatch[1];
            clean = clean.slice(leading.length);
        }
        var whitespaceMatch = clean.match(/^[ \u3000]+/);
        if (whitespaceMatch) {
            leading += whitespaceMatch[0];
            clean = clean.slice(whitespaceMatch[0].length);
        }
        var trailingMatch = clean.match(/((?:\\(?:[A-Za-z]+\[[^\]]*\]|[.>|<!^{}]))+)$/);
        if (trailingMatch) {
            trailing = trailingMatch[1];
            clean = clean.slice(0, -trailing.length);
        }

        var translated = translateExact(clean);
        if (translated !== clean) return leading + translated + trailing;

        // MTool stores many phrases without RPG Maker control codes, while the
        // game inserts color/name/wait codes in the middle of a displayed line.
        // Translate the visible pieces independently and preserve every code in
        // its original position.
        var controlPattern = /(\\(?:[A-Za-z]+(?:\[[^\]]*\])?|[.>|<!^{}]))/g;
        var pieces = clean.split(controlPattern);
        if (pieces.length > 1) {
            var changed = false;
            pieces = pieces.map(function(piece) {
                if (!piece || controlPattern.test(piece)) {
                    controlPattern.lastIndex = 0;
                    return piece;
                }
                controlPattern.lastIndex = 0;
                var pieceTranslation = translateTextPiece(piece);
                if (pieceTranslation !== piece) changed = true;
                return pieceTranslation;
            });
            if (changed) return leading + pieces.join('') + trailing;
        }
        return value;
    }

    var originalConvert = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function(text) {
        return originalConvert.call(this, translateLines(text));
    };

    var originalSetChoices = Game_Message.prototype.setChoices;
    Game_Message.prototype.setChoices = function(choices, defaultType, cancelType) {
        return originalSetChoices.call(this, choices.map(translateLines), defaultType, cancelType);
    };

    var originalDrawText = Bitmap.prototype.drawText;
    Bitmap.prototype.drawText = function(text) {
        if (typeof text === 'string' && text.length > 1) {
            arguments[0] = translateExact(text);
        }
        return originalDrawText.apply(this, arguments);
    };

    window.DRKXQ_TRANSLATION_ACTIVE = true;
    window.DRKXQ_ADULT_LANGUAGE_FILTER_ACTIVE = true;
})();
