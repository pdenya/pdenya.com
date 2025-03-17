---
author: Paul
category:
  - objective-c
date: "2013-07-11T05:00:05+00:00"
guid: https://pdenya.com/?p=30
title: Getting a particular superview in Objective-C
url: /2013/07/10/getting-a-particular-superview-in-objective-c/

---
If you have, for example, a child view of a UITableViewCell and you need to get the UITableViewCell in question you can quickly do something like:

```objc
UITableViewCell *cell = (UITableViewCell *)the_view.superview.superview;

```

It works but this code is fragile because it requires that the view heirarchy not change (also things like this usually point to a code organization issue but hey, i'm not here to judge). If we want to be able to add a scrollview in between without editing this method we'll have to take a different approach.

```objc
// Add a category on UIView
-(UIView *)parents:(Class)class_name {
    UIView *s = self.superview;
    while (![s isKindOfClass:class_name]) {
        if (s.superview) {
            s = s.superview;
        } else {
            return nil;
        }
    }

    return s;
}

// Call the category on the_view and pass it the class that we're looking for.  It'll return the first superview that's that kind of class.
UITableViewCell *cell = (UITableViewCell *)[the_view parents:[UITableViewCell class]];

```

I named the category after jQuery's parents method ( [http://api.jquery.com/parents/](http://api.jquery.com/parents/)) but call it what you want.
