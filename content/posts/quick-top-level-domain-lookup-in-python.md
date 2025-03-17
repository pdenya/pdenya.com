---
author: Paul
category:
  - python
date: "2014-06-03T20:09:41+00:00"
guid: https://pdenya.com/?p=408
title: Quick Top Level Domain Lookup in Python
url: /2014/06/03/quick-top-level-domain-lookup-python/

---
Python's get\_tld works very well but is slow if you're looking up a batch of domain names. Here's a faster version that falls back on get\_tld:

```python
from tld import get_tld
import re

def quick_tld(url):
    tld_prog = re.compile(r'(?P<tld>[^./]+\.(com|net|org|co\.uk))($|/)')
    ip_prog = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')

    try:
        tld_match = tld_prog.search(url)
        if tld_match:
            return tld_match.group('tld')
        elif ip_prog.match(article.url):
            return None
        else:
            return get_tld(url)

    except Exception as e:
        pass

    return None

```
