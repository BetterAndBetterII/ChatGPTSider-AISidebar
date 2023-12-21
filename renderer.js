// 默认显示 "general" 内容区域
switchContent('general');

// Open a URL in the default browser
function openUrl(url) {
  console.log('openUrl', url);
  window.electronAPI.openUrl('https://www.' + url);
}

function setWidth() {
  console.log('setWidth')
  const widthInput = document.getElementById('width');
  const setWidthButton = document.getElementById('setWidth');
  const width = widthInput.value;

  setWidthButton.disabled = true; // 禁用按钮
  window.electronAPI.setWindowWidth(parseInt(width));
  // 假设你已经在 preload.js 中暴露了 showDialog 方法
  window.electronAPI.showDialog('设置成功');
}

function setPreventRatio() {
  console.log('setPreventRatio')
  const preventRatioInput = document.getElementById('preventRatio');
  const setPreventRatioButton = document.getElementById('setPreventRatio');
  const preventRatio = preventRatioInput.value;

  setPreventRatioButton.disabled = true; // 禁用按钮
  window.electronAPI.setPreventRatio(preventRatio / 100);
  window.electronAPI.showDialog('设置成功');
}

function setToggleDelay() {
  console.log('setToggleDelay')
  const toggleDelayInput = document.getElementById('toggleDelay');
  const setToggleDelayButton = document.getElementById('setToggleDelay');
  const toggleDelay = toggleDelayInput.value;

  setToggleDelayButton.disabled = true; // 禁用按钮
  window.electronAPI.setToggleDelay(toggleDelay);
  window.electronAPI.showDialog('设置成功');
}

function setPreventLeft() {
  console.log('setPreventLeft')
  const preventLeftInput = document.getElementById('preventLeft');
  const setPreventLeftButton = document.getElementById('setPreventLeft');
  const preventLeft = preventLeftInput.value;

  setPreventLeftButton.disabled = true; // 禁用按钮
  window.electronAPI.setPreventLeft(preventLeft);
  window.electronAPI.showDialog('设置成功');
}

function setActiveRight() {
  console.log('activeRight')
  const activeRightInput = document.getElementById('activeRight');
  const activeRightButton = document.getElementById('setActiveRight');
  const activeRight = activeRightInput.value;

  activeRightButton.disabled = true; // 禁用按钮
  window.electronAPI.activeRight(activeRight);
  window.electronAPI.showDialog('设置成功');
}

function setTogglePeriod() {
  console.log('togglePeriod')
  const togglePeriodInput = document.getElementById('togglePeriod');
  const togglePeriodButton = document.getElementById('setTogglePeriod');
  const togglePeriod = togglePeriodInput.value;

  togglePeriodButton.disabled = true; // 禁用按钮
  window.electronAPI.togglePeriod(togglePeriod);
  window.electronAPI.showDialog('设置成功');
}

function setQuickEnterShortcut() {
  console.log('quickEnterShortcut')
  const quickEnterShortcutInput = document.getElementById('quickEnterShortcut');
  const quickEnterShortcutButton = document.getElementById('setQuickEnterShortcut');
  const quickEnterShortcut = quickEnterShortcutInput.value;

  quickEnterShortcutButton.disabled = true; // 禁用按钮
  window.electronAPI.setQuickEnterShortcut(quickEnterShortcut);
  setTimeout(() => {
    window.electronAPI.getQuickEnterShortcut((quickEnterShortcut) => {
      const quickEnterShortcutInput = document.getElementById('quickEnterShortcut');
      quickEnterShortcutInput.value = quickEnterShortcut;
    }
    );
  }, 100);
}

function setGptSite() {
  console.log('gptSite')
  const gptSiteInput = document.getElementById('gptSite');
  const gptSiteButton = document.getElementById('setGptSite');
  const gptSite = gptSiteInput.value;

  gptSiteButton.disabled = true; // 禁用按钮
  window.electronAPI.gptSite(gptSite);
  window.electronAPI.showDialog('设置成功');
}

function setTextareaId() {
  console.log('textareaId')
  const textareaIdInput = document.getElementById('textareaId');
  const textareaIdButton = document.getElementById('setTextareaId');
  const textareaId = textareaIdInput.value;

  textareaIdButton.disabled = true; // 禁用按钮
  window.electronAPI.setTextareaId(textareaId);
  window.electronAPI.showDialog('设置成功');
}

function setQuickHideAndShow() {
  console.log('quickHideAndShow')
  const quickHideAndShowInput = document.getElementById('quickHideAndShow');
  const quickHideAndShowButton = document.getElementById('setQuickHideAndShow');
  const quickHideAndShow = quickHideAndShowInput.value;

  quickHideAndShowButton.disabled = true; // 禁用按钮
  window.electronAPI.setQuickHideAndShow(quickHideAndShow);
  setTimeout(() => {
    window.electronAPI.getQuickHideAndShow((quickHideAndShow) => {
      const quickHideAndShowInput = document.getElementById('quickHideAndShow');
      quickHideAndShowInput.value = quickHideAndShow;
    }
    );
  }, 100);
}

function setSendText() {
  console.log('sendText')
  const sendTextInput = document.getElementById('sendText');
  const sendTextButton = document.getElementById('setSendText');
  const sendText = sendTextInput.value;

  sendTextButton.disabled = true; // 禁用按钮
  window.electronAPI.setSendText(sendText);
  setTimeout(() => {
    window.electronAPI.getSendText((sendText) => {
      const sendTextInput = document.getElementById('sendText');
      sendTextInput.value = sendText;
    }
    );
  }, 100);
}

function enableButton(e) {  // onchange="enableButton('setWidth')"
  console.log('enableButton', e)
  document.getElementById(e).disabled = false; // 启用按钮
}

function getShortCutKey(event, id) {
  const inputElement = document.getElementById(id);
  // Prevent any default action to ensure a clean read
  event.preventDefault();
  let keys = [];
  if (event.ctrlKey) keys.push('Ctrl');
  if (event.shiftKey) keys.push('Shift');
  if (event.altKey) keys.push('Alt');
  if (event.metaKey) keys.push('Meta');

  if (event.code.includes('Control') || event.code.includes('Shift') || event.code.includes('Alt') || event.code.includes('Meta')) {

  } else {
    keys.push(event.code.includes('Key') ? event.code.split('Key')[1] : event.code);
  }

  inputElement.value = keys.join('+').replace(/Ctrl/i, 'Control').replace(/Alt/i, 'Alt').replace(/Shift/i, 'Shift').replace(/\s/g, '+');
  enableButton('set' + id.replace(/^[a-z]/, firstLetter => firstLetter.toUpperCase()));  //首字母大写
};

function showSuggestions(id) {
  document.getElementById(id + '-shortcuts').style.display = 'block';
}

function hideSuggestions(id) {
  setTimeout(() => {
    document.getElementById(id + '-shortcuts').style.display = 'none';
  }, 100);
}

function selectOption(id, option) {
  console.log('selectOption', id, option);
  document.getElementById(id).value = option;
  document.getElementById(id + '-shortcuts').style.display = 'none';
  enableButton('set' + id.replace(/^[a-z]/, firstLetter => firstLetter.toUpperCase()));  //首字母大写
}

function recover(){
  window.electronAPI.recoverDefault();
}

function clearData(){
  window.electronAPI.clearData();
}


window.electronAPI.getPreventRatio((preventRatio) => {
  const preventRatioInput = document.getElementById('preventRatio');
  preventRatioInput.value = preventRatio * 100;
});

window.electronAPI.getToggleDelay((toggleDelay) => {
  const toggleDelayInput = document.getElementById('toggleDelay');
  toggleDelayInput.value = toggleDelay;
}
);

window.electronAPI.getPreventLeft((preventLeft) => {
  const preventLeftInput = document.getElementById('preventLeft');
  preventLeftInput.value = preventLeft;
}
);

window.electronAPI.getActiveRight((activeRight) => {
  const activeRightInput = document.getElementById('activeRight');
  activeRightInput.value = activeRight;
}
);

window.electronAPI.getTogglePeriod((togglePeriod) => {
  const togglePeriodInput = document.getElementById('togglePeriod');
  togglePeriodInput.value = togglePeriod;
}
);

window.electronAPI.getQuickEnterShortcut((quickEnterShortcut) => {
  const quickEnterShortcutInput = document.getElementById('quickEnterShortcut');
  quickEnterShortcutInput.value = quickEnterShortcut;
}
);

window.electronAPI.getGptSite((gptSite) => {
  const gptSiteInput = document.getElementById('gptSite');
  gptSiteInput.value = gptSite;
}
);

// textareaId
window.electronAPI.getTextareaId((textareaId) => {
  const textareaIdInput = document.getElementById('textareaId');
  textareaIdInput.value = textareaId;
}
);

window.electronAPI.getQuickHideAndShow((quickHideAndShow) => {
  const quickHideAndShowInput = document.getElementById('quickHideAndShow');
  quickHideAndShowInput.value = quickHideAndShow;
}
);

// sendText
window.electronAPI.getSendText((sendText) => {
  const sendTextInput = document.getElementById('sendText');
  sendTextInput.value = sendText;
}
);




function switchContent(sectionId) {
  // 隐藏所有内容区域
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });

  const navItems = document.querySelectorAll('.nav');
  navItems.forEach(item => {
    item.classList.remove('active');
  });

  const activeNavItem = document.getElementById(sectionId + '-nav');
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }

  // 显示选中的内容区域
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.style.display = 'block';
  }
}




// set-prevent-ratio
// set-toggle-delay
// set-prevent-left
// activeRight
// togglePeriod
// quickEnterShortcut
