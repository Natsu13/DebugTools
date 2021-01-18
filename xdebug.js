var XDebug = function () {
    this.heads = document.getElementsByTagName('head');
    this.tabs = [
        { title: "Console", contentType: "log", content: "dbtab" },
        { title: "Elements", contentType: "dom", content: "domtab" },
        { title: "Application", contentType: "app", content: "apptab" },
        { title: "Device", contentType: "dvc", content: "dvctab" },
    ];
    this.contents = { dbtab: null, domtab: null, apptab: null, dvctab: null };
    this.contentsShow = null;
    this.isOpen = true;
    this.onload = null;
    this.highlightedDom = null;

    XDebug.instance = this;
};
XDebug.prototype.Start = function (onload) {
    this.onload = onload;

    if (typeof jQuery == "undefined") {
        this.loadJQueryFile();
    } else {
        this.CreateDebug();
    }
};
XDebug.prototype.loadJQueryFile = function () {
    var jqueryScript = document.createElement('script');
    jqueryScript.setAttribute("type", "text/javascript");
    jqueryScript.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js");

    jqueryScript.onload = function () { XDebug.instance.CreateDebug(); };
    this.heads[0].appendChild(jqueryScript);
}
XDebug.prototype.CreateStyle = function () {
    var style = ".xdebug-panel{z-index: 9999;position: fixed;bottom: 0px;height: 300px;display: flex;flex-direction: column;background: #242424;left: 0px;right: 0px;border-top: 1px solid #292a2d;font-size:13px;font-family: Consolas, monospace !important;color:white;}";
    style += ".xdebug-tabs{border-bottom: 1px solid #3d3d3d;position:relative;background: #292a2d;}";
    style += ".xdebug-tabs > div:not(.right) {display: inline-flex;}";
    style += ".xdebug-tabs-tab{padding: 5px 11px;cursor:pointer;font-family: Roboto, Ubuntu, Arial, sans-serif;font-size: 12px;}";
    style += ".xdebug-tabs .right{position: absolute;right: 0px;top: 0px;}";
    style += ".xdebug-tabs .right a {padding: 6px 10px;display: block;text-decoration: none;color: #6f6f6f;font-size: 13px;font-weight: bold;}";
    style += ".xdebug-tabs .right a:hover {color:white;}";
    style += ".xdebug-tabs-tab.selected{background-color:black;}";
    style += ".xdebug-tabs-tab:not(.selected):hover{background: #202020;}";
    style += ".xdebug-tabs-input {}";
    style += ".xdebug-tabs-input > input {background: #242424;border: 1px solid #3d3d3d;padding: 3px 7px;color: #fff;outline: none;}";
    style += ".xdebug-tabs-input > input:focus {border:1px solid #09659b;}";
    style += ".xdebug-debug-content {display: flex;flex-direction: column;flex: 1;}";
    style += ".xdebug-content-debug-log {flex: 1;overflow: auto;}";
    style += ".xdebug-content {flex:1;display: flex;flex-direction: column;overflow: auto;}";
    style += ".xdebug-log-log {padding: 4px;padding-left: 28px;border-bottom: 1px solid #3a3a3a;font-size: 13px;}";
    style += ".xdebug-log-log .right {float:right;color: #737373;}";
    style += ".xdebug-log-type-error {background: #290000;border-top: 1px solid #5b0000;border-bottom: 1px solid #5b0000;position: relative;top: -1px;color: #d56569;}";
    style += ".xdebug-log-type-error:before {content: 'x';height: 13px;float: left;position: relative;left: -23px;margin-right: -17px;background: #d56569;color: #fff;border-radius: 50%;width: 13px;text-align: center;font-size: 11px;padding: 1px;}";
    style += ".xdebug-log-type-warning {background: #332a01;border-top: 1px solid #665404;border-bottom: 1px solid #665404;position: relative;top: -1px;color: white;}";
    style += ".xdebug-log-type-warning:before { content: '!';height: 13px;float: left;position: relative;left: -23px;margin-right: -17px;background: #f5ba16;font-weight: bold;color: #fff;border-top-left-radius: 100%;border-top-right-radius: 100%;border-bottom-left-radius: 7px;border-bottom-right-radius: 7px;width: 13px;text-align: center;font-size: 11px;padding: 1px;}";
    style += ".xdebug-content-content .button, .xdebug-debug-content .button, .xdebug-dom-content .button { text-decoration: none; display: inline-block; border: 1px solid #1c1c1d;padding: 3px 6px;font-size: 14px;background: #292a2d;color: #fff;margin: 6px;}";
    style += ".xdebug-content-content {flex: 1; overflow: auto;}";
    style += ".xdebug-dom-content {flex: 1; overflow: auto; display: flex;}";
    style += ".xdebug-left-side {flex:1;overflow: auto;}";
    style += ".xdebug-right-side {width: 326px; border-left: 1px solid #525252;display: flex;flex-direction: column;}";
    style += ".xdebug-tag-inside { }";
    style += ".xdebug-tag-name {color: #3ca5cb;}";
    style += ".xdebug-tag-attribute-name {color: #85bcbf;}";
    style += ".xdebug-tag-attribute-value {color: #e6945d;}";
    style += ".xdebug-tag-text {white-space: break-spaces;}";
    style += ".xdebug-tag-holder:not(.xdebug-open) > div, .xdebug-tag-oneline > div {display: inline-block;}";
    style += ".xdebug-tag-oneline > div:not(.xdebug-tag-open) {padding-left:0px !important;}";
    style += ".xdebug-tag-holder:not(.xdebug-open) .xdebug-tag-name, .xdebug-tag-holder:not(.xdebug-open) .xdebug-tag-inside, .xdebug-tag-oneline .xdebug-tag-inside {padding-left:0px;}";
    style += ".xdebug-tag-holder:not(.xdebug-open):not(.xdebug-tag-oneline) > .xdebug-tag-close {padding-left:16px !important;}";
    style += ".xdebug-tag-holder:not(.xdebug-open):hover, .xdebug-tag-oneline:hover {background:#252d36; border-radius: 4px;}";
    style += ".xdebug-tag-open:hover, .xdebug-tag-close:hover {background:#252d36; border-radius: 4px;}";
    style += ".xdebug-expand-bar { background: #292a2d;padding: 4px;border-bottom: 1px solid #2e2e31; }";
    style += ".xdebug-expand-bar input[type=text] { background: #242424;border: 0px;padding: 3px 5px;color: white; }";
    style += ".xdebug-expand-bar input[type=text]:hover { outline: 1px solid #3d3d3d; }";
    style += ".xdebug-expand-bar input[type=text]:focus { outline:1px solid #09659b; }";
    style += ".xdebug-element-style-container .xdebug-text-info { color: #e0e0e0; }";
    style += ".xdebug-element-style-container .xdebug-text-info:first-child { padding-bottom: 2px; }";
    style += ".xdebug-element-style-container .xdebug-text-info:last-child { padding-top: 1px; }";
    style += ".xdebug-element-style-container { padding: 3px; border-bottom:1px solid #525252; }";
    style += ".xdebug-element-style-container:hover input[type=checkbox] { visibility: visible;  }";
    style += ".xdebug-dom-style-prop {display:flex;margin-bottom: -4px;}";
    style += ".xdebug-dom-style-prop > input[type=checkbox] { visibility: hidden; }";
    style += ".xdebug-dom-style-prop-name {padding-right: 5px;}";
    style += ".xdebug-dom-style-prop-name > span {color: #3fd5c7;}";
    style += ".xdebug-dom-style-prop-value > span {}";
    style += ".xdebug-content-panel {overflow: auto;position: relative;}";
    style += ".xdebug-opener { display:inline-block; }";
    style += ".xdebug-tag-holder:not(.xdebug-tag-oneline) > .xdebug-tag-name > .xdebug-opener > div:before { content: '>';color: #c0c0c0;font-size: 10px;padding: 3px;position: relative;top: -1px;font-weight: bold; }";
    style += ".xdebug-tag-holder.xdebug-open > .xdebug-tag-name > .xdebug-opener > div { transform: rotate(90deg);position: relative;top: -1px; }";
    style += ".xdebug-tag-holder.xdebug-open > .xdebug-tag-name > .xdebug-opener > div:before { color: white; }";
    style += ".xdebug-tag-holder:not(.xdebug-open):not(.xdebug-tag-oneline) > .xdebug-tag-inside {display:none;}";
    style += ".xdebug-tag-holder:not(.xdebug-open):not(.xdebug-tag-oneline) > .xdebug-tag-close:before { content: '...';margin-left: -15px;letter-spacing: -4px;margin-right: 4px;color: #c0c0c0;font-size: 12px; }";
    style += ".xdebug-item-line { display: flex;border-bottom: 1px solid #3d3d3d; }";
    style += ".xdebug-item-line:hover { background: #192537; }";
    style += ".xdebug-item-line .xdebug-item-line-label { flex: 1;padding: 7px;border-right: 1px solid #3d3d3d; }";
    style += ".xdebug-item-line .xdebug-item-line-value { flex: 1;padding: 7px; }";
    style += ".xdebug-tabs-input { padding: 0px 3px; }";            
    style += ".xdebug-higlight-info-type { color: #95308f;font-weight: bold; }";
    style += ".xdebug-higlight-info-ctype { color: #0b24a5;font-weight: bold; }";    
    style += ".xdebug-highlight { position: absolute;background: #78bcf9; opacity: 0.4; };";
    $('head').append('<style type="text/css">' + style + '</style>');
    style = ".xdebug-highlight-info { position: absolute;background: #fff;z-index: 9999;border-radius: 3px;padding: 6px;font-size: 14px;font-family: monospace;color: #7d7d7d; box-shadow: 0px 0px 5px #9e9e9e; };";            
    $('head').append('<style type="text/css">' + style + '</style>');
}
XDebug.prototype.getTouch = function (e) {
    //Debug
    //this.contents["debugc"].html("");
    //this.contents["debugc"].append("<div>" + JSON.safeStringify(e.clientY)+"</div>");

    //if(e.touches == undefined && e.originalEvent.touches == undefined)
    //return e;
    if (e.touches == undefined)
        return e.originalEvent.touches;
    return e.touches;
}
XDebug.prototype.CreateDebug = function () {
    $(document).bind('mousemove touchmove', function (e) {
        if (XDebug.instance.getTouch(e) != null && XDebug.instance.getTouch(e).length > 0) {
            XDebug.mouseX = XDebug.instance.getTouch(e)[0].pageX;
            XDebug.mouseY = XDebug.instance.getTouch(e)[0].pageY;
            XDebug.mouseIsTouch = true;
        } else {
            XDebug.mouseX = e.pageX;
            XDebug.mouseY = e.pageY;
            XDebug.mouseIsTouch = false;
        }

        if (XDebug.instance.isOpen && $(".xdebug-tab-dvctab").hasClass("selected")) {
            XDebug.instance.ReloadDeviceTab();
        }

        if (XDebug.instance.resizing) {
            var h = XDebug.instance.saveH + (XDebug.instance.saveY - XDebug.mouseY);
            if (h < 100) h = 100; if(h > $(window).outerHeight(true)) h = $(window).outerHeight(true);
            console.log(h, $(window).outerHeight(true));
            XDebug.instance.panel.css("height", h);
            XDebug.instance.Resize();
        }
    });
    $(document).bind('mouseup touchend', function (e) {
        if (XDebug.instance.resizing) {
            XDebug.instance.resizing = false;
        }
    });
    $(window).on("resize", function () {
        XDebug.instance.Resize();
    });

    this.CreateStyle();

    var panel = $("<div></div>");
    panel.addClass("xdebug-panel xdebug-no-dom-render");
    this.panel = panel;

    var tabpanel = $("<div></div>");
    tabpanel.addClass("xdebug-tabs");
    tabpanel.css("cursor", "n-resize");
    tabpanel.data("api", this);
    tabpanel.on("mousedown touchstart", function (e) {
        var api = $(this).data("api");
        if (api.getTouch(e) != null && api.getTouch(e).length > 0) {
            api.saveY = api.getTouch(e)[0].pageY;
        } else {
            api.saveY = XDebug.mouseY;
        }
        api.saveH = api.panel.outerHeight();
        api.resizing = true;
        e.preventDefault();
    });
    this.tabpanel = tabpanel;
    panel.append(tabpanel);

    var tabpanelin = $("<div></div>");
    this.tabpanelin = tabpanelin;
    tabpanel.append(tabpanelin);

    var taboperations = $("<div></div>");
    taboperations.addClass("right");
    var closeButt = $("<a href=#>X</a>");
    closeButt.data("api", this);
    closeButt.on("click touch touchstart", function () { $(this).data("api").Toggle() });
    taboperations.append(closeButt);
    tabpanel.append(taboperations);

    var content = $("<div></div>");
    content.addClass("xdebug-content");
    panel.append(content);
    this.content = content;

    this.ReloadTabs();

    for (var key in this.tabs) {
        var item = this.tabs[key];
        if (item.contentType == "log") {
            this.LoadDebugTab();
        } else if (item.contentType == "dom") {
            this.LoadDomTab();
        } else if (item.contentType == "dvc") {
            this.LoadDeviceTab();
        } else {
            this.LoadEmptyTab(item.content);
        }
    }

    $("body").append(panel);
    this.Toggle();
    this.Resize();

    if (this.onload != null) this.onload();
}

XDebug.prototype.LoadDeviceTab = function () {
    var debugTab = $("<div></div>");
    debugTab.addClass("xdebug-content-content");
    debugTab.hide();

    var itemtable = $("<div></div>");
    itemtable.addClass("xdebug-item-table");

    this.DeviceItems = [
        { name: "Resolution", value: function () { return (window.screen.width * window.devicePixelRatio) + "x" + (window.screen.height * window.devicePixelRatio); } },
        { name: "Window resolution", value: function () { return $(window).width() + "x" + $(window).height(); } },
        { name: "Mouse position", value: function () { return (XDebug.mouseX == undefined ? "?" : XDebug.mouseX) + "x" + (XDebug.mouseY == undefined ? "?" : XDebug.mouseY); } },
        { name: "Device pixel ratio", value: function () { return window.devicePixelRatio; } },
        { name: "Is touch", value: function () { return XDebug.mouseIsTouch ? "true" : "false"; } },
        { name: "User agent", value: function () { return navigator.userAgent; } },
        { name: "Cookie enabled", value: function () { return navigator.cookieEnabled ? "true" : "false"; } },
        { name: "Language", value: function () { return navigator.language; } },
        { name: "Vendor", value: function () { return navigator.vendor; } },
    ];

    debugTab.append(itemtable);

    this.content.append(debugTab);
    this.contents["dvctab"] = debugTab;

    this.ReloadDeviceTab();
}

XDebug.prototype.ReloadDeviceTab = function () {
    var cont = this.contents["dvctab"].find(".xdebug-item-table");
    if (!cont.hasClass("xdebug-initialized")) {
        cont.html("");
        cont.addClass("xdebug-initialized");
    }

    for (var key in this.DeviceItems) {
        var item = this.DeviceItems[key];

        if (item.content == undefined) {
            var resolution = $("<div></div>");
            resolution.addClass("xdebug-item-line");
            var label = $("<div></div>");
            label.addClass("xdebug-item-line-label");
            label.html(item.name);
            resolution.append(label);
            var value = $("<div></div>");
            value.addClass("xdebug-item-line-value");
            value.html(item.value());
            resolution.append(value);

            item.content = value;
        } else {
            item.content.html(item.value());
        }

        cont.append(resolution);
    }
}

XDebug.prototype.LoadEmptyTab = function (code) {
    var debugTab = $("<div></div>");
    debugTab.addClass("xdebug-content-content");
    debugTab.hide();
    this.content.append(debugTab);
    this.contents[code] = debugTab;
}

XDebug.prototype.Toggle = function () {
    this.open = !this.open;
    if (this.open) {
        this.panel.show();
        $("body").css("padding-bottom", this.panel.outerHeight());
    } else {
        this.panel.hide();
        $("body").css("padding-bottom", 0);
    }
}

XDebug.prototype.ReloadTabs = function () {
    this.tabpanelin.html();

    for (var key in this.tabs) {
        var item = this.tabs[key];
        var tab = $("<div></div>");
        tab.text(item.title);
        tab.addClass("xdebug-tabs-tab");
        tab.data("api", this);
        tab.addClass("xdebug-tab-" + item.content);
        tab.data("key", key);
        tab.on("mousedown", function (e) { e.stopPropagation(); });
        tab.on("click touch touchstart", function (e) {
            if ($(this).hasClass("selected")) return;

            XDebug.instance.tabpanelin.find(".xdebug-tabs-tab").removeClass("selected");
            $(this).addClass("selected");

            XDebug.instance.contentsShow.hide();
            var c = XDebug.instance.tabs[$(this).data("key")].content;
            var d = XDebug.instance.contents[c];
            d.show();
            XDebug.instance.contentsShow = d;

            e.preventDefault();
            e.stopPropagation();

            XDebug.instance.Resize();
        });
        this.tabpanelin.append(tab);
    }
    $(this.tabpanelin.find(":first-child")).addClass("selected");
}

function appendTree(data, elem, name, i) {
    if (i == undefined) i = 0;
    var pad = "padding-left:15px;"
    if (i == 0) pad = "";

    if (typeof data == "object") {
        var li = $("<div style='color: #5db95d;" + pad + "'></div>");
        var ao = $("<div></div>");
        if (name != undefined) {
            ao.html(name + ":" + JSON.stringify(data));
        } else {
            ao.html(JSON.stringify(data));
        }
        li.append(ao);
        for (var key in data) {
            var item = data[key];
            appendTree(item, li, key, i + 1);
        }
        elem.append(li);
    } else {
        var li = $("<div style='color: #5db95d;" + pad + "'></div>");
        if (name != undefined) {
            if (typeof data == "string") {
                li.html(name + ": \"" + data + "\"");
            } else {
                li.html(name + ": " + data);
            }
        } else {
            li.html(data);
        }
        elem.append(li);
    }
}

XDebug.prototype.Log = function (message, type, obj) {
    var dt = new Date();
    if (type == undefined) type = "log";
    var log = $("<div></div>");
    log.addClass("xdebug-log-log xdebug-log-type-" + type);
    var tm = $("<div></div>");
    tm.addClass("right");
    var h = dt.getHours(); if (parseInt(h) < 10) h = "0" + h;
    var m = dt.getMinutes(); if (parseInt(m) < 10) m = "0" + m;
    var s = dt.getSeconds(); if (parseInt(s) < 10) s = "0" + s;
    tm.html(h + ":" + m + ":" + s);
    log.append(tm);
    var msg = $("<div></div>");
    msg.html(message);
    msg.addClass("message");
    log.append(msg);

    if (obj != undefined && obj.length != 0) {
        appendTree(obj, log);
    }
    var objtree = $("<div></div>");
    var us = objtree;


    $(this.contents["dbtab"].find(".xdebug-log")).append(log);
    $(".xdebug-content-debug-log").scrollTop($(".xdebug-content-debug-log")[0].scrollHeight);
}

XDebug.prototype.LoadDomTab = function () {
    var debugTab = $("<div></div>");
    debugTab.addClass("xdebug-dom-content");

    var left = $("<div></div>");
    left.addClass("xdebug-left-side");

    var domconent = $("<div id=domconent></div>");
    left.append(domconent);

    var right = $("<div></div>");
    right.addClass("xdebug-right-side");

    debugTab.append(left);
    debugTab.append(right);

    var tabs = $("<div></div>");
    tabs.addClass("xdebug-tabs");

    var tabStyles = $("<div></div>");
    tabStyles.addClass("xdebug-tabs-tab selected");
    tabStyles.data("api", this);
    tabStyles.text("Styles")
    tabs.append(tabStyles);

    /*var tabComputed = $("<div></div>");
    tabComputed.addClass("xdebug-tabs-tab");
    tabComputed.data("api", this);
    tabComputed.text("Computed")
    tabs.append(tabComputed);*/

    right.append(tabs);

    var styleContent = $("<div id='xdebug-style-bar'></div>");
    styleContent.addClass("xdebug-content-panel");
    var expandStyleBar = $("<div></div>");
    expandStyleBar.addClass("xdebug-expand-bar");
    styleContent.append(expandStyleBar);
    var inputFilter = $("<input type=text />");
    inputFilter.prop("placeholder", "Filter");
    expandStyleBar.append(inputFilter);
    var styleContentPanel = $("<div></div>");
    styleContentPanel.addClass("xdebug-dom-style-content");
    styleContent.append(styleContentPanel);

    right.append(styleContent);

    debugTab.hide();
    this.content.append(debugTab);
    this.contents["domtab"] = debugTab;

    var self = this;
    setTimeout(function () { self.ReloadDom(); }, 1);
}

XDebug.prototype.Clear = function () {
    $(".xdebug-log").html("");
}

XDebug.prototype.LoadDebugTab = function () {
    var debugTab = $("<div></div>");
    debugTab.addClass("xdebug-debug-content");

    var tabs = $("<div></div>");
    tabs.addClass("xdebug-tabs");
    var tabClear = $("<div></div>");
    tabClear.text("Clear");
    tabClear.addClass("xdebug-tabs-tab");
    tabClear.data("api", this);
    tabClear.on("click touch touchstart", function () {
        $(this).data("api").Clear();
    });
    tabs.append(tabClear);

    var filter = $("<div></div>");
    filter.addClass("xdebug-tabs-input");
    var fInput = $("<input/>");
    fInput.attr("placeholder", "Filter");
    filter.append(fInput);
    tabs.append(filter);
    filter.data("api", this);
    fInput.on("keyup", function () {
        var search = $(this).val();
        if (search == "") {
            $(".xdebug-log > div").show();
        } else {
            $(".xdebug-log > div").each(function () {
                var msg = $($(this).find(".message")).html();
                console.log(msg);
                if (msg.indexOf(search) !== -1) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
    });

    debugTab.append(tabs);

    var debugContentLog = $("<div></div>");
    debugContentLog.addClass("xdebug-content-debug-log");
    debugTab.append(debugContentLog);
    var debugLog = $("<div></div>");
    debugLog.addClass("xdebug-log");
    debugContentLog.append(debugLog);

    this.content.append(debugTab);
    this.contents["dbtab"] = debugTab;
    this.contentsShow = debugTab;
}

XDebug.prototype.Resize = function () {
    if (this.open) {
        $("body").css("padding-bottom", this.panel.outerHeight());
        $(".xdebug-content-debug-log").css("max-height", $(".xdebug-panel").outerHeight() - $(".xdebug-tabs").outerHeight() * 2 - 2);
        $(".xdebug-content-debug-log").scrollTop($(".xdebug-content-debug-log")[0].scrollHeight);

        $(".xdebug-content-content").css("max-height", $(".xdebug-panel").outerHeight() - $(".xdebug-tabs").outerHeight() - 2);

        this.ReloadDeviceTab();
    }
}

XDebug.prototype.ReloadDom = function () {
    var div = $("<div></div>");
    var name = $("<div class='xdebug-tag-name xdebug-tag-open'></div>");
    name.text("<html>");
    var inside = $("<div class='xdebug-tag-inside'></div>");
    var name2 = $("<div class='xdebug-tag-name xdebug-tag-close'></div>");
    name2.text("</html>");
    div.append(name);
    div.append(inside);
    div.append(name2);
    $("#domconent").html("");
    $("#domconent").append(div);
    this._loadDoom($("html"), inside, 0);
}

XDebug.prototype._loadDoom = function (element, outside, pos) {
    var self = this;
    var oneline = true;
    var lines = 0;
    var nodes = $($(element)[0].childNodes);
    var latestText = null;
    nodes.each(function () {
        if ($(this) == null || $(this).hasClass("xdebug-no-dom-render")) return;

        var div = $("<div style='margin-left: -" + (pos * 15) + "px;'></div>");
        div.addClass("xdebug-tag-holder");
        var type = "unkown";
        if ($(this)[0].nodeType == 1) {
            type = $(this).prop('nodeName').toLowerCase();
        } else if ($(this)[0].nodeType == 3) {
            type = "text";
        }

        if (type == "text") {
            var posi = pos + 1;
            if (nodes.length == 1) posi -= 1;
            var text = $("<div class='xdebug-tag-text' style='padding-left:" + (posi * 15) + "px;'></div>");
            latestText = text;
            var val = $(this)[0].nodeValue;
            if (val.trim() != "") {
                lines++;
                if (val.indexOf('\n') !== -1) {
                    oneline = false;
                    text.html("\"" + val + "\"");
                }
                else {
                    text.html(val);
                }
                div.append(text);
                div.addClass("xdebug-text");
            }
        } else {
            oneline = false;
            lines++;

            var name = $("<div class='xdebug-tag-name xdebug-tag-open' style='padding-left:" + ((pos + 1) * 15) + "px;'></div>");
            var tagOpen = "&#x3C;" + type + "<span class=xdebug-tag-attributes>";
            $.each(this.attributes, function () {
                if (this.specified) {
                    tagOpen += " <span class='xdebug-tag-attribute-nameval'><span class='xdebug-tag-attribute-name'>" + this.name + "</span>=\"<span class='xdebug-tag-attribute-value'>" + this.value + "</span>\"</span>";
                }
            });
            tagOpen += "</span>";
            tagOpen += "&#x3E;";
            name.html(tagOpen);
            var inside = $("<div class='xdebug-tag-inside' style='padding-left:" + ((pos + 1) * 15) + "px;'></div>");
            var name2 = $("<div class='xdebug-tag-name xdebug-tag-close' style='padding-left:" + ((pos + 1) * 15) + "px;'></div>");
            name2.html("&#x3C;/" + type + "&#x3E;");
            div.append(name);
            div.append(inside);
            div.append(name2);

            name.data("element", $(this));
            name.on("click touch touchstart", function () {
                XDebug.instance.selectDomElement($(this).data("element"));
            });            

            var opener = $("<div></div>");
            opener.html("<div></div>");
            opener.addClass("xdebug-opener");
            opener.data("div", div);
            opener.on("click", function () {
                $(this).data("div").toggleClass("xdebug-open");
            });
            name.prepend(opener);

            name2.data("element", $(this));
            name2.on("click touch touchstart", function () {
                XDebug.instance.selectDomElement($(this).data("element"));
            });            

            var state = self._loadDoom($(this), inside, pos + 1);
            if (state === true) {
                div.addClass("xdebug-tag-oneline");
                inside.css("padding-left", "0px");
                name2.css("padding-left", "0px");                
                div.on("click touch touchstart", function () { XDebug.instance.selectDomElement($(this).data("element")); });
            } else if (state === -1) {
                div.addClass("xdebug-tag-oneline");
                div.on("click touch touchstart", function () { XDebug.instance.selectDomElement($(this).data("element")) });
            }            
        }

        div.data("element", $(this));
        div.on("mouseover", function(e){
            XDebug.instance.highlightDom($(this).data("element"));
            e.stopPropagation();
        });
        div.on("mouseout", function(e){
            XDebug.instance.removeHighlightDom();
            e.stopPropagation();
        });

        outside.append(div);
    });

    if (oneline && lines == 1 && latestText != null) { latestText.css("padding-left", "0px"); latestText.parent().css("margin-left", "0px"); }
    return lines == 0 ? -1 : (oneline && lines < 2);
}

XDebug.prototype.highlightDom = function(element){
    var highlight = $("<div></div>");
    highlight.addClass("xdebug-highlight");

    if(element[0].nodeType == 3){
        var range = document.createRange();
        range.selectNode(element[0]);
        var rec = range.getBoundingClientRect();

        elementOffetTop = rec.top;
        elementOffetLeft = rec.left; 
        outerWidth = rec.width;
        outerHeight = rec.height;
    }else{
        if(!element.is(":visible")){
            return;
        }
        elementOffetTop = element.offset().top;
        elementOffetLeft = element.offset().left;
        outerWidth = element.outerWidth();
        outerHeight = element.outerHeight();
        elementMargin = [element.css("margin-left"), element.css("margin-right"), element.css("margin-top"), element.css("margin-bottom")];
    }

    highlight.css("top", elementOffetTop);
    highlight.css("left", elementOffetLeft);

    var documentHeight = $(document).height() - XDebug.instance.panel.height();

    var w = outerWidth; if(w + elementOffetLeft > $(document).width()) { w = $(document).width() - elementOffetLeft; }
    var h = outerHeight; if(h + elementOffetTop > documentHeight) { h = documentHeight - elementOffetTop; }    
    highlight.css("width", w);
    highlight.css("height", h);
    $("body").append(highlight);

    var info = $("<div></div>");
    info.addClass("xdebug-highlight-info");    
    info.css("top", 0);
    info.css("left", 0);

    var tex = "";
    if (element[0].nodeType == 1) {
        tex = "<span class=xdebug-higlight-info-type>"+element.prop('nodeName').toLowerCase()+"</span>";
    }else if(element[0].nodeType == 3){
        tex = "<span class=xdebug-higlight-info-type>#text</span>";        
    }
    var classes = $(element).attr('class'); if(classes == undefined) classes = "";
    if(element.attr("id") != undefined){
        tex+="<span class='xdebug-higlight-info-ctype'>#"+element.attr("id")+"</span>";
    }
    if(classes != "") {
        tex+="<span class='xdebug-higlight-info-ctype'>."+(classes.replace(" ", "."))+"</span>";
    }

    info.html(tex + " " + outerWidth + "x" + outerHeight);
    $("body").append(info);
    
    var t = elementOffetTop + h + 1; if (t > $(window).scrollTop() + documentHeight) { t += ($(window).scrollTop() + documentHeight - t) - info.outerHeight() - 1; }
    var l = elementOffetLeft; if (l > $(window).scrollLeft() + $(document).width()) { l -= info.outerWidth() + elementOffetLeft; }    
    info.css("top", t);
    info.css("left", l);

    this.highlightedDom = [highlight, info];
}

XDebug.prototype.removeHighlightDom = function(){
    if(this.highlightedDom != null) {
        for(var key in this.highlightedDom) {
            this.highlightedDom[key].remove();
        }
    }
}

XDebug.prototype.selectDomElement = function (element) {
    $("#xdebug-style-bar .xdebug-dom-style-content").html("");
    var style = this.getElementStyle(element);

    for (var key in style) {
        var stl = style[key];

        var elementStyle = $("<div></div>");
        elementStyle.addClass("xdebug-element-style-container");
        elementStyle.append("<div class=xdebug-text-info>" + key + " { </div>");
        var elstyeditor = $("<div></div>");
        elstyeditor.addClass("xdebug-element-style-editor");
        elementStyle.append(elstyeditor);

        for (var key2 in stl) {
            var item = stl[key2];

            var sted = $("<div></div>");
            sted.addClass("xdebug-dom-style-prop");

            var check = $("<input type=checkbox checked=checked>");
            sted.append(check);
            var name = $("<div class=xdebug-dom-style-prop-name></div>");
            name.html("<span>" + key2 + "</span>: ");
            sted.append(name);
            var value = $("<div class=xdebug-dom-style-prop-value></div>");
            value.html("<span>" + item + "</span>;");
            sted.append(value);

            elstyeditor.append(sted);
        }

        elementStyle.append("<div class=xdebug-text-info>}</div>");
        $("#xdebug-style-bar .xdebug-dom-style-content").append(elementStyle);
    }

}

XDebug.prototype.getElementStyle = function (element) {
    window["$1"] = element;

    var o = {};
    o["element.style"] = this.css2json(element.attr('style'));

    try {
        var sheets = document.styleSheets

        for (var i in sheets) {
            var rules = sheets[i].rules || sheets[i].cssRules;
            for (var r in rules) {
                if (element.is(rules[r].selectorText)) {
                    o[rules[r].selectorText] = this.css2json(rules[r].style);
                }
            }
        }
    } catch (exception) {

    }

    return o;
}

XDebug.prototype.css2json = function (css) {
    var s = {};
    if (!css) return s;
    if (css instanceof CSSStyleDeclaration) {
        for (var i in css) {
            if ((css[i]).toLowerCase && (css[css[i]]) != undefined && (css[css[i]]).trim() != "") {
                s[(css[i]).toLowerCase()] = (css[css[i]]);
            }
        }
    } else if (typeof css == "string") {
        css = css.split(";");
        for (var i in css) {
            var l = css[i].split(":");
            if (l.length > 1)
                s[l[0].toLowerCase().trim()] = (l[1]).trim();
        }
    }
    return s;
}

JSON.safeStringify = function (obj, indent) {
    if (indent == undefined) indent = 2;
    var cache = [];
    var retVal = JSON.stringify(
        obj,
        function (key, value) { return (typeof value === "object" && value !== null ? (cache.indexOf(value) !== -1 ? undefined : cache.push(value) && value) : value) },
        indent
    );
    cache = null;
    return retVal;
};
