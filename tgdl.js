// ==UserScript==
// @name         tgdl
// @version      1.1
// @description  tgdl
// @author       qtq
// @match        https://web.telegram.org/*/*
// @match        https://*.tomarket.ai/*
// @match        https://babydogeclikerbot.com/*
// @match        https://*.babydogepawsbot.com/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/rastaclat/tgcustom/refs/heads/main/tgdl.js
// @updateURL    https://raw.githubusercontent.com/rastaclat/tgcustom/refs/heads/main/tgdl.js
// @icon         https://web.telegram.org/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    function updateIframeSrc() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            let originalSrc = iframe.src;
            let newSrc = originalSrc
                .replace(/tgWebAppPlatform=(weba|web)/g, 'tgWebAppPlatform=ios')
                .replace(/^http:/, 'https:');

            if (newSrc !== originalSrc) {
                iframe.src = newSrc;
                console.log('iframe src 已更新:', newSrc);
            }

            // 修改sandbox属性以允许脚本执行
            if (iframe.hasAttribute('sandbox')) {
                let sandboxValue = iframe.getAttribute('sandbox');
                if (!sandboxValue.includes('allow-scripts')) {
                    iframe.setAttribute('sandbox', sandboxValue + ' allow-scripts');
                }
            }
        });
    }

    function checkAndReload() {
        const contentToCheck = [
            'Play on your mobile',
            '在您的移动设备上玩',
            'Spielen Sie auf Ihrem Mobilgerät',
            'Jouez sur votre mobile'
        ];

        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            // 使用postMessage来与iframe通信
            iframe.contentWindow.postMessage({type: 'checkContent', phrases: contentToCheck}, '*');
        });
    }

    function safeExecute() {
        updateIframeSrc();
        checkAndReload();
    }

    function init() {
        safeExecute();
        setInterval(safeExecute, 5000);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    safeExecute();
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 捕获并忽略特定错误
    window.addEventListener('error', function(event) {
        if (event.message.includes('Syntax error, unrecognized expression: #tgWebAppData')) {
            event.preventDefault();
            console.warn('忽略了一个已知的语法错误');
        }
    }, true);

    // 监听来自iframe的消息
    window.addEventListener('message', function(event) {
        if (event.data.type === 'contentFound') {
            console.log('检测到目标内容，正在尝试重新加载...');
            setTimeout(() => {
                event.source.location.reload();
            }, 2000);
        }
    }, false);

    // 注入iframe内容检查脚本
    const script = document.createElement('script');
    script.textContent = `
        window.addEventListener('message', function(event) {
            if (event.data.type === 'checkContent') {
                const bodyText = document.body.textContent || document.body.innerText;
                if (event.data.phrases.some(phrase => bodyText.includes(phrase))) {
                    window.parent.postMessage({type: 'contentFound'}, '*');
                }
            }
        }, false);
    `;
    document.head.appendChild(script);

    // 移除了可能引起问题的CSP修改代码
})();
