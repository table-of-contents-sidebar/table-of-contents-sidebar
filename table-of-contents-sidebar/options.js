function save_options() {
    var position = document.getElementById('position').value;
    var toggle = document.getElementById('toggle').checked;
    var hover = document.getElementById('hover').checked;
    chrome.storage.sync.set({
        position: position,
        tocs_toggle: toggle,
        hover: hover
    }, function () {
        show_message("Changes Saved. Some preferences will not take effect until next time the program is started");
        checkToggle();
    });
}

function restore_options() {
    chrome.storage.sync.get({
        position: 'right',
        tocs_toggle: true,
        hover: false,
        block_list: []
    }, function (items) {
        document.getElementById('position').value = items.position;
        document.getElementById('toggle').checked = items.tocs_toggle;
        document.getElementById('hover').checked = items.hover;
        if (!!items.block_list && items.block_list.length != 0) {
            generate_block_list_table(items.block_list)
        }
    });
}

function generate_block_list_table(block_list) {
    var title = document.createElement("h1");
    title.textContent = "Block List";
    document.body.appendChild(title);
    var blockListTableNode = document.createElement('table');
    blockListTableNode.id = "block-list-table";
    blockListTableNode.className = "options-table";
    for (var i = 0, l = block_list.length; i < l; i++) {
        var block_hostname = block_list[i];
        var tr = document.createElement('tr');
        var hostnameTd = document.createElement('td');
        hostnameTd.textContent = block_hostname;
        var optionTd = document.createElement('td');
        optionTd.setAttribute("data-bind", block_hostname);
        optionTd.textContent = "Remove";
        optionTd.style.cursor = "pointer";
        optionTd.style.color = "blue";
        optionTd.addEventListener("click", function (e) {
            var hostname = e.srcElement.getAttribute("data-bind");
            removeFromBlocklist(hostname);
            e.srcElement.parentNode.parentNode.removeChild(e.srcElement.parentNode);
            show_message("Remove " + hostname + " Successfully.");
        });
        tr.appendChild(hostnameTd);
        tr.appendChild(optionTd);
        blockListTableNode.appendChild(tr);
    }
    document.body.appendChild(blockListTableNode);

}

function removeFromBlocklist(hostname) {
    chrome.storage.sync.get({block_list: []}, function (result) {
        var block_list = result.block_list;
        if (!block_list) return;
        var index = block_list.indexOf(hostname);
        if (index > -1) {
            block_list.splice(index, 1);
        }
        chrome.storage.sync.set({block_list: block_list}, function () {
            console.log("Remove " + hostname + " Succeed.")
        });
    });
}

function show_message(message) {
    var status = document.getElementById('status');
    status.textContent = message;
    setTimeout(function () {
        status.textContent = '';
    }, 2000);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);