---
author: Paul
category:
  - devtools
date: "2013-08-03T17:36:09+00:00"
guid: https://pdenya.com/?p=193
title: Hiding the WP Admin Bar
url: /2013/08/03/hiding-the-wp-admin-bar/

---
There's a few plugins for hiding the WordPress admin bar that shows up on top of your site when you're logged in but it seems like overkill.

If you don't care about preventing it from loading you can drop this in your stylesheet at wp-admin/themes.php?page=editcss to hide it.

```css
html {
    margin-top: 0!important;
}

#wpadminbar {
    display: none;
}

```
