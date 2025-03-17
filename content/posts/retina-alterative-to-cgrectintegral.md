---
author: Paul
category:
  - objective-c
date: "2013-08-14T15:00:07+00:00"
guid: https://pdenya.com/?p=272
title: Retina alterative to CGRectIntegral
url: /2013/08/14/retina-alterative-to-cgrectintegral/

---
CGRectIntegral is a function for rounding all the values of a CGRect at once, typically used for snapping frames to pixels. For a good example of how this helps prevent image blurring and other related rendering issues see [this stackoverflow answer](http://stackoverflow.com/a/9975374/659989).

On retina screens CGRectIntegral still rounds to the nearest point (1.0) rather than the nearest pixel (0.5) which isn't ideal.

My solution to this is implemented as a UIView category which matches my use case for CGRectIntegral 100% of the time. Your mileage may vary.

```objc
//UIView Category
- (CGRect) roundedFrame {
    return CGRectMake(
          round(self.frame.origin.x * [[UIScreen mainScreen] scale]) / [[UIScreen mainScreen] scale],
          round(self.frame.origin.y * [[UIScreen mainScreen] scale]) / [[UIScreen mainScreen] scale],
          round(self.frame.size.width * [[UIScreen mainScreen] scale]) / [[UIScreen mainScreen] scale],
          round(self.frame.size.height * [[UIScreen mainScreen] scale]) / [[UIScreen mainScreen] scale]
      );
}

//Usage
view.frame = [view roundedFrame];

```
