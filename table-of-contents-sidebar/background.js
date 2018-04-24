//isMenuCreated: true: have been created
function addMenu(isMenuCreated) {
    if (!chrome.contextMenus) return;
    if (!isMenuCreated) {
        chrome.contextMenus.create({
            id: "menu1",
            title: "menu",
            contexts: ["browser_action"]
        });
        chrome.contextMenus.create({
            id: "menu2",
            title: "menu",
            contexts: ["browser_action"]
        });
    }

    chrome.storage.sync.get({
        scroll_effect: false
    }, function (items) {
        var scrollMsg = items.scroll_effect ? chrome.i18n.getMessage("unscroll") : chrome.i18n.getMessage("scroll");
        chrome.contextMenus.update("menu1", {
            title: scrollMsg,
            onclick: function () {
                chrome.storage.sync.set({
                    'scroll_effect': !items.scroll_effect
                }, function () {
                    addMenu(true);
                    refresh();
                });
            }
        });
    });

    chrome.storage.sync.get({
        show_tooltip: false
    }, function (items) {
        var tooltipMsg = items.show_tooltip ? chrome.i18n.getMessage("untooltip") : chrome.i18n.getMessage("tooltip");
        chrome.contextMenus.update("menu2", {
            title: tooltipMsg,
            onclick: function () {
                chrome.storage.sync.set({
                    'show_tooltip': !items.show_tooltip
                }, function () {
                    addMenu(true);
                    refresh();
                });
            }
        });
    });
}

function displayEnable() {
    if (!chrome.contextMenus) return;
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("enable"),
        contexts: ["browser_action"],
        onclick: function () {
            displayDisable();
            enable();
            refresh();
        }
    });
    addMenu(false);
}

function displayDisable() {
    if (!chrome.contextMenus) return;
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("disable"),
        contexts: ["browser_action"],
        onclick: function () {
            displayEnable();
            disable();
            refresh();
        }
    });
    addMenu(false);
}

function enable() {
    chrome.storage.sync.set({
        'tocs_toggle': true
    }, function () {});
    if (!chrome.browserAction) return;
    chrome.browserAction.setIcon({
        path: "images/ic_enable.png"
    });
}

function disable() {
    chrome.storage.sync.set({
        'tocs_toggle': false
    }, function () {});
    if (!chrome.browserAction) return;
    chrome.browserAction.setIcon({
        path: "images/ic_disable.png"
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
//实际的作用是生成右键菜单
checkToggle();

function toggleToc() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
                type: "toggleToc"
            },
            function (response) {;
            });
    });
}

chrome.browserAction.onClicked.addListener(tab => toggleToc())
