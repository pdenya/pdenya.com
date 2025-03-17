---
author: Paul
category:
  - css
date: "2013-10-02T15:00:57+00:00"
guid: https://pdenya.com/?p=350
title: Custom cursors, relative paths, and internet explorer
url: /2013/10/02/custom-cursors-relative-paths-and-internet-explorer/

---
Custom cursors in an external CSS file will 404 in Internet Explorer unless your using fully qualified urls. This effects IE6, IE7, IE8, IE9 and IE10.

## What is happening

Internet Explorer for some ungodly reason treats relative font paths as relative to the page, not relative to the CSS File.

## My Fix

You can fully qualify the URL for all clients but I work offline often so I'd rather have Chrome referencing my dev server rather than the production CDN. Normally I'd turn to CSS hacks here but there's nothing easy to include inline for IE10. I ended up using the `ie` class which is added via javascript onReady because IE10 doesn't support conditional comments.

```css
.ie .my_cursor {
    cursor: url(http://fully_qualified.url/path/to/cursor), default;
}

.my_cursor {
    cursor: url(../to/cursor), default;
}

```

Crucially, to avoid 404s, the `my_cursor` class is added to elements after adding the `ie` class to `<body>`. Checking for IE server side was a strong option but it's easier to not modify the layout cache to be browser specific.
