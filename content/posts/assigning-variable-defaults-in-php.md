---
author: Paul
category:
  - php
date: "2013-07-16T18:21:43+00:00"
guid: https://pdenya.com/?p=74
title: Assigning variable defaults in PHP
url: /2013/07/16/assigning-variable-defaults-in-php/

---
It'd be nice if PHP had a quick Or-Equals expression like Ruby:

```ruby
user ||= User.new

```

but we make do with few slightly less sugary idioms.

### The standard way

```php
if (isset($user)) {
  $user = new User();
}

```

### A bit shorter

```php
$user = isset($user) ? $user : new User();

```

### Shorter still

This is my preferred way of making sure variables are set. Short and clear.

```php
isset($user) || $user = new User();

```

### Expressions with defaults

It's usually best not to treat variable assignments as booleans but in cases like this I think it's clear enough what's happening.

```php
($user = $request->getUser()) || $user = new User();

```
