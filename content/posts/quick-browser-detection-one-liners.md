---
author: Paul
category:
  - javascript
date: "2013-08-09T15:00:03+00:00"
guid: https://pdenya.com/?p=211
title: Quick Browser Detection One Liners
url: /2013/08/09/quick-browser-detection-one-liners/

---
```js
// You can expand this out in any line below
// but it makes things much more readable
var ua = navigator.userAgent.toString().toLowerCase();

//Browsers
var IE6 = false /*@cc_on || @_jscript_version < 5.7 @*/
var IE7 = (document.all && !window.opera && window.XMLHttpRequest && ua.indexOf('trident/4.0') == -1) ? true : false;
var IE8 = (ua.indexOf('trident/4.0') != -1);
var IE9 = ua.indexOf("trident/5")>-1;
var IE10 = ua.indexOf("trident/6")>-1;
var SAFARI = (ua.indexOf("safari") != -1) && (ua.indexOf("chrome") == -1);
var FIREFOX = (ua.indexOf("firefox") != -1);
var CHROME = (ua.indexOf("chrome") != -1);

//Platforms
var MAC = (ua.indexOf("mac")!=-1) ? true: false;
var WINDOWS = (navigator.appVersion.indexOf("Win")!=-1) ? true : false;
var LINUX = (navigator.appVersion.indexOf("Linux")!=-1) ? true : false;
var UNIX = (navigator.appVersion.indexOf("X11")!=-1) ? true : false;
var IOS = ((ua.indexOf("iphone")!=-1) || (ua.indexOf("ipod")!=-1) || (ua.indexOf("ipad")!=-1)) ? true : false;
var ANDROID = ua.indexOf("android")!=-1) ? true: false;
var BLACKBERRY = (ua.indexOf("blackberry")!=-1) ? true: false;

//mobile browsers
var OPERA_MINI = (ua.indexOf("opera mini")!=-1) ? true: false;

```
