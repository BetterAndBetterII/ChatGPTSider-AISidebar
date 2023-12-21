const { app, BrowserWindow, Tray, Menu, screen, ipcMain, globalShortcut, clipboard , session } = require('electron/main');
const { dialog, shell } = require('electron');
const robot = require('robotjs');
const fs = require('fs');
const path = require('node:path'); // 确保导入了 path 模块
const { send } = require('process');

// 获取存储配置的路径
const configPath = path.join(app.getPath('userData'), 'config.json');

// 保存配置
function saveConfig(json) {
    try {
        const configData = loadConfig();
        for (const [key, value] of Object.entries(json)) {
            configData[key] = value;
        }
        console.log(configData);
        fs.writeFileSync(configPath, JSON.stringify(configData), 'utf8');
    } catch (error) {
        console.error('Error writing config file:', error);
    }
}

// 读取配置
function loadConfig() {
    // console.log(configPath)
    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        }
    } catch (error) {
        console.error('Error reading config file:', error);
    }
    return defaultConfig; // 如果无法读取配置文件，则返回默认配置
}

const defaultConfig = {
    sidebarWidth: 600,
    preventRatio: 0.1,
    toggleDelay: 200,
    isSidebarEnabled: true,
    preventLeft: 50,
    activeRight: 30,
    togglePeriod: 0, // 切换时间（毫秒）
    quickEnterShortcut: 'Control+Space',
    quickHideAndShow: 'Alt+Space',
    sendTextShortcut: 'Control+Enter',
    quickEnterShortcutEnabled: true,
    gptSite: 'https://chat.openai.com',
    textareaId: 'prompt-textarea'
};

let tray = null;
let mainWindow;
let settingsWindow = null; // 设置窗口，初始为 null
let showSidebar = true;
const hiddenWidth = 0;
var canToggle = true; // 控制是否可以切换窗口状态
var tempOpen = false;
var tempClose = false;
var toggling = false; // 控制是否正在切换窗口状态

var sidebarWidth;
var preventRatio;
var toggleDelay;
var isSidebarEnabled;
var preventLeft;
var activeRight;
var togglePeriod;
var quickEnterShortcut;
var quickEnterShortcutEnabled;
var gptSite;
var textareaId;
var quickHideAndShow;
var sendTextShortcut;
var taskbarHeight;

// var sidebarWidth = 600;
// var preventRatio = 0.1; // 防误触比
// const toggleDelay = 200; // 缓冲时间（毫秒）
// let isSidebarEnabled = true;
// let preventLeft = 50;
// let activeRight = 30;
// let togglePeriod = 20; // 切换时间（毫秒）

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, 'gpt.ico'),
        width: sidebarWidth,
        height,
        x: width - sidebarWidth,
        y: 0,
        frame: false,
        resizable: false,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: true,
            ignoreCertificateErrors: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        alwaysOnTop: true,
        skipTaskbar: true
    });

    mainWindow.loadURL(gptSite); // 加载你的网页
    // mainWindow.webContents.openDevTools();

    setInterval(checkMousePosition, 100); // 每 100 毫秒检查一次鼠标位置
}

function checkMousePosition() {

    if (tempOpen) {   // 如果是临时展开的，不进行判断
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const cursorPos = screen.getCursorScreenPoint();

        // 判断鼠标是否在主屏幕的垂直范围内
        const isCursorInVerticalRange = cursorPos.y >= 0 && cursorPos.y <= height + taskbarHeight;
        if (showSidebar && cursorPos.x > width - sidebarWidth && isCursorInVerticalRange) {
            // 鼠标靠近屏幕边缘并且在垂直范围内，展开窗口
            tempOpen = false;
            canToggle = true;
        }
        else if (!showSidebar) {
            tempOpen = false;
            canToggle = true;
        }
        return;
    }

    if(tempClose) {   // 如果是临时收起的，不进行判断
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const cursorPos = screen.getCursorScreenPoint();

        // 判断鼠标是否在主屏幕的垂直范围内
        if(!showSidebar && (cursorPos.x < width - sidebarWidth || cursorPos.y < 0 || cursorPos.y > height + taskbarHeight)) {
            tempClose = false;
            canToggle = true;
        }
        else if (showSidebar) {
            tempClose = false;
            canToggle = true;
        }
        return;
    }


    if (!canToggle || toggling || !isSidebarEnabled) return;
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const cursorPos = screen.getCursorScreenPoint();

    // console.log(cursorPos.x, cursorPos.y);

    // 防误触
    const isCursorInPreventArea = cursorPos.y >= preventRatio * height && cursorPos.y <= height * (1 - preventRatio);
    // 判断鼠标是否在主屏幕的垂直范围内
    const isCursorInVerticalRange = cursorPos.y >= 0 && height + taskbarHeight;

    // 控制窗口的展开和收起
    if (showSidebar && (cursorPos.x < width - sidebarWidth - preventLeft || !isCursorInVerticalRange)) {
        // 鼠标离开窗口范围或不在垂直范围内，收起窗口
        showSidebar = false;
        smoothToggleWindow(hiddenWidth, togglePeriod);
    } else if (!showSidebar && cursorPos.x >= width - activeRight && isCursorInPreventArea) {
        // 鼠标靠近屏幕边缘并且在垂直范围内，展开窗口
        showSidebar = true;
        smoothToggleWindow(sidebarWidth, togglePeriod);
    }
}


function smoothToggleWindow(targetWidth, duration) {
    if (toggling) return;
    if (duration === 0) {
        mainWindow.setBounds({
            width: Math.round(targetWidth),
            x: Math.round(screen.getPrimaryDisplay().workAreaSize.width - targetWidth)
        });
        return;
    }
    toggling = true;

    let currentWidth = mainWindow.getBounds().width;
    let step = (targetWidth - currentWidth) / (duration / 10); // 每 10 毫秒调整一次大小

    let interval = setInterval(() => {
        if (!mainWindow || mainWindow.isDestroyed()) {
            clearInterval(interval);
            return;
        }

        currentWidth += step;
        mainWindow.setBounds({
            width: Math.round(currentWidth),
            x: Math.round(screen.getPrimaryDisplay().workAreaSize.width - currentWidth)
        });

        if ((step < 0 && currentWidth <= targetWidth) || (step > 0 && currentWidth >= targetWidth)) {
            clearInterval(interval);
            if (!mainWindow || mainWindow.isDestroyed()) {
                return;
            }
            mainWindow.setBounds({
                width: Math.round(targetWidth),
                x: Math.round(screen.getPrimaryDisplay().workAreaSize.width - targetWidth)
            });
            setTimeout(() => {
                canToggle = true;
                toggling = false;
            }, toggleDelay);
        }
    }, 10);
}


function createTray() {
    tray = new Tray(path.join(__dirname, 'gpt.ico')); // 替换为您的图标路径

    const contextMenu = Menu.buildFromTemplate([
        { label: '刷新网页', click: () => { mainWindow.reload(); } },
        {
            label: '开启/关闭收缩功能', type: 'checkbox', checked: true, click: (menuItem) => {
                isSidebarEnabled = menuItem.checked;
                if (!menuItem.checked) {
                    const { width } = screen.getPrimaryDisplay().workAreaSize;
                    mainWindow.setBounds({ width: sidebarWidth, x: width - sidebarWidth });
                    canToggle = false;
                    showSidebar = true;
                }
                else {
                    canToggle = true;
                    const { width } = screen.getPrimaryDisplay().workAreaSize;
                    mainWindow.setBounds({ width: sidebarWidth, x: width - sidebarWidth });
                    showSidebar = true;
                }
            }
        },
        {
            label: '置顶', type: 'checkbox', checked: true, click: (menuItem) => {
                mainWindow.setAlwaysOnTop(menuItem.checked);
            }
        },
        {
            label: '快速输入', type: 'checkbox', checked: quickEnterShortcutEnabled, click: (menuItem) => {
                quickEnterShortcutEnabled = menuItem.checked;
                if (quickEnterShortcutEnabled) {
                    console.log("Regist Shortcut", quickEnterShortcut);
                    globalShortcut.register(quickEnterShortcut, () => {
                        appendClipboard(); // 执行注入 JavaScript
                    });
                }
                else {
                    globalShortcut.unregisterAll();
                }
                saveConfig({ 'quickEnterShortcutEnabled': quickEnterShortcutEnabled });
            }
        },
        {
            label: '调整设置', click: () => {
                createSettingsWindow();
            }
        },
        { type: 'separator' },
        { label: '退出', click: () => { app.quit(); } }
    ]);

    tray.setToolTip('GPT-Sider');
    tray.setContextMenu(contextMenu);
}

function createSettingsWindow() {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        icon: path.join(__dirname, 'gpt.ico'),
        width: 600,
        height: 400,
        resizable: false,

        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    settingsWindow.setMenu(null); // 这将删除菜单栏

    settingsWindow.loadFile(path.join(__dirname, 'settings.html')); // 指定设置页面的 HTML
    settingsWindow.webContents.openDevTools();
    // 当窗口关闭时，清理 settingsWindow 变量
    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

// quickHideAndShowToggle
function quickHideAndShowToggle() {
    if (toggling) return;
    if (showSidebar) {
        tempClose = true;
        canToggle = false;
        showSidebar = false;
        smoothToggleWindow(hiddenWidth, 0);
    }
    else {
        tempOpen = true;
        canToggle = false;
        showSidebar = true;
        smoothToggleWindow(sidebarWidth, 0);
        mainWindow.focus();
        mainWindow.webContents.executeJavaScript(`
        const textarea = document.getElementById('prompt-textarea');
        if (textarea) {
            textarea.focus();
        }
        `).then(result => {
            console.log('Script Executed.(focus)');
        }).catch(err => {
            console.error('Script execution failed', err);
        });
    }
}

function sentTextToggle() {
    if (mainWindow.isFocused()) {
        mainWindow.webContents.executeJavaScript(`document.querySelector('button[data-testid="send-button"]').click()`).then(result => {
            console.log('Script Executed.(sent text)');
        }).catch(err => {
            console.error('Script execution failed', err);
        });
    }
}

ipcMain.on('set-window-width', (event, width) => {
    if (mainWindow) {
        console.log("Set width", width)
        sidebarWidth = width;
        saveConfig({ 'sidebarWidth': sidebarWidth });
    }
});

ipcMain.on('set-prevent-ratio', (event, ratio) => {
    console.log("Set ratio", ratio)
    preventRatio = ratio;
    saveConfig({ 'preventRatio': preventRatio });
});

ipcMain.on('set-toggle-delay', (event, delay) => {
    console.log("Set delay", delay)
    toggleDelay = delay;
    saveConfig({ 'toggleDelay': toggleDelay });
});

// preventLeft
ipcMain.on('set-prevent-left', (event, left) => {
    console.log("Set left", left)
    preventLeft = left;
    saveConfig({ 'preventLeft': preventLeft });
});

// activeRight
ipcMain.on('set-active-right', (event, right) => {
    console.log("Set right", right)
    activeRight = right;
    saveConfig({ 'activeRight': activeRight });
});

// togglePeriod
ipcMain.on('set-toggle-period', (event, period) => {
    console.log("Set period", period)
    togglePeriod = period;
    saveConfig({ 'togglePeriod': togglePeriod });
});

ipcMain.on('get-prevent-ratio', (event) => {
    console.log("Get ratio", preventRatio)
    event.reply('prevent-ratio', preventRatio);
});

ipcMain.on('get-toggle-delay', (event) => {
    console.log("Get delay", toggleDelay)
    event.reply('toggle-delay', toggleDelay);
});

// preventLeft
ipcMain.on('get-prevent-left', (event) => {
    console.log("Get left", preventLeft)
    event.reply('prevent-left', preventLeft);
});

// activeRight
ipcMain.on('get-active-right', (event) => {
    console.log("Get right", activeRight)
    event.reply('active-right', activeRight);
});

// togglePeriod
ipcMain.on('get-toggle-period', (event) => {
    console.log("Get period", togglePeriod)
    event.reply('toggle-period', togglePeriod);
});

ipcMain.on('get-quick-enter-shortcut', (event) => {
    console.log("Get shortcut", quickEnterShortcut)
    event.reply('quick-enter-shortcut', quickEnterShortcut);
});

// open-url
ipcMain.on('open-url', (event, url) => {
    console.log("Open url", url)
    shell.openExternal(url);
});

ipcMain.on('set-quick-enter-shortcut', (event, shortcut) => {
    console.log("Set shortcut(quickEnter)", shortcut)

    globalShortcut.unregister(quickEnterShortcut)
    if (quickEnterShortcutEnabled) {
        globalShortcut.register(shortcut, () => {
            appendClipboard(); // 执行注入 JavaScript
        });
        // 是否注册成功
        const isRegistered = globalShortcut.isRegistered(shortcut);
        console.log(isRegistered);
        if (isRegistered) {
            console.log("Regist Shortcut", shortcut);
            dialog.showMessageBox({
                type: 'info', // 设置消息框的样式
                message: '快捷键设置成功！',
                icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
                noLink: true, // 禁止链接
                normalizeAccessKeys: true, // 正常化访问键
                buttons: ['OK']
            });
            quickEnterShortcut = shortcut;
            saveConfig({ 'quickEnterShortcut': quickEnterShortcut });
        }
        else {
            console.log("Set shortcut failed", shortcut)
            globalShortcut.register(quickEnterShortcut, () => {
                appendClipboard(); // 执行注入 JavaScript
            }
            );
            dialog.showMessageBox({
                type: 'error', // 设置消息框的样式
                message: '快捷键设置失败！',
                icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
                noLink: true, // 禁止链接
                normalizeAccessKeys: true, // 正常化访问键
                buttons: ['OK']
            });
        }
    }

});

// set-quick-hide-and-show
ipcMain.on('set-quick-hide-and-show', (event, shortcut) => {
    console.log(`Set shortcut(quickHideAndShow)`, shortcut)

    globalShortcut.unregister(quickHideAndShow)
    globalShortcut.register(shortcut, () => {
        quickHideAndShowToggle(); // 执行注入 JavaScript
    });
    // 是否注册成功
    const isRegistered = globalShortcut.isRegistered(shortcut);
    console.log(isRegistered);
    if (isRegistered) {
        console.log("Regist Shortcut(quickHideAndShow)", shortcut);
        dialog.showMessageBox({
            type: 'info', // 设置消息框的样式
            message: '快捷键设置成功！',
            icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
            noLink: true, // 禁止链接
            normalizeAccessKeys: true, // 正常化访问键
            buttons: ['OK']
        });
        quickHideAndShow = shortcut;
        saveConfig({ 'quickHideAndShow': quickHideAndShow });
    }
    else {
        console.log("Set shortcut failed", shortcut)
        globalShortcut.register(quickHideAndShow, () => {
            quickHideAndShowToggle(); // 执行注入 JavaScript
        }
        );
        dialog.showMessageBox({
            type: 'error', // 设置消息框的样式
            message: '快捷键设置失败！',
            icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
            noLink: true, // 禁止链接
            normalizeAccessKeys: true, // 正常化访问键
            buttons: ['OK']
        });
    }

});

// set-send-text
ipcMain.on('set-send-text', (event, shortcut) => {
    console.log(`Set shortcut(sendText)`, shortcut)

    globalShortcut.unregister(sendTextShortcut)
    globalShortcut.register(shortcut, () => {
        sentTextToggle(); // 执行注入 JavaScript
    });
    // 是否注册成功
    const isRegistered = globalShortcut.isRegistered(shortcut);
    console.log(isRegistered);
    if (isRegistered) {
        console.log("Regist Shortcut(sendText)", shortcut);
        dialog.showMessageBox({
            type: 'info', // 设置消息框的样式
            message: '快捷键设置成功！',
            icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
            noLink: true, // 禁止链接
            normalizeAccessKeys: true, // 正常化访问键
            buttons: ['OK']
        });
        sendTextShortcut = shortcut;
        saveConfig({ 'sendTextShortcut': sendTextShortcut });
    }
    else {
        console.log("Set shortcut failed", shortcut)
        globalShortcut.register(sendTextShortcut, () => {
            sentTextToggle(); // 执行注入 JavaScript
        }
        );
        dialog.showMessageBox({
            type: 'error', // 设置消息框的样式
            message: '快捷键设置失败！',
            icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
            noLink: true, // 禁止链接
            normalizeAccessKeys: true, // 正常化访问键
            buttons: ['OK']
        });
    }

});

ipcMain.on('get-gpt-site', (event) => {
    console.log("Get site", gptSite)
    event.reply('gpt-site', gptSite);
});

ipcMain.on('set-gpt-site', (event, site) => {
    console.log("Set site", site)
    gptSite = site;
    saveConfig({ 'gptSite': gptSite });
});

ipcMain.on('set-textarea-id', (event, id) => {
    console.log("Set id", id)
    textareaId = id;
    saveConfig({ 'textareaId': textareaId });
});

ipcMain.on('get-textarea-id', (event) => {
    console.log("Get id", textareaId)
    event.reply('textarea-id', textareaId);
});

ipcMain.on('get-quick-hide-and-show', (event) => {
    console.log("Get quickHideAndShow", quickHideAndShow)
    event.reply('quick-hide-and-show', quickHideAndShow);
});

ipcMain.on('show-dialog', (event, text) => {
    dialog.showMessageBox({
        type: 'info', // 设置消息框的样式
        message: text,
        icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
        noLink: true, // 禁止链接
        normalizeAccessKeys: true, // 正常化访问键
        buttons: ['OK']
    });
});

ipcMain.on('recover-default', (event) => {
    dialog.showMessageBox({
        type: 'question',
        message: '确定要恢复默认设置吗？',
        icon: path.join(__dirname, 'gpt.png'),
        buttons: ['取消', '确定']
    }).then(result => {
        if(result.response === 1) {
            saveConfig(defaultConfig);
            dialog.showMessageBox({
                type: 'info', // 设置消息框的样式
                message: '恢复成功！',
                icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
                noLink: true, // 禁止链接
                normalizeAccessKeys: true, // 正常化访问键
                buttons: ['OK']
            });
            mainWindow.reload();
        }
    }
    );
});

// clear-data
ipcMain.on('clear-data', (event) => {
    dialog.showMessageBox({
        type: 'question',
        message: '确定要清除所有数据吗？',
        icon: path.join(__dirname, 'gpt.png'),
        buttons: ['取消', '确定']
    }).then(result => {
        if(result.response === 1) {
            session.defaultSession.clearStorageData({
                storages: ['cookies', 'localStorage', 'sessionStorage', 'indexedDB', 'webSQL']
              }, function(error) {
                if (error) console.error(error);
              });
            dialog.showMessageBox({
                type: 'info', // 设置消息框的样式
                message: '清除成功！',
                icon: path.join(__dirname, 'gpt.png'), // 设置消息框的图标
                noLink: true, // 禁止链接
                normalizeAccessKeys: true, // 正常化访问键
                buttons: ['OK']
            });
            mainWindow.reload();
        }
    }
    );
});

app.whenReady().then(() => {
    if (process.platform === 'darwin') {
        app.dock.hide(); // macOS 上隐藏 Dock 图标
    }
    createWindow();
    createTray();
})

// 请记得在应用退出前注销快捷键
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('ready', () => {
    // saveConfig(defaultConfig);
    const config = loadConfig();

    // 从配置中加载设置
    // 使用配置
    sidebarWidth = config.sidebarWidth;
    preventRatio = config.preventRatio;
    toggleDelay = config.toggleDelay;
    isSidebarEnabled = config.isSidebarEnabled;
    preventLeft = config.preventLeft;
    activeRight = config.activeRight;
    togglePeriod = config.togglePeriod;
    quickEnterShortcut = config.quickEnterShortcut;
    quickEnterShortcutEnabled = config.quickEnterShortcutEnabled;
    gptSite = config.gptSite;
    textareaId = config.textareaId;
    quickHideAndShow = config.quickHideAndShow;
    sendTextShortcut = config.sendTextShortcut;

    let display = screen.getPrimaryDisplay();
    let fullScreenHeight = display.bounds.height;
    let workAreaHeight = display.workAreaSize.height;

    taskbarHeight = fullScreenHeight - workAreaHeight;
    console.log(taskbarHeight);

    let success = globalShortcut.register(quickEnterShortcut, () => {
        appendClipboard(); // 执行注入 JavaScript
    });
    if(!success) {
        console.log("Regist Shortcut failed", quickEnterShortcut);
    }
    success = globalShortcut.register(quickHideAndShow, () => {
        quickHideAndShowToggle(); // 执行注入 JavaScript
    });
    if(!success) {
        console.log("Regist Shortcut failed", quickHideAndShow);
    }
    success = globalShortcut.register(sendTextShortcut, () => {
        sentTextToggle();  // 执行注入 JavaScript
    });

});

ipcMain.on('get-clipboard-text', (event) => {
    const clipboardText = clipboard.readText();
    event.reply('clipboard-text', clipboardText);
});

// 在 createWindow 或类似的初始化函数中调用
function appendClipboard() {
    const clipboardText = clipboard.readText();
    robot.keyTap('c', 'control');
    setTimeout(() => {
        const copied = clipboardText !== clipboard.readText();  // 判断是否复制成功


        mainWindow.focus();
        mainWindow.webContents.executeJavaScript(`
        window.electronAPI.getClipboardText((clipboardText) => {
        const textarea = document.getElementById('prompt-textarea');
        if (textarea) {
            ${copied ? 'textarea.value += clipboardText + "\\n";' : ''}
            textarea.focus();
        }
        });
        `).then(result => {
            const { width } = screen.getPrimaryDisplay().workAreaSize;
            mainWindow.setBounds({ width: sidebarWidth, x: width - sidebarWidth });
            tempToggle = true;
            canToggle = false;
            showSidebar = true;
            console.log('Script Executed.');
        }).catch(err => {
            console.error('Script execution failed', err);
        });
    }, 100);

}

