---
date: '2025-06-19T11:37:15-04:00'
draft: false
title: 'Laravel Cache Remember Forever if Truthy'
category:
  - laravel
  - php
---

I kept needing a cache method that would only store a value permanently if the result was truthy. For expensive operations that might return null or false, I wanted to keep trying until I got a real result, then cache that forever.

### The problem

Laravel's `Cache::rememberForever()` will cache any result, including null or false values. But sometimes you only want to cache successful results and keep retrying failed ones.

For example, if you're making an API call that might fail, or calculating something expensive that could return null, you don't want to cache the failure.

### The solution

Add this macro to your `AppServiceProvider` boot method:

```php
// app/Providers/AppServiceProvider.php

use Illuminate\Support\Facades\Cache;

public function boot()
{
    // ... other boot code

    // Calculate until we get a truthy result and then cache that forever
    Cache::macro('rememberForeverIfTruthy', function (string $key, callable $cb) {
        $val = Cache::get($key, false);
        if ($val) {
            return $val;
        }

        $result = $cb();

        if ($result) {
            Cache::forever($key, $result);
        }

        return $result;
    });
}
```

### Usage

```php
// This will keep trying the API call until it succeeds,
// then cache the successful response forever
$data = Cache::rememberForeverIfTruthy('api_data', function () {
    return Http::get('https://api.example.com/data')->json();
});

// Perfect for user milestone/activation status checks
$hasCompletedOnboarding = Cache::rememberForeverIfTruthy("user.{$user->id}.onboarding_complete", function () use ($user) {
    return $user->profile_complete && $user->email_verified && $user->first_login_complete;
});

// Or checking if a user has reached an achievement
$isPowerUser = Cache::rememberForeverIfTruthy("user.{$user->id}.power_user", function () use ($user) {
    return $user->posts()->count() >= 100 && $user->followers()->count() >= 1000;
});
```

### Why this is useful

- Failed API calls don't get cached, so you'll retry on the next request
- Expensive operations that return null won't prevent future attempts
- Once you get a truthy result, it's cached forever
- Simple and clean API that follows Laravel conventions

The macro checks if there's already a cached value, runs your callback if not, and only caches the result if it's truthy. Perfect for those cases where you want persistence only after success.
