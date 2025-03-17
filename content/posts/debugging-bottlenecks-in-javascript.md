---
author: Paul
category:
  - javascript
date: "2013-10-14T15:00:29+00:00"
guid: https://pdenya.com/?p=365
title: Debugging bottlenecks in Javascript
url: /2013/10/14/debugging-bottlenecks-in-javascript/

---
For most bottleneck debugging Chrome Inspector's profiles view in invaluable until a bottleneck is identified and then it becomes a bit cumbersome. I like to have a quicker overview of the piece i'm working on optimizing.

I use this small and easy timer snippet.

```js
var timer = {
    start: function() {
        timer.t = new Date().getTime();
    },

    log: function(str) {
        str = str ? str : 'Execution time: ';
        console.log(str + ((new Date().getTime()) - timer.t));
    }
};

//Example
(function() {
    //...

    timer.start();

    //...

    timer.log('first landmark passed: ');

    //...

    timer.log('second landmark passed: ');

    //...
})();

```
