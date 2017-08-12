function displayEnable() {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: "Enable",
        contexts: ["browser_action"],
        onclick: function () {
            enable();
            displayDisable();
            refresh();
        }
    });
}

function displayDisable() {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: "Disable",
        contexts: ["browser_action"],
        onclick: function () {
            disable();
            displayEnable();
            refresh();
        }
    });
}

function enable() {
    chrome.storage.sync.set({'tocs_toggle': true}, function () {
    });
    chrome.browserAction.setIcon({
        path: "images/icon/icon_blue_128x128.png"
    });
}
function disable() {
    chrome.storage.sync.set({'tocs_toggle': false}, function () {
    });
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

enable();
displayDisable();