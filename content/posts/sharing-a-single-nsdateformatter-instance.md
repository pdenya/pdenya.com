---
author: Paul
category:
  - objective-c
date: "2013-08-15T15:00:05+00:00"
guid: https://pdenya.com/?p=277
title: Sharing a single NSDateFormatter instance
url: /2013/08/15/sharing-a-single-nsdateformatter-instance/

---
Formatting dates in cellForRowAtIndexPath or another method that gets called very often will make an app noticeably slower if an NSDateFormatter needs to be initialized on every call. Storing the NSDateFormatter in a property or making it static are both fine options but if it's around anyway it might as well be used by the rest of the app.

## NSDateFormatter Instance Category

```objc
//NSDateFormatter Category
+ (NSDateFormatter *)instance {
    static dispatch_once_t onceMark;
    static NSDateFormatter *formatter = nil;

    dispatch_once(&onceMark, ^{
        formatter = [[NSDateFormatter alloc] init];
    });

    return formatter;
}

//Usage
NSDateFormatter *dateformatter = [NSDateFormatter instance];

```

## Drawbacks

If there are multiple date formats in use the date format needs to be set before each use. Not a major drawback but it can get annoying.
