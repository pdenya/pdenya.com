---
author: Paul
category:
  - uncategorized
date: "2014-08-16T00:38:44+00:00"
guid: https://pdenya.com/?p=414
title: OS X pg gem install or bundle install issues
url: /2014/08/15/os-x-pg-gem-install-bundle-install-issues/

---
If you're getting errors like:

```bash
Building native extensions.  This could take a while...
ERROR:  Error installing pg:
    ERROR: Failed to build gem native extension.

    /System/Library/Frameworks/Ruby.framework/Versions/2.0/usr/bin/ruby extconf.rb
checking for pg_config... yes
Using config values from /usr/local/bin/pg_config
checking for libpq-fe.h... yes
checking for libpq/libpq-fs.h... yes
checking for pg_config_manual.h... yes
checking for PQconnectdb() in -lpq... no
checking for PQconnectdb() in -llibpq... no
checking for PQconnectdb() in -lms/libpq... no
Can't find the PostgreSQL client library (libpq)
*** extconf.rb failed ***
Could not create Makefile due to some reason, probably lack of necessary
libraries and/or headers.  Check the mkmf.log file for more details.  You may
need configuration options.

Provided configuration options:
    --with-opt-dir
    --without-opt-dir
    --with-opt-include
    --without-opt-include=${opt-dir}/include
    --with-opt-lib
    --without-opt-lib=${opt-dir}/lib
    --with-make-prog
    --without-make-prog
    --srcdir=.
    --curdir
    --ruby=/System/Library/Frameworks/Ruby.framework/Versions/2.0/usr/bin/ruby
    --with-pg
    --without-pg
    --with-pg-config
    --without-pg-config
    --with-pg_config
    --without-pg_config
    --with-pg-dir
    --without-pg-dir
    --with-pg-include
    --without-pg-include=${pg-dir}/include
    --with-pg-lib
    --without-pg-lib=${pg-dir}/
    --with-pqlib
    --without-pqlib
    --with-libpqlib
    --without-libpqlib
    --with-ms/libpqlib
    --without-ms/libpqlib

Gem files will remain installed in /Library/Ruby/Gems/2.0.0/gems/pg-0.17.1 for inspection.
Results logged to /Library/Ruby/Gems/2.0.0/gems/pg-0.17.1/ext/gem_make.out
```

Try:

```bash
sudo env ARCHFLAGS="-arch x86_64" bundle install
```

If that's still failing make sure gem install works first:

```bash
sudo env ARCHFLAGS="-arch x86_64" gem install pg -- --with-pg-config=/usr/local/Cellar/postgresql/9.3.1/bin/pg_config
```
