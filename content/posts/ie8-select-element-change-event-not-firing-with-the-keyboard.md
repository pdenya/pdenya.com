---
author: Paul
category:
  - javascript
date: "2013-07-11T14:00:45+00:00"
guid: https://pdenya.com/?p=23
title: IE8 select element change event not firing with the keyboard
url: /2013/07/11/ie8-select-element-change-event-not-firing-with-the-keyboard/

---
Change events on select elements don't fire in IE8 when the user confirms the selection with the enter key until the user clicks elsewhere. If your users are waiting on something in particular to happen after updating the select this is a bit of a problem.

Here's my solution:

```js

// jQuery syntax for ease of reading
var the_select = $("#my_select");

// this works great for most browsers
the_select.change(function() {
    console.log('changed');
});

// if IE8
if ($.browser.msie && parseInt($.browser.version, 10) <= 8) {

    // get the keypress event
    the_select.keypress(function(e) {

        // if the user pushed enter
        if(e.keyCode === $.ui.keyCode.ENTER) {

            // manually trigger the change handler
            $(this).change()
                    // blur afterwards isn't ideal but
                    // it doesn't work correctly otherwise
                    .blur();
        }
    });
}

```
