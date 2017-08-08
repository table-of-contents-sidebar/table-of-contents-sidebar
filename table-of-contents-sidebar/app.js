chrome.storage.local.get('tocs-toggle', function (data) {
    // if (data.toggle == true) {
    // }
    var documents = document.getElementsByTagName('*');
    var tree = {};
    tree.data = document.title;
    var fixedSidebar = document.createElement('div');
    fixedSidebar.style.position = "fixed";
    fixedSidebar.style.right = "0px";
    fixedSidebar.style.top = "0px";
    fixedSidebar.style.height = "100%";
    fixedSidebar.style.padding = "15px";
    fixedSidebar.style.width = "250px";
    fixedSidebar.style.backgroundColor = "#f1f1f1";
    fixedSidebar.style.overflowY = "auto";
    fixedSidebar.style.zIndex = "2000";
    fixedSidebar.style.border = "1px solid #cecece";
    fixedSidebar.style.fontSize = "14px";
    fixedSidebar.style.whiteSpace = "nowrap";
    var iteratorAbsTop = 0;
    var sidebarCount = 0;
    for (var i = 0, l = documents.length; i < l; i++) {
        var node = documents[i];
        if (!!node && (node.nodeName == "H1" || node.nodeName == "H2"
                || node.nodeName == "H3" || node.nodeName == "H4"
                || node.nodeName == "H5" || node.nodeName == "H6"
            )) {
            var absTop = node.getBoundingClientRect().top + document.documentElement.scrollTop;
            if (absTop < iteratorAbsTop) {
                break;
            }
            if (!!node.id) {
                createCellNode(node.nodeName, "#" + node.id, node.textContent);
            } else {
                node.id = uuid();
                createCellNode(node.nodeName, "#" + node.id, node.textContent);
            }
            iteratorAbsTop = absTop;
            sidebarCount = sidebarCount + 1;
            // node.textContent = node.textContent + "(" + i + ")" + "(" + absTop + ")";
        }
    }
    if (sidebarCount > 0) {
        document.body.appendChild(fixedSidebar);
    }

    function createCellNode(tag, url, text) {
        var linkNode = createLinkNode(url, text);
        switch (tag) {
            case "H1":
                linkNode.style.marginLeft = "0px";
                break;
            case "H2":
                linkNode.style.marginLeft = "20px";
                break;
            case "H3":
                linkNode.style.marginLeft = "40px";
                break;
            case "H4":
                linkNode.style.marginLeft = "60px";
                break;
            case "H5":
                linkNode.style.marginLeft = "80px";
                break;
            case "H6":
                linkNode.style.marginLeft = "100px";
                break;
        }
        fixedSidebar.appendChild(linkNode);
        fixedSidebar.appendChild(document.createElement('br'));
    };

    function createLinkNode(url, text) {
        var a = document.createElement('a');
        var linkText = document.createTextNode(text);
        a.appendChild(linkText);
        a.title = text;
        a.href = url;
        document.body.appendChild(a);
        return a;
    };

    function uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
});
