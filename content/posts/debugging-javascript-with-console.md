---
author: Paul
category:
  - javascript
date: "2013-07-09T19:24:29+00:00"
guid: https://pdenya.com/?p=1
title: Debugging Javascript with Console
url: /2013/07/09/hello-world/

---
A quick review.

### Console.log()

```js

//how to print a log statement
console.log('That thing you expected to happen is now happening!');

//how to break production sites in internet explorer
console.log('anything');

//how to log safer
function l(str){if(window.console&&console.log){console.log(str);}}
l('I can forget this in my code base without breaking anything!');

```

### Console.trace()

```js

//how to figure out what's calling what
console.trace();

//console.trace example:
function a() { console.trace(); }
function b() { a(); }
function c() { b(); }
function d() { b(); }

if (Math.random() < 0.5) {
    c();
}
else {
    d();
}

```

If you copy and paste that console.trace example into the Chrome Console you'll get a full stack trace like this one:

![Console.Trace in script](/wp-content/uploads/2013/07/Screen-Shot-2013-07-09-at-4.03.03-PM.png)

While that's incredibly useful it gets a little better for daily use. Since you'll almost always be using console.trace in the context of functions defined in a file somewhere (rather than on the spot in the console) you'll get clickable line numbers along with your stack trace output:

![Console.Trace in console](/wp-content/uploads/2013/07/Screen-Shot-2013-07-09-at-4.04.57-PM.png)
