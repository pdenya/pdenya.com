---
author: Paul
category:
  - objective-c
date: "2013-08-06T17:10:57+00:00"
guid: https://pdenya.com/?p=163
title: Tap anywhere else to cancel in Objective C
url: /2013/08/06/tap-anywhere-else-to-cancel-in-objective-c/

---
Whenever you have a modal element that outside touches should cancel a few things need to happen:

- Touches inside the modal element should behave normally
- Outside touches should not trigger touch events on tappable elements
- Outside touches should trigger a handler to close the modal

In my case I was swiping a UITableViewCell and revealing a controls view that should close if any other UITableViewCell is tapped.

## hitTest:withEvent - The easiest method

Touch events bubble down from the root view rather than up from the target view which makes this a bit easier. On whichever view needs to capture the touch events, we need to override hitTest:withEvent: to return nil and call a function whenever a modal is open and a view other than the modal is tapped. I overrode this method in my UITableView's superview.

A naive implementation looks like this:

```objc
// NOTE: skip to the next code example for full implementation
-(UIView*) hitTest:(CGPoint)point withEvent:(UIEvent*)event {
    UIView *hit_view = [super hitTest:point withEvent:event];

    //only perform these checks when a modal is actually open
    BOOL is_modal_open = (BOOL)self.currentlyRevealedCell;
    if (is_modal_open) {

        // For parents category see pdenya.com/g/uiview_parents
        if (!hit_view || ![hit_view parents:[RevealedView class]]) {

            //whatever method you need to call when something outside the modal is touched
            [[self currentlyRevealedCell] snapBack];

            //return nil so we don't pass the event through
            hit_view = nil;
        }
    }

    return hit_view;
}

```

## Gotcha

The only problem with this method is that hitTest:withEvent: is called 3 times per tap so our flow looks something like:

1. Handle first tap correctly
1. See that modal is no longer open and pass 2nd and 3rd tap through

To correct this we need to make sure is\_modal\_open continues to return YES until after that 3rd hitTest gets called and make sure the handler only gets triggered once. Full method below.

```objc
-(UIView*) hitTest:(CGPoint)point withEvent:(UIEvent*)event {
    UIView *hit_view = [super hitTest:point withEvent:event];

    //only perform these checks when a modal is actually open
    BOOL is_modal_open = (self.currentlyRevealedCell || self.isSnappingBack);
    if (is_modal_open) {

        // parents inlined below for speed and clarity
        if (!hit_view || ![hit_view parents:[RevealedView class]]) {

            // check to make sure this function wasn't called already
            if (self.currentlyRevealedCell) {

                //whatever method you need to call when something outside the modal is touched
                [[self currentlyRevealedCell] snapBack];
            }

            //return nil so we don't pass the event through
            hit_view = nil;
        }
    }

    return hit_view;
}

// Returns a superview of a particular class or nil if no match is found
// Available at /g/uiview_parents but inlined for clarity
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

```
