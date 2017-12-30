chrome.storage.sync.get({
    position: 'right',
    tocs_toggle: true,
    hover: true,
    block_list: [],
    theme: ""
}, function (items) {
    var toggle = items.tocs_toggle;
    var block_list = items.block_list;
    var theme = items.theme;
    if (!toggle) return;
    if (isBlocked(block_list)) return;
    var nodes = parseLinkableNodes();
    injectCss(theme);
    var fixedSidebarNode = createFixedSidebarNode();
    var fixedMenuNode = createFixedMenuNode();
    fixedSidebarNode.appendChild(createOptionsNode(items.hover, items.position));
    fixedSidebarNode.appendChildren(nodes);
    fixedSidebarNode.appendChild(createCopyrightNode());
    var doc = document.createElement("div");
    doc.id = "table-of-contents-sidebar-fixed-sidebar-tooltip";
    fixedSidebarNode.appendChild(doc);
    restoreOptions(items, fixedSidebarNode, fixedMenuNode);
    document.body.appendChild(fixedSidebarNode);
    document.body.appendChild(fixedMenuNode);
    Tooltip.tooltip = document.getElementById('table-of-contents-sidebar-fixed-sidebar-tooltip');
});
var fixedHeight = 0;
var isOverflow = false;

var Tooltip = {
    tooltip: undefined,
    target: undefined,
    show: function() {
        Tooltip.target = this;
        var tip = Tooltip.target['tooltip'];
        if( !tip || tip == '' ) {            
            return false;
        }
        Tooltip.tooltip.innerHTML = tip ;
        if( window.innerWidth < Tooltip.tooltip.offsetWidth * 1.5 ) {
            Tooltip.tooltip.style.maxWidth = (window.innerWidth / 2)+'px';
        }
        else {
            Tooltip.tooltip.style.maxWidth = 250 + 'px';
        }
        
        var pos_left = Tooltip.target.offsetLeft + ( Tooltip.target.offsetWidth / 2 ) - ( Tooltip.tooltip.offsetWidth / 2 ),
            pos_top  = Tooltip.target.offsetTop - Tooltip.tooltip.offsetHeight - 20;
        Tooltip.tooltip.className = '';

        if( pos_left < 0 ) {
            pos_left = Tooltip.target.offsetLeft + Tooltip.target.offsetWidth / 2 - 20;
            Tooltip.tooltip.className += ' left';
        }
        
        if( pos_left + Tooltip.tooltip.offsetWidth > window.innerWidth ) {
            pos_left = Tooltip.target.offsetLeft - Tooltip.tooltip.offsetWidth + Tooltip.target.offsetWidth / 2 + 20;
            Tooltip.tooltip.className +=' right';
        }
        
        if( pos_top < 0 ) {
            var pos_top  = Tooltip.target.offsetTop + Tooltip.target.offsetHeight;
            Tooltip.tooltip.className += ' top';
        }
        
        Tooltip.tooltip.style.left = pos_left + 'px';
        Tooltip.tooltip.style.top = pos_top  + 2 + 'px';
        Tooltip.tooltip.className += ' show';
    },
    hide: function() {
        Tooltip.tooltip.className = Tooltip.tooltip.className.replace('show', '');
    }
};

window.onscroll = function() {
    var height = 0;
    var documents = document.getElementsByTagName('*');
    for (var i = 0, l = documents.length; i < l; i++) {
        var node = documents[i];
        if(node.id == "table-of-contents-sidebar-id") continue;
        var style = window.getComputedStyle(node,null);
        var position = style.getPropertyValue("position");
        var top =  style.getPropertyValue("top");
        if(position == "fixed" && top == "0px" && node.offsetHeight < 200) {
            height += node.offsetHeight;
        }
     }
     fixedHeight = height;
}

function restoreOptions(optionsItems, sidebar, menu) {
    if (optionsItems) {
        var position = optionsItems.position;
        var hover = optionsItems.hover;
        if (position == "right") {
            activeRight(sidebar, menu);
        } else {
            activeLeft(sidebar, menu);
        }
        if (hover) {
            activeUnpin(sidebar, menu);
        } else {
            activePin(sidebar, menu);
        }

    } else {
        chrome.storage.sync.get({
            position: 'right',
            tocs_toggle: false,
            hover: false
        }, function (items) {
            if (items.tocs_toggle == false) {
                return;
            }
            restoreOptions(items);
        });
    }
}

function injectCss(path) {
    var link = document.createElement("link");
    link.href = chrome.extension.getURL(!!path ? path : "table-of-contents-sidebar.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    var headNode = document.getElementsByTagName("head");
    if (headNode) {
        headNode[0].appendChild(link);
    } else {
        document.body.appendChild(link);
    }
}

function fixedSidebarPinBtnNode() {
    var element = document.getElementById("table-of-contents-sidebar-pin-id");
    return element;
}
function fixedSidebarPositionBtnNode() {
    var element = document.getElementById("table-of-contents-sidebar-position-id");
    return element;
}
function fixedSidebarNode() {
    var element = document.getElementById("table-of-contents-sidebar-id");
    return element;
}

function fixedSidebarMenuNode() {
    var element = document.getElementById("table-of-contents-sidebar-hover-menu-id");
    return element;
}

function isBlocked(block_list) {
    if (!block_list || block_list.length == 0) return false;
    var domain = document.domain;
    var block = false;
    for (var i = 0; i < block_list.length; i++) {
        if (domain.indexOf(block_list[i]) != -1) {
            block = true;
        }
    }
    return block;
}

function addNode(root, node) {
    if (!!root && !!root.nodes && root.nodes.length != 0) {
        var lastNode = root.nodes[root.nodes.length - 1];
        if (lastNode.name == node.name) {
            root.nodes.push(node);
        } else if (lastNode.name < node.name) {
            addNode(lastNode, node);
        } else {
            root.nodes.push(node);
        }
    } else {
        root.nodes = [node];
    }
}

function parseLinkableNodes() {
    var documents = document.getElementsByTagName('*');
    var iteratorAbsTop = 0;
    var sidebarCount = 0;
    var matchesNodes = [];
    var root = {nodes: []};
    for (var i = 0, l = documents.length; i < l; i++) {
        var node = documents[i];
        var style = window.getComputedStyle(node,null);
        var position = style.getPropertyValue("position");
        var top =  style.getPropertyValue("top");
        if(position == "fixed" && top == "0px" && node.offsetHeight < 200) {
            fixedHeight += node.offsetHeight;
        }
        if (!!node && !!node.textContent && !!node.textContent.trim()
            && (node.nodeName == "H1" || node.nodeName == "H2" || node.nodeName == "H3"
            || node.nodeName == "H4" || node.nodeName == "H5" || node.nodeName == "H6")) {
            var absTop = node.getBoundingClientRect().top + document.documentElement.scrollTop;
            if(absTop > document.body.offsetHeight){
                isOverflow = true;
            }
            if (!!matchesNodes && matchesNodes.length != 0) {
                var previous = matchesNodes[matchesNodes.length - 1];
                if (absTop == previous.absTop) {
                    continue;
                }
            }
            // comment tricky logic
            // if (sidebarCount > 0 && absTop < iteratorAbsTop) {
            //     break;
            // }
            if (!node.id) {
                node.id = uuid();
            }
            var data = {
                id: node.id,
                text: node.textContent,
                name: node.nodeName,
                absTop: absTop
            };
            addNode(root, data);
            matchesNodes.push(data);
            iteratorAbsTop = absTop;
            sidebarCount++;
        }
    }
    return root;
}

function createFixedSidebarNode() {
    var fixedSidebarNode = document.createElement('div');
    fixedSidebarNode.id = "table-of-contents-sidebar-id";
    fixedSidebarNode.className = "table-of-contents-sidebar-fixed-sidebar";
    return fixedSidebarNode;
}

function createFixedMenuNode() {
    var sidebar = fixedSidebarNode();
    var left = null, right = "18px";
    if (sidebar) {
        sidebar.style.left;
        sidebar.style.right;
    }
    var fixedSidebarHoverMenu = document.createElement('img');
    fixedSidebarHoverMenu.id = "table-of-contents-sidebar-hover-menu-id";
    fixedSidebarHoverMenu.src = getImageUrl("images/icon/ic_normal.png");
    fixedSidebarHoverMenu.className = "table-of-contents-sidebar-menu";
    fixedSidebarHoverMenu.style.left = left;
    fixedSidebarHoverMenu.style.right = right;
    fixedSidebarHoverMenu.addEventListener('mouseover', mouseOverEvent);
    fixedSidebarHoverMenu.addEventListener('mouseout', mouseOutEvent);
    return fixedSidebarHoverMenu;
}

function sidebarMouseOutEvent(e) {
    e.stopPropagation();
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    sidebar.className = "table-of-contents-sidebar-fixed-sidebar";
}

function sidebarMouseOverEvent(e) {
    e.stopPropagation();
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    sidebar.className = "table-of-contents-sidebar-fixed-sidebar show";
}

function mouseOutEvent(e) {
    e.stopPropagation();
    var sidebar = fixedSidebarNode();
    sidebar.className = "table-of-contents-sidebar-fixed-sidebar";
    sidebar.addEventListener('mouseout', sidebarMouseOutEvent);
    sidebar.addEventListener('mouseover', sidebarMouseOverEvent);
}
function mouseOverEvent(e) {
    e.stopPropagation();
    var sidebar = fixedSidebarNode();
    if (sidebar) {
        sidebar.className = "table-of-contents-sidebar-fixed-sidebar show";
        sidebar.addEventListener('mouseout', sidebarMouseOutEvent);
        sidebar.addEventListener('mouseover', sidebarMouseOverEvent);
    }
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

function activeLeft(sidebar, menu) {
    var positionNode = fixedSidebarPositionBtnNode();
    if (positionNode) {
        positionNode.src = getImageUrl("images/right.png");
        positionNode.addEventListener('click', function (e) {
            e.stopPropagation();
            activeRight();
        });
        positionNode.tooltip = "Right";
        positionNode.addEventListener('mouseover', Tooltip.show);
        positionNode.addEventListener('mouseleave', Tooltip.hide);
    }
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        sidebar.style.left = "0px";
        sidebar.style.right = null;
    }
    if (menu) {
        menu.style.left = "18px";
        menu.style.right = null;
    }
}
function activeRight(sidebar, menu) {
    var positionNode = fixedSidebarPositionBtnNode();
    if (positionNode) {
        positionNode.src = getImageUrl("images/left.png");
        positionNode.addEventListener('click', function (e) {
            e.stopPropagation();
            activeLeft();
        });
        positionNode.tooltip = "Left";
        positionNode.addEventListener('mouseover', Tooltip.show);
        positionNode.addEventListener('mouseleave', Tooltip.hide);
    }
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        sidebar.style.right = "0px";
        sidebar.style.left = null;
    }
    if (menu) {
        menu.style.right = "18px";
        menu.style.left = null;
    }
}
function activePin(sidebar, menu) {
    var pinNode = fixedSidebarPinBtnNode();
    if (pinNode) {
        pinNode.src = getImageUrl("images/pin.png");
        pinNode.addEventListener('click', function (e) {
            e.stopPropagation();
            activeUnpin();
        });
        pinNode.tooltip = "Pin";
        pinNode.addEventListener('mouseover', Tooltip.show);
        pinNode.addEventListener('mouseleave', Tooltip.hide);
    }
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        sidebar.removeEventListener('mouseout', sidebarMouseOutEvent, false);
        sidebar.removeEventListener('mouseover', sidebarMouseOverEvent, false);
        sidebar.className = "table-of-contents-sidebar-fixed-sidebar show";
    }
    if (menu) {
        menu.removeEventListener('mouseout', mouseOutEvent, false);
        menu.removeEventListener('mouseover', mouseOverEvent, false);
    }
}

function activeUnpin(sidebar, menu) {
    var pinNode = fixedSidebarPinBtnNode();
    if (pinNode) {
        pinNode.src = getImageUrl("images/unpin.png");
        pinNode.addEventListener('click', function (e) {
            e.stopPropagation();
            activePin();
        });
        pinNode.tooltip = "Unpin";
        pinNode.addEventListener('mouseover', Tooltip.show);
        pinNode.addEventListener('mouseleave', Tooltip.hide);
    }
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        // sidebar.style.width = '0';
        sidebar.addEventListener('mouseout', sidebarMouseOutEvent);
        sidebar.addEventListener('mouseover', sidebarMouseOverEvent);
    }
    if (menu) {
        menu.style.display = "block";
        menu.addEventListener('mouseover', mouseOverEvent);
        menu.addEventListener('mouseout', mouseOutEvent);
    }
}

function createCopyrightNode() {
    var span = document.createElement('span');
    span.className = "copyright";
    var yiting = document.createElement('a');
    yiting.appendChild(document.createTextNode("Yiting"));
    yiting.title = "Yiting";
    yiting.href = "https://yiting.myportfolio.com?utm_source=toc";
    yiting.target = "_blank";
    var majiang = document.createElement('a');
    majiang.appendChild(document.createTextNode("Majiang"));
    majiang.title = "Majiang";
    majiang.href = "http://www.majiang.life?utm_source=toc";
    majiang.target = "_blank";
    var copyright = document.createTextNode("Powered by ");
    var and = document.createTextNode(" & ");
    span.appendChild(copyright);
    span.appendChild(yiting);
    span.appendChild(and);
    span.appendChild(majiang);
    return span;
}

function createOptionsNode(isUnpin,position) {
    var optionsContainer = createSpanNode("");

    var leftBtn = createImageNode("images/right.png", "Right");
    leftBtn.id = "table-of-contents-sidebar-position-id";
    if (!!position && position == "right") {
        leftBtn.src = getImageUrl("images/left.png");
        leftBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            activeLeft();
        });
        leftBtn.tooltip = "Left";
        leftBtn.addEventListener('mouseover', Tooltip.show);
        leftBtn.addEventListener('mouseleave', Tooltip.hide);
    } else {
        leftBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            activeRight();
        });
        leftBtn.tooltip = "Right";
        leftBtn.addEventListener('mouseover', Tooltip.show);
        leftBtn.addEventListener('mouseleave', Tooltip.hide);
    }

    var pinBtn = createImageNode("images/unpin.png", "Pin");
    pinBtn.id = "table-of-contents-sidebar-pin-id";
    if (!isUnpin) {
        pinBtn.src = getImageUrl("images/pin.png");
        pinBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            activeUnpin();
        });
        pinBtn.tooltip = "Pin";
        pinBtn.addEventListener('mouseover', Tooltip.show);
        pinBtn.addEventListener('mouseleave', Tooltip.hide);
    } else {
        pinBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            activePin();
        });
        pinBtn.tooltip = "Unpin";
        pinBtn.addEventListener('mouseover', Tooltip.show);
        pinBtn.addEventListener('mouseleave', Tooltip.hide);
    }

    var optionBtn = createImageNode("images/settings.png", "Settings");
    optionBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.open(chrome.runtime.getURL('options.html'), '_blank');
    });
    var bugBtn = createImageNode("images/bug.png", "Report Bugs");
    bugBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.open('https://github.com/codedrinker/table-of-contents-sidebar/issues', '_blank');
    });
    bugBtn.tooltip = "Report Bug";
    bugBtn.addEventListener('mouseover', Tooltip.show);
    bugBtn.addEventListener('mouseleave', Tooltip.hide);

    var githubBtn = createImageNode("images/github.png", "Fork on GitHub");
    githubBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.open('https://github.com/codedrinker/table-of-contents-sidebar', '_blank');
    });
    githubBtn.tooltip = "Source Code";
    githubBtn.addEventListener('mouseover', Tooltip.show);
    githubBtn.addEventListener('mouseleave', Tooltip.hide);

    optionsContainer.appendChild(leftBtn);
    optionsContainer.appendChild(pinBtn);
    // optionsContainer.appendChild(optionBtn);
    optionsContainer.appendChild(bugBtn);
    optionsContainer.appendChild(githubBtn);
    optionsContainer.appendChild(document.createElement('br'));
    return optionsContainer;
}

function createImageNode(url, title, size) {
    var image = document.createElement('img');
    image.style.marginLeft = "12px";
    image.style.height = !!size ? size : "22px";
    image.style.width = !!size ? size : "22px";
    image.style.cursor = "pointer";
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

function parseNodes(parent,node,index) {
    if (!!node) {
        if(!!node.text) {
            var li = document.createElement("li");
            var className = "ANCHOR-" + index;
            li.className = className;
            var refNode = document.createElement('a');
            var text = document.createTextNode(node.text);
            refNode.appendChild(text);
            refNode.tooltip = node.text;
            refNode.href = "#" + node.id;
            refNode.addEventListener('mouseover', Tooltip.show);
            refNode.addEventListener('mouseleave', Tooltip.hide);
            refNode.addEventListener('click', function (e) {
                e.preventDefault();
                var id = e.srcElement.hash.substr(1);
                var doc = document.getElementById(decodeURIComponent(id));
                var top = doc.getBoundingClientRect().top + window.scrollY - fixedHeight;
                if(isOverflow) {
                    window.location.hash = e.srcElement.hash; 
                } else {
                    window.scroll({
                      top: top,
                      left: 0, 
                      behavior: 'smooth'
                    });
                }
             });
             li.appendChild(refNode);
             parent.appendChild(li);
        }
        index++;
        if (!!node.nodes && node.nodes.length != 0)
            for (var i = 0; i < node.nodes.length; i++) {
                parseNodes(parent, node.nodes[i], index);
            }
    }
}

Node.prototype.appendChildren = function (root) {
    var that = this;
    if (!!root) {
        var ul = document.createElement("ul");
        parseNodes(ul,root,0);
        that.appendChild(ul);
    }
};