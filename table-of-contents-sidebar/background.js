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
    chrome.contextMenus.create({
        "title": "Disable on the current domain",
        "contexts": ["page"],
        "onclick": function (info) {
            add2blocklist(info.pageUrl);
        }
    });
}

function displayDisable() {
    if (!chrome.contextMenus) return;
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        "title": "Disable on the current domain",
        "contexts": ["page"],
        "onclick": function (info) {
            add2blocklist(info.pageUrl);
        }
    });
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
        path: "images/icon/ic_enable.png"
    });
}
function disable() {
    chrome.storage.sync.set({'tocs_toggle': false}, function () {
    });
    if (!chrome.browserAction) return;
    chrome.browserAction.setIcon({
        path: "images/icon/ic_disable.png"
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

function getHostname(href) {
    var l = document.createElement("a");
    l.href = href;
    return l.hostname;
}

function add2blocklist(url) {
    var hostname = getHostname(url);
    chrome.storage.sync.get({block_list: []}, function (result) {
        var block_list = result.block_list;
        if (block_list.indexOf(hostname) != -1) return;
        block_list.push(hostname);
        chrome.storage.sync.set({block_list: block_list}, function () {

        });
    });
}
checkToggle();