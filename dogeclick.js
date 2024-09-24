// ==UserScript==
// @name         dogeclick
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  模拟鼠标点击,只在比例大于0.2时点击
// @author       You
// @match        https://*.babydogeclikerbot.com/*
// @updateURL    https://github.com/rastaclat/tgcustom/blob/main/dogeclick.js
// @downloadURL  https://github.com/rastaclat/tgcustom/blob/main/dogeclick.js
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
        } catch (error) {
            console.error('Click simulation error:', error);
        }
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
        if (specificArea) {
            simulateRealMouseClick(specificArea);
            return true;
        }
        return false;
    }

    function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async function clickUntilZero() {
        let attempts = 0;
        while (attempts < 50) {  // 限制尝试次数
            const values = getValues();
            if (!values || values.current === 0 || values.current / values.total <= 0.2) break;
            if (!clickSpecificArea()) break;
            await new Promise(resolve => setTimeout(resolve, randomDelay(50, 100)));
            attempts++;
        }
        scheduleNextCheck();
    }

    async function checkAndClick() {
        const values = getValues();
        if (values && values.current / values.total > 0.2) {
            await clickUntilZero();
        } else {
            scheduleNextCheck(60000); // 如果比例不大于0.2，1分钟后再次检查
        }
    }

    function scheduleNextCheck(delay = randomDelay(15000, 30000)) {
        if (checkTimeout) clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkAndClick, delay);
    }

    function waitForElement(selector, callback, maxAttempts = 10, interval = 1000) {
        let attempts = 0;
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                callback(element);
            } else if (++attempts < maxAttempts) {
                setTimeout(checkElement, interval);
            }
        };
        checkElement();
    }

    function init() {
        waitForElement('div[data-testid="tap_doge"]', (element) => {
            checkAndClick(); // 初始化时直接检查并点击（如果需要）
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 监听页面变化，在每次加载新内容时检查并点击（如果需要）
    const observer = new MutationObserver(() => {
        waitForElement('div[data-testid="tap_doge"]', () => {
            checkAndClick();
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
