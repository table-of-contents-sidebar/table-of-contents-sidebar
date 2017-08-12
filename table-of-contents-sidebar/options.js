function save_options() {
    var position = document.getElementById('position').value;
    var toggle = document.getElementById('toggle').checked;
    var hover = document.getElementById('hover').checked;
    chrome.storage.sync.set({
        position: position,
        tocs_toggle: toggle,
        hover: hover
    }, function () {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        checkToggle();
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        position: 'right',
        tocs_toggle: true,
        hover: false
    }, function (items) {
        document.getElementById('position').value = items.position;
        document.getElementById('toggle').checked = items.tocs_toggle;
        document.getElementById('hover').checked = items.hover;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);