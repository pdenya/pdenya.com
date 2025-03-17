---
author: Paul
category:
  - objective-c
date: "2013-07-30T18:43:38+00:00"
guid: https://pdenya.com/?p=150
title: Custom Relative Time with Date Components
url: /2013/07/30/custom-relative-time-with-date-components/

---
Here's an if chain that figures out the relative time. The current version suites my needs but it's easy to modify.

```objc
//print date to countdown_label
NSCalendar *calendar = [[[NSCalendar alloc] initWithCalendarIdentifier:NSGregorianCalendar] autorelease];
NSDate *fromDate = [NSDate date];
NSDate *toDate = [user filtered_until];
NSDateComponents *components = [calendar components:NSDayCalendarUnit|NSHourCalendarUnit|NSMinuteCalendarUnit fromDate:fromDate toDate:toDate options:0];
NSString *countdown_text = @"";

if (components.day > 1) {
    countdown_text = [NSString stringWithFormat:@"%i days", components.day];
}
//1d 4hrs
else if (components.day > 0 && components.hour > 1) {
    countdown_text = [NSString stringWithFormat:@"%id %ihrs", components.day, components.hour];
}
//1d 1hr
else if (components.day > 0 && components.hour == 1) {
    countdown_text = [NSString stringWithFormat:@"%id %ihr", components.day, components.hour];
}
//1 day  ..this probably won't happen
else if (components.day > 0 && components.hour == 0) {
    countdown_text = [NSString stringWithFormat:@"%i day", components.day];
}
//12 hours
else if (components.hour > 1) {
    countdown_text = [NSString stringWithFormat:@"%i hours", components.hour];
}
//1 hour
else if (components.hour == 1) {
    countdown_text = @"1 hour";
}
//48 mins
else if (components.minute > 1) {
    countdown_text = [NSString stringWithFormat:@"%i mins", components.minute];
}
//1 min
else if (components.minute == 1) {
    countdown_text = @"1 min";
}
//0 min or less
else  {
    countdown_text = @"now";
}

```
