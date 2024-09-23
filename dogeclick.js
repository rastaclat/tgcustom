// ==UserScript==
// @name         dogeclick
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  模拟鼠标点击
// @author       You
// @match        https://*.babydogeclikerbot.com/*
// @updateURL    https://raw.githubusercontent.com/rastaclat/tgcustom/refs/heads/main/dogeclick.js
// @downloadURL  https://raw.githubusercontent.com/rastaclat/tgcustom/refs/heads/main/dogeclick.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const newUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
    Object.defineProperty(navigator, 'userAgent', { get: function() { return newUserAgent; } });

    let checkTimeout = null;

    function simulateRealMouseClick(element) {
        if (!element) return;
        try {
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                const event = new MouseEvent(eventType, {
                    bubbles: true, cancelable: true, view: window,
                    button: 0, buttons: eventType === 'mousedown' ? 1 : 0,
                    clientX: x, clientY: y
                });
                element.dispatchEvent(event);
            });
        } catch (error) {}
    }

    function getValues() {
        const valueElement = document.querySelector('.text-babydoge-white.text-12-bold p');
        if (valueElement) {
            const values = valueElement.textContent.split('/');
            return {
                current: parseInt(values[0], 10),
                total: parseInt(values[1], 10)
            };
        }
        return null;
    }

    function clickSpecificArea() {
        const specificArea = document.querySelector('div[data-testid="tap_doge"]');
        if (specificArea) simulateRealMouseClick(specificArea);
    }

    function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async function clickUntilZero() {
        while (true) {
            const values = getValues();
            if (!values || values.current === 0) break;
            clickSpecificArea();
            await new Promise(resolve => setTimeout(resolve, randomDelay(50, 100)));
        }
        scheduleNextCheck();
    }

    async function checkAndClick() {
        const values = getValues();
        if (values && values.current / values.total > 0.2) {
            await clickUntilZero();
        } else {
            scheduleNextCheck();
        }
    }

    function scheduleNextCheck() {
        if (checkTimeout) clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkAndClick, randomDelay(15000, 30000));
    }

    const observer = new MutationObserver(() => {});
    const config = { childList: true, subtree: true };

    function init() {
        observer.observe(document.body, config);
        setTimeout(scheduleNextCheck, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
