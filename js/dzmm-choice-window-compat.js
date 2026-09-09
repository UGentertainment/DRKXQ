/*:
 * @plugindesc Web/iframe compatibility guard for FTKR extended choice windows.
 * @author DZMM
 *
 * This file intentionally affects Window_ChoiceListEx only.  The game's normal
 * choice windows (including the name confirmation at the beginning) keep the
 * original RPG Maker MV behaviour.
 */
(function() {
    'use strict';

    if (typeof Window_ChoiceListEx === 'undefined' ||
            typeof Window_MessageEx === 'undefined') {
        return;
    }

    // Winter Memories uses invisible map events as anchors for its prompt
    // balloons (for example: MWP_VALID 6 1 1).  Some maps do not contain the
    // requested anchor, so MessageWindowPopup reports that the message is not
    // a popup at all.  The prompt then disappears and its choice sub-window
    // falls back to the default top-left placement.  Keep the normal anchor
    // whenever it exists, and use the player only for a configured-but-missing
    // target so the prompt and choice remain one popup unit.
    var originalPopupTarget = Window_MessageEx.prototype.getPopupTargetCharacter;
    Window_MessageEx.prototype.getPopupTargetCharacter = function() {
        var target = originalPopupTarget.apply(this, arguments);
        var configuredId = Number(this._targetCharacterId);
        if (!target && isFinite(configuredId) && configuredId !== 0 &&
                typeof $gamePlayer !== 'undefined' && $gamePlayer) {
            window.__DRKXQ_POPUP_FALLBACK__ = {
                windowId: this._windowId,
                requestedCharacterId: configuredId
            };
            return $gamePlayer;
        }
        return target;
    };

    var originalChoiceStart = Window_ChoiceListEx.prototype.start;

    // MessageWindowPopup asks whether the parent window is *fully* open.  A
    // short prompt can finish and start its choices in the same frame in which
    // Window_MessageEx calls open(); openness is still 0 during that frame, so
    // the original test incorrectly treats the choice as a normal window and
    // places it at (0, 0).  The opening state already has a valid popup target
    // and must be treated as part of the same popup unit.
    Window_ChoiceListEx.prototype.isPopup = function() {
        var messageWindow = this._messageWindow;
        if (!messageWindow || !messageWindow.isPopup || !messageWindow.isPopup()) {
            return false;
        }
        return messageWindow.isOpen() ||
            (messageWindow.isOpening && messageWindow.isOpening()) ||
            messageWindow.openness > 0;
    };

    function report(stage, error, choiceWindow) {
        window.__DZMM_CHOICE_DIAGNOSTICS__ = {
            stage: stage,
            message: error ? String(error.message || error) : '',
            windowId: choiceWindow && choiceWindow._windowId,
            choices: choiceWindow && choiceWindow._gameMessage ?
                choiceWindow._gameMessage.choices().slice() : []
        };
        if (error && window.console && console.warn) {
            console.warn('[DZMM] Recovered extended choice window:', error);
        }
    }

    function recoverChoiceWindow(choiceWindow) {
        var gameMessage = choiceWindow._gameMessage;
        var choices = gameMessage && gameMessage.choices();
        if (!choices || !choices.length) return false;

        var rows = Math.max(1, Math.min(choices.length, 8));
        var invalidWidth = !isFinite(choiceWindow.width) || choiceWindow.width <= 0;
        var invalidHeight = !isFinite(choiceWindow.height) || choiceWindow.height <= 0;

        if (invalidWidth) {
            var wantedWidth = 240;
            try {
                wantedWidth = choiceWindow.maxChoiceWidth() + choiceWindow.padding * 2;
            } catch (e) {
                report('measure-width', e, choiceWindow);
            }
            choiceWindow.width = Math.max(96, Math.min(wantedWidth, Graphics.boxWidth));
        }
        if (invalidHeight) {
            choiceWindow.height = choiceWindow.fittingHeight(rows);
        }

        // Re-evaluate popup placement after the parent begins opening.  The
        // stock plugin only does this once and can permanently retain (0, 0).
        var messageWindow = choiceWindow._messageWindow;
        if (messageWindow && messageWindow.updateTargetCharacterId) {
            messageWindow.updateTargetCharacterId();
        }
        var popupOpening = messageWindow && messageWindow.isPopup &&
            messageWindow.isPopup() &&
            (messageWindow.isOpen() ||
             (messageWindow.isOpening && messageWindow.isOpening()) ||
             messageWindow.openness > 0);
        if (popupOpening && messageWindow.updatePlacementPopup) {
            messageWindow.updatePlacementPopup();
        }

        // Popup linkage may place an extended sub-window outside a small iframe.
        choiceWindow.x = Number(choiceWindow.x);
        choiceWindow.y = Number(choiceWindow.y);
        if (!isFinite(choiceWindow.x)) choiceWindow.x = 0;
        if (!isFinite(choiceWindow.y)) choiceWindow.y = 0;
        choiceWindow.x = Math.max(0, Math.min(choiceWindow.x,
            Math.max(0, Graphics.boxWidth - choiceWindow.width)));
        choiceWindow.y = Math.max(0, Math.min(choiceWindow.y,
            Math.max(0, Graphics.boxHeight - choiceWindow.height)));

        try {
            if (!choiceWindow.contents ||
                    choiceWindow.contents.width !== choiceWindow.contentsWidth() ||
                    choiceWindow.contents.height !== choiceWindow.contentsHeight()) {
                choiceWindow.createContents();
            }
            choiceWindow.refresh();
        } catch (e) {
            // Geometry and input are still recovered even if a custom skin cannot draw.
            report('refresh', e, choiceWindow);
        }

        if (choiceWindow.index() < 0 || choiceWindow.index() >= choices.length) {
            var defaultIndex = Number(gameMessage.choiceDefaultType());
            choiceWindow.select(defaultIndex >= 0 && defaultIndex < choices.length ?
                defaultIndex : 0);
        }
        choiceWindow.visible = true;
        choiceWindow.contentsOpacity = 255;
        choiceWindow.open();
        choiceWindow.activate();
        return true;
    }

    Window_ChoiceListEx.prototype.start = function() {
        try {
            originalChoiceStart.apply(this, arguments);
        } catch (e) {
            report('start', e, this);
        }
        recoverChoiceWindow(this);
        if (this.isPopup() && this.updatePlacementPopup) {
            this.updatePlacementPopup();
        }
    };

    // Do not recover from Window_MessageEx.update(). Game_Message receives the
    // prompt text and its choices at the same time, while Window_Message still
    // needs several frames to draw the text. Activating the choice here makes
    // Window_Message.updateInput() wait on the sub-window and permanently
    // prevents that prompt from being drawn. Recovery is intentionally limited
    // to Window_ChoiceListEx.start(), which is the engine's real input phase.
})();
