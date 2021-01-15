# DebugTools
Easy debug tools for every page


Just type this code to your browser or add it to your bookmarks!

```
javascript:var jqueryScript=document.createElement('script');jqueryScript.setAttribute("type","text/javascript");jqueryScript.setAttribute("src", "https://cdn.jsdelivr.net/gh/Natsu13/DebugTools/xdebug.js");jqueryScript.onload = function(){window["xdebug"] = new XDebug();xdebug.Start();};  document.getElementsByTagName('head')[0].appendChild(jqueryScript);
```
