---
author: Paul
category:
  - css
  - javascript
date: "2015-05-04T18:55:37+00:00"
guid: https://pdenya.com/?p=434
title: Remove all images from JQuery UI CSS
url: /2015/05/04/remove-images-jquery-ui-css/

---
```css
/* remove all default background images from jquery ui */
.ui-icon,.ui-widget-content .ui-icon,
.ui-state-active .ui-icon,
.ui-state-active,.ui-widget-content .ui-state-active,.ui-widget-header .ui-state-active,
.ui-state-default .ui-icon,
.ui-state-default,.ui-widget-content .ui-state-default,.ui-widget-header .ui-state-default,
.ui-state-error .ui-icon,.ui-state-error-text .ui-icon,
.ui-state-error,.ui-widget-content .ui-state-error,.ui-widget-header .ui-state-error,
.ui-state-highlight .ui-icon,
.ui-state-highlight,.ui-widget-content .ui-state-highlight,.ui-widget-header .ui-state-highlight,
.ui-state-hover .ui-icon,.ui-state-focus .ui-icon,
.ui-state-hover,.ui-widget-content .ui-state-hover,.ui-widget-header .ui-state-hover,.ui-state-focus,.ui-widget-content .ui-state-focus,.ui-widget-header .ui-state-focus,
.ui-widget-content,
.ui-widget-header,
.ui-widget-header .ui-icon,
.ui-widget-overlay,
.ui-widget-shadow {
    background-image: none;
}

```
