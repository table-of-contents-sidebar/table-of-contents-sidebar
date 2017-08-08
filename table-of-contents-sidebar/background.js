function displayEnable () {
	chrome.contextMenus.removeAll();
	chrome.contextMenus.create({
	      title: "Enable",
	      contexts: ["browser_action"],
	      onclick: function() {
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
	      onclick: function() {
	        disable();
	        displayEnable();
	        refresh();
	      }
	});
}

function enable() {
	 chrome.storage.local.set({'tocs-toggle': true}, function() {
     });
     chrome.browserAction.setIcon({
	  path : "icon.png"
	 });
}
function disable() {
	 chrome.storage.local.set({'tocs-toggle': false}, function() {
     });
     chrome.browserAction.setIcon({
	  path : "close.png"
	 });
}

function refresh() {
	chrome.tabs.getSelected(null, function(tab) {
        tabId = tab.id;
        chrome.tabs.reload(tabId);
    });
}

enable();
displayDisable();