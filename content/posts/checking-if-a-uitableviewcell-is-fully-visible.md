---
author: Paul
category:
  - objective-c
date: "2013-08-07T15:00:38+00:00"
guid: https://pdenya.com/?p=162
title: Checking if a UITableViewCell is fully visible
url: /2013/08/07/checking-if-a-uitableviewcell-is-fully-visible/

---
Sometime you need to know if a UITableViewCell is completely visible and for those times there's this handy UITableViewCell category.

```objc
//Place in UITableViewCell Category
- (BOOL) isCompletelyVisible {
    // For parents category see pdenya.com/g/uiview_parents
    UITableView *tableview = (UITableView *)[self parents:[UITableView class]];
    CGRect rect = [tableview rectForRowAtIndexPath:[tableview indexPathForCell:self]];
    rect = [tableview convertRect:rect toView:tableview.superview];
    BOOL completelyVisible = CGRectContainsRect(tableview.frame, rect);

    return completelyVisible;
}

```

I'd like to mention that you can skip this check entirely if your goal is to make sure a cell is completely visible. With UITableViewScrollPositionNone scrollToRowAtIndexPath:atScrollPosition:animated: doesn't scroll at all if the cell is totally visible and in other cases it scrolls as little as possible which is usually the ideal behavior.

```objc
[self.tableview scrollToRowAtIndexPath:[self.tableview indexPathForCell:cell] atScrollPosition:UITableViewScrollPositionNone animated:YES];

```
