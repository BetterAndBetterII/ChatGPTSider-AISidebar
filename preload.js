const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    setWindowWidth: (width) => ipcRenderer.send('set-window-width', width),
    setAlwaysOnTop: (isAlwaysOnTop) => ipcRenderer.send('set-always-on-top', isAlwaysOnTop),
    showDialog: (message) => ipcRenderer.send('show-dialog', message),
    getClipboardText: (callback) => {
        ipcRenderer.once('clipboard-text', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-clipboard-text');
    },
    // set-prevent-ratio
    setPreventRatio: (isPreventRatio) => ipcRenderer.send('set-prevent-ratio', isPreventRatio),
    // set-toggle-delay
    setToggleDelay: (toggleDelay) => ipcRenderer.send('set-toggle-delay', toggleDelay),
    // set-prevent-left
    setPreventLeft: (preventLeft) => ipcRenderer.send('set-prevent-left', preventLeft),
    // activeRight
    setActiveRight: (activeRight) => ipcRenderer.send('set-active-right', activeRight),
    // togglePeriod
    setTogglePeriod: (togglePeriod) => ipcRenderer.send('set-toggle-period', togglePeriod),
    getPreventRatio: (callback) => {
        ipcRenderer.once('prevent-ratio', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-prevent-ratio');
    },
    getToggleDelay: (callback) => {
        ipcRenderer.once('toggle-delay', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-toggle-delay');
    },
    getPreventLeft: (callback) => {
        ipcRenderer.once('prevent-left', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-prevent-left');
    },
    getActiveRight: (callback) => {
        ipcRenderer.once('active-right', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-active-right');
    },
    getTogglePeriod: (callback) => {
        ipcRenderer.once('toggle-period', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-toggle-period');
    },
    // quickEnterShortcut
    getQuickEnterShortcut: (callback) => {
        ipcRenderer.once('quick-enter-shortcut', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-quick-enter-shortcut');
    },
    // gptSite
    getGptSite: (callback) => {
        ipcRenderer.once('gpt-site', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-gpt-site');
    },
    // set-quick-enter-shortcut
    setQuickEnterShortcut: (quickEnterShortcut) => ipcRenderer.send('set-quick-enter-shortcut', quickEnterShortcut),
    // set-gpt-site
    setGptSite: (gptSite) => ipcRenderer.send('set-gpt-site', gptSite),
    // set-textarea-id
    setTextareaId: (textareaId) => ipcRenderer.send('set-textarea-id', textareaId),
    // get-textarea-id
    getTextareaId: (callback) => {
        ipcRenderer.once('textarea-id', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-textarea-id');
    },
    openUrl: (url) => ipcRenderer.send('open-url', url),
    // quickHideAndShow
    setQuickHideAndShow: (isQuickHideAndShow) => ipcRenderer.send('set-quick-hide-and-show', isQuickHideAndShow),
    getQuickHideAndShow: (callback) => {
        ipcRenderer.once('quick-hide-and-show', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-quick-hide-and-show');
    },
    // set-send-text
    setSendText: (sendText) => ipcRenderer.send('set-send-text', sendText),
    // get-send-text
    getSendText: (callback) => {
        ipcRenderer.once('send-text', (event, text) => {
            callback(text);
        });
        ipcRenderer.send('get-send-text');
    },
    recoverDefault: () => ipcRenderer.send('recover-default'),
    clearData: () => ipcRenderer.send('clear-data'),
});