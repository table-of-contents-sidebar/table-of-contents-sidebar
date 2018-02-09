chrome.storage.sync.get({
    tocs_toggle: true
}, function (items) {
    var toggle = items.tocs_toggle;
    if (!toggle) return;
    TableOfContents.init({
        basePath: chrome.extension.getURL("") + "table-of-contents-sidebar-lib/",
        rightTooltip: chrome.i18n.getMessage("right"),
        leftTooltip: chrome.i18n.getMessage("left"),
        unpinTooltip: chrome.i18n.getMessage("unpin"),
        pinTooltip: chrome.i18n.getMessage("pin"),
        bugTooltip: chrome.i18n.getMessage("bug"),
        sourcecodeTooltip: chrome.i18n.getMessage("sourcecode"),
        rateusTooltip: chrome.i18n.getMessage("rateus"),
        yitingTooltip: chrome.i18n.getMessage("yiting"),
        majiangTooltip: chrome.i18n.getMessage("majiang"),
    });
});