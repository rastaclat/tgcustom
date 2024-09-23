// ==UserScript==
// @name         Advanced Continuous Clicker for Baby Doge
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  模拟鼠标点击
// @author       You
// @match        https://*.babydogeclikerbot.com/*
// @updateURL    https://github.com/rastaclat/tgcustom/edit/main/dog2click.js
// @downloadURL  https://github.com/rastaclat/tgcustom/edit/main/dog2click.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 模拟iOS设备
    const newUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
    Object.defineProperty(navigator, 'userAgent', {
        get: function() { return newUserAgent; }
    });

    let checkTimeout = null;

    function simulateRealMouseClick(element) {
        try {
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const events = ['mousedown', 'mouseup', 'click'];
            events.forEach(eventType => {
                const event = new MouseEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: 0,
                    buttons: eventType === 'mousedown' ? 1 : 0,
                    clientX: x,
                    clientY: y
                });
                element.dispatchEvent(event);
            });
        } catch (error) {
            console.error('模拟点击时出错:', error);
        }
    }

    function getValues() {
        try {
            const valueElement = document.querySelector('.text-babydoge-white.text-12-bold p');
            if (valueElement) {
                const values = valueElement.textContent.split('/');
                return {
                    current: parseInt(values[0], 10),
                    total: parseInt(values[1], 10)
                };
            }
        } catch (error) {
            console.error('获取值时出错:', error);
        }
        return null;
    }

    function clickSpecificArea() {
        try {
            const specificArea = document.querySelector('div[data-testid="tap_doge"]');
            if (specificArea) {
                simulateRealMouseClick(specificArea);
            }
        } catch (error) {
            console.error('点击特定区域时出错:', error);
        }
    }

    function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async function clickUntilZero() {
        try {
            while (true) {
                const values = getValues();
                if (!values || values.current === 0) {
                    break;
                }
                clickSpecificArea();
                await new Promise(resolve => setTimeout(resolve, randomDelay(50, 200)));
            }
        } catch (error) {
            console.error('点击过程中出错:', error);
        }
        scheduleNextCheck();
    }

    async function checkAndClick() {
        try {
            const values = getValues();
            if (values) {
                const ratio = values.current / values.total;
                if (ratio > 0.2) {
                    await clickUntilZero();
                    return;
                }
            }
        } catch (error) {
            console.error('检查和点击过程中出错:', error);
        }
        scheduleNextCheck();
    }

    function scheduleNextCheck() {
        if (checkTimeout) {
            clearTimeout(checkTimeout);
        }
        const nextCheckDelay = randomDelay(15000, 30000);
        checkTimeout = setTimeout(checkAndClick, nextCheckDelay);
    }

    const observer = new MutationObserver(function(mutations) {
        // 观察DOM变化，但不执行操作
    });

    const config = {
        childList: true,
        subtree: true
    };

    window.addEventListener('load', () => {
        try {
            observer.observe(document.body, config);
            scheduleNextCheck();
        } catch (error) {
            console.error('初始化过程中出错:', error);
        }
    });
})();
