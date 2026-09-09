/* Apply the root translation dictionary only at text-rendering boundaries. */
(function() {
    'use strict';

    var dictionary = window.DRKXQ_TRANSLATIONS || Object.create(null);
    var owns = Object.prototype.hasOwnProperty;
    var supplementalTranslations = {
        '\u306f\u3058\u3081\u304b\u3089': '\u5f00\u59cb\u6e38\u620f',
        '\u3064\u3065\u304d\u304b\u3089': '\u7ee7\u7eed\u6e38\u620f',
        '\u30aa\u30d7\u30b7\u30e7\u30f3': '\u9009\u9879',
        '\u5e38\u6642\u30c0\u30c3\u30b7\u30e5': '\u59cb\u7ec8\u5954\u8dd1',
        '\u30b3\u30de\u30f3\u30c9\u8a18\u61b6': '\u8bb0\u5fc6\u6307\u4ee4',
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
        'どうしよう…？': '该怎么办呢……？',
        '\\C[14](どうしよう…？)': '\\C[14]（该怎么办呢……？）',
        '\\c[14]（最新ドローンが\n　飛んでる！）': '\\c[14]（最新型无人机\n　正在飞！）',
        '\\c[14]（僕もちょっと\n　やってみたいな…）': '\\c[14]（我也有点\n　想试试看……）',
        'この画面では１日の終わりの処理を行うことができ、\n主に\\c[14]スキルの習得\\c[0]や\\c[14]絵日記を描く\\c[0]等ができます。': '在这个画面可以处理一天结束时的事务，\n主要能\\c[14]学习技能\\c[0]、\\c[14]绘制日记\\c[0]等。',
        'ゲーム本編中、イベントをこなしたり\nエッチをすることで左下の\\c[14]「思い出ゲージ」\\c[0]が\n徐々に溜まっていきます。': '游戏过程中，完成事件或亲密互动后，\n左下角的\\c[14]“回忆槽”\\c[0]会逐渐累积。',
        '\\c[14]その日に起こした行動が絵日記のフラグ\\c[0]となっており、\n起こしていないイベントは描写することはできません。\\!\n沢山のイベントを探してみましょう！': '\\c[14]当天做过的行动会成为绘制日记的条件\\c[0]，\n没有触发过的事件无法画进日记。\\!\n请尽量寻找更多事件吧！',
        '以上でチュートリアルは終了です。\\!\nそれでは良いあまえんぼライフを(⌒▽⌒)丿': '教程到这里就结束了。\\!\n祝你享受愉快的撒娇生活！(⌒▽⌒)丿',
        '凄くエッチだよ…っ': '真的好色情啊……',
        'ちゅ…っんむ…っ\nんっ……んちゅ…っ': '啾……嗯……\n嗯……啾……',
        '\\>あっ\\kw[1]イクっ\\kw[1]\\<\n\\>っ\\kw[1]ん…っ\\kw[1]\\<\\^': '\\>啊……\\kw[1]要去了\\kw[1]\\<\n\\>嗯……\\kw[1]嗯……\\kw[1]\\<\\^',
        '小さくなったおちんちん\n舐めたりしゃぶったりして…\\kw[1]': '变软之后，\n再舔一舔、含一含……\\kw[1]',
        '私のパンツの写真なら\nいくらでも撮って良いけど…\\kw[1]': '如果只是拍我的内裤，\n想拍多少都可以……\\kw[1]',
        'もし途中でおちんちん\n大きくなっちゃったら…\\kw[1]': '如果中途那里\n变大了的话……\\kw[1]',
        'んっ…んちゅ…っ\nすー…っはー…っ': '嗯……啾……\n呼……哈……',
        '\\>＞\\c[14]【体位解禁】\\c[0]\\<\n　マップ上\\c[14]どこでもHが可能\\c[0]な状態になったぞ！\n　スキルホルダーから体位を選んでエッチしてみよう！': '\\>＞\\c[14]【体位解锁】\\c[0]\\<\n　现在可以在地图上\\c[14]任何地方亲密互动\\c[0]了！\n　从技能栏选择体位试试看吧！',
        'ずちゅ\\kw[1]ずちゅ\\kw[1]と卑猥な音が室内に響き、\nその度美雪のおまんこがくちゅくちゅ\\kw[1]と締め上がる': '噗嗤\\kw[1]噗嗤\\kw[1]的淫靡水声在室内回响，\n美雪的体内也随之咕啾咕啾地\\kw[1]收紧',
        'ん…っ\\kw[1]\\.あっ\\kw[1]\\.\nズチュズチュ\\kw[1]って音、\n響いて…っ\\kw[1]あん\\kw[1]': '嗯……\\kw[1]\\.啊……\\kw[1]\\.\n噗嗤噗嗤的声音\\kw[1]，\n都传出来了……\\kw[1]啊嗯\\kw[1]',
        'まるで買って貰った玩具を夢中で遊ぶ子供のように、\n恍惚とした表情でパンパン\\kw[1]と腰を打ち付ける\\n[1]': '仿佛沉迷于新玩具一般，\n\\n[1]带着恍惚的表情啪啪地\\kw[1]摆动腰身',
        '2度も3度も、朝まで犯し続ける為に必要な精子を\n作らなくてはと、雄の本能が\\n[1]の身体に促していく': '为了能一次又一次持续到天亮，\n雄性的本能催促着\\n[1]的身体制造更多精液',
        '誘惑するセリフの連続に、自然と手を引っ張る腕に\n力が入り、\\n[1]のピストンの速度が上がっていく': '接连不断的诱惑话语让拉住她手臂的力道自然加重，\n\\n[1]抽送的速度也越来越快',
        '\\n[1]のおちんちんを離すまいと膣に力を入れ、\nギュッギュッ\\kw[1]と竿に刺激を与えていく': '她用体内紧紧夹住\\n[1]的阴茎不肯放开，\n一阵阵收缩着\\kw[1]给予刺激',
        '目の前の雌を自分のモノにする為に、\\n[1]の肉棒は\n剛直さを取り戻し再び結衣の膣内を刺激する': '为了将眼前的女人彻底占为己有，\\n[1]的肉棒\n重新恢复坚硬，再次刺激着结衣的体内',
        '先程イったばかりの身体が更なる絶頂を期待し、\n自然と膣で\\n[1]のおちんぽ様を愛撫してしまう': '刚刚高潮过的身体期待着更强烈的快感，\n不由自主地用体内爱抚着\\n[1]的阴茎',
        'おいでおいで\\kw[1]と誘惑するような表情と\n姿勢に\\n[1]は生唾をゴクリと飲み込む': '面对那副招手引诱般的表情与姿势，\\kw[1]\n\\n[1]忍不住咽了一口唾沫',
        'ぴちゃぴちゃ\\kw[1]と卑猥な水音と共にお互いの\n気持ちを確かめ合うようなキスをする': '伴随着啪嗒啪嗒的淫靡水声，\\kw[1]\n两人像在确认彼此心意一般接吻'
    };
    Object.keys(supplementalTranslations).forEach(function(source) {
        dictionary[source] = supplementalTranslations[source];
    });
    var visibleSupplement = window.DRKXQ_VISIBLE_TRANSLATIONS || Object.create(null);
    Object.keys(visibleSupplement).forEach(function(source) {
        dictionary[source] = visibleSupplement[source];
    });

    if (window.Scene_Boot && Scene_Boot.prototype.updateDocumentTitle) {
        Scene_Boot.prototype.updateDocumentTitle = function() {
            document.title = '\u51ac\u65e5\u72c2\u60f3\u66f2\uff08ver1.061d\uff09';
        };
    }
    var normalizedDictionary = Object.create(null);
    var phraseIndex = Object.create(null);

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

    // The source patch contains some values where only half of a message was
    // translated. Reuse longer, complete phrases from the same dictionary to
    // finish those values. Short particles are excluded to avoid damaging
    // names and Japanese grammar that still needs a full translation.
    Object.keys(dictionary).forEach(function(source) {
        var target = dictionary[source];
        if (typeof target !== 'string' || target === source || source.length < 3 ||
                source.indexOf('\\') >= 0 || source.indexOf('\n') >= 0 ||
                target.indexOf('\\') >= 0 || target.indexOf('\n') >= 0 ||
                /[\u3040-\u30ff]/.test(target)) return;
        var first = source.charAt(0);
        (phraseIndex[first] || (phraseIndex[first] = [])).push({ source: source, target: target });
    });
    Object.keys(phraseIndex).forEach(function(first) {
        phraseIndex[first].sort(function(a, b) { return b.source.length - a.source.length; });
    });

    function translateKnownPhrases(value) {
        return String(value).split(/(\\(?:[A-Za-z]+(?:\[[^\]]*\])?|[.>|<!^{}]))/g)
            .map(function(piece) {
                if (!piece || /^\\/.test(piece)) return piece;
                var output = '';
                for (var index = 0; index < piece.length;) {
                    var candidates = phraseIndex[piece.charAt(index)] || [];
                    var match = null;
                    for (var i = 0; i < candidates.length; i++) {
                        if (piece.substr(index, candidates[i].source.length) === candidates[i].source) {
                            match = candidates[i];
                            break;
                        }
                    }
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
        if (translated !== value && /[\u3040-\u30ff]/.test(translated)) {
            translated = translateKnownPhrases(translated);
        }
        return sanitizeAdultLanguage(translated);
    }

    function translateLines(value) {
        if (typeof value !== 'string') return value;
        if (owns.call(dictionary, value) && typeof dictionary[value] === 'string') {
            return translateExact(value);
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

    if (window.Window_Command && Window_Command.prototype.addCommand) {
        var originalAddCommand = Window_Command.prototype.addCommand;
        Window_Command.prototype.addCommand = function(name) {
            if (typeof name === 'string') arguments[0] = translateExact(name);
            return originalAddCommand.apply(this, arguments);
        };
    }

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
