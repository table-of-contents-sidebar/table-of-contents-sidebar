chrome.storage.sync.get('tocs_toggle', function (data) {
    if (data.tocs_toggle == true) {
    }
    var blocklist = ["google", "baidu.com", "stackoverflow.com", "github.com", "localhost"];
    prepareLinks();
    var domain = document.domain;
    var block = false;
    for (var i = 0; i < blocklist.length; i++) {
        if (domain.indexOf(blocklist[i]) != -1) {
            block = true;
        }
    }
    if (block) {
        return;
    }
    var documents = document.getElementsByTagName('*');
    var fixedSidebar = document.createElement('div');
    fixedSidebar.id = "table-of-contents-sidebar-id";
    fixedSidebar.className = "table-of-contents-sidebar-fixed-sidebar";
    fixedSidebar.appendChild(createOptionsNode());
    fixedSidebar.appendChild(document.createElement('br'));
    var iteratorAbsTop = 0;
    var sidebarCount = 0;
    for (var i = 0, l = documents.length; i < l; i++) {
        var node = documents[i];
        if (!!node && !!node.textContent && !!node.textContent.trim() && (node.nodeName == "H1" || node.nodeName == "H2"
                || node.nodeName == "H3" || node.nodeName == "H4"
                || node.nodeName == "H5" || node.nodeName == "H6"
            )) {
            var absTop = node.getBoundingClientRect().top + document.documentElement.scrollTop;
            if (sidebarCount > 0 && absTop < iteratorAbsTop) {
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
        }
    }
    if (sidebarCount > 2) {
        document.body.appendChild(fixedSidebar);
    }
    function prepareLinks() {
        var link = document.createElement("link");
        link.href = chrome.extension.getURL("table-of-contents-sidebar.css");
        link.type = "text/css";
        link.rel = "stylesheet";
        var headNode = document.getElementsByTagName("head");
        if (headNode) {
            headNode[0].appendChild(link);
        } else {
            document.body.appendChild(link);
        }
    }

    function createOptionsNode() {
        var span = createSpanNode("");
        var left = createImageNode("images/left.png", "Float Left");
        left.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var sidebar = document.getElementById("table-of-contents-sidebar-id");
            sidebar.style.left = "0px";
            sidebar.style.right = null;
            var sidebarMenu = document.getElementById("table-of-contents-sidebar-hover-menu-id");
            if (sidebarMenu) {
                sidebarMenu.style.left = "0px";
                sidebarMenu.style.right = null;
            }
        });
        var right = createImageNode("images/right.png", "Float Right");
        right.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var sidebar = document.getElementById("table-of-contents-sidebar-id");
            sidebar.style.right = "0px";
            sidebar.style.left = null;
            var sidebarMenu = document.getElementById("table-of-contents-sidebar-hover-menu-id");
            if (sidebarMenu) {
                sidebarMenu.style.right = "0px";
                sidebarMenu.style.left = null;
            }
        });
        var close = createImageNode("images/close.png", "Close", "18px");
        close.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var sidebar = document.getElementById("table-of-contents-sidebar-id");
            sidebar.style.display = "none";
            var sidebarMenu = document.getElementById("table-of-contents-sidebar-hover-menu-id");
            sidebarMenu.style.display = "block";
        });
        var hover = createImageNode("images/hover.png", "Display on Hover", "18px");
        hover.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var sidebar = document.getElementById("table-of-contents-sidebar-id");
            sidebar.style.display = "none";
            createHoverNode();
        });
        var bug = createImageNode("images/bug.png", "Report Bugs", "18px");
        bug.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            window.open('https://github.com/codedrinker/table-of-contents-sidebar/issues', '_blank');
        });
        span.appendChild(left);
        span.appendChild(right);
        span.appendChild(close);
        span.appendChild(hover);
        span.appendChild(bug);
        return span;
    }

    function createHoverNode() {
        var sidebar = document.getElementById("table-of-contents-sidebar-id");
        var left = sidebar.style.left;
        var right = sidebar.style.right;
        var fixedSidebarHoverMenu = document.createElement('img');
        fixedSidebarHoverMenu.id = "table-of-contents-sidebar-hover-menu-id";
        fixedSidebarHoverMenu.src = getImageUrl("images/icon/icon_blue_128x128.png");
        fixedSidebarHoverMenu.className = "table-of-contents-sidebar-menu";
        fixedSidebarHoverMenu.style.left = left;
        fixedSidebarHoverMenu.style.right = right;
        document.body.appendChild(fixedSidebarHoverMenu);
        fixedSidebarHoverMenu.addEventListener('mouseover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var sidebar = document.getElementById("table-of-contents-sidebar-id");
            sidebar.style.display = "block";
            sidebar.addEventListener('mouseout', function (e) {
                e.stopPropagation();
                e.preventDefault();
                sidebar.style.display = "none";
            });
            sidebar.addEventListener('mouseover', function (e) {
                e.stopPropagation();
                e.preventDefault();
                sidebar.style.display = "block";
            });
        });
        fixedSidebarHoverMenu.addEventListener('mouseout', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var sidebar = document.getElementById("table-of-contents-sidebar-id");
            sidebar.style.display = "none";
            sidebar.addEventListener('mouseout', function (e) {
                e.stopPropagation();
                e.preventDefault();
                sidebar.style.display = "none";
            });
            sidebar.addEventListener('mouseover', function (e) {
                e.stopPropagation();
                e.preventDefault();
                sidebar.style.display = "block";
            });
        });
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
    }

    function createLinkNode(url, text) {
        var a = document.createElement('a');
        var linkText = document.createTextNode(text);
        a.appendChild(linkText);
        a.title = text;
        a.href = url;
        return a;
    }

    function createImageNode(url, title, size) {
        var image = document.createElement('img');
        image.style.marginLeft = "5px";
        image.style.height = !!size ? size : "20px";
        image.style.width = !!size ? size : "20px";
        image.style.cursor = "pointer";
        image.alt = title;
        image.title = title;
        image.src = getImageUrl(url);
        return image;
    }

    function createSpanNode(text) {
        var span = document.createElement('span');
        var textNode = document.createTextNode(text);
        span.appendChild(textNode);
        return span;
    }

    function getImageUrl(name) {
        var image = chrome.extension.getURL(name);
        return image;
    }

    function uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
});
