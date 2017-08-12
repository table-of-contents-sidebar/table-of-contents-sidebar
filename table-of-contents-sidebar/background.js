function displayEnable() {
    if (!chrome.contextMenus) return;
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: "Enable",
        contexts: ["browser_action"],
        onclick: function () {
            displayDisable();
            enable();
            refresh();
        }
    });
}

function displayDisable() {
    if (!chrome.contextMenus) return;
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: "Disable",
        contexts: ["browser_action"],
        onclick: function () {
            displayEnable();
            disable();
            refresh();
        }
    });
}

function enable() {
    chrome.storage.sync.set({'tocs_toggle': true}, function () {
    });
    if (!chrome.browserAction) return;
    chrome.browserAction.setIcon({
        path: "images/icon/icon_blue_128x128.png"
    });
}
function disable() {
    chrome.storage.sync.set({'tocs_toggle': false}, function () {
    });
    if (!chrome.browserAction) return;
    chrome.browserAction.setIcon({
        path: "images/icon/icon_gray_128x128.png"
    });
}

function refresh() {
    chrome.tabs.getSelected(null, function (tab) {
        tabId = tab.id;
        chrome.tabs.reload(tabId);
    });
}

function checkToggle() {
    chrome.storage.sync.get({
        tocs_toggle: true
    }, function (items) {
        var toggle = items.tocs_toggle;
        if (toggle) {
            displayDisable();
            enable();
        } else {
            displayEnable();
            disable();
        }
    });
}
checkToggle();