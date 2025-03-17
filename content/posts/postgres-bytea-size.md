---
author: Paul
category:
  - db
date: "2014-01-17T02:15:54+00:00"
guid: https://pdenya.com/?p=403
title: Postgres Bytea Size
url: /2014/01/16/postgres-bytea-size/

---
The `octet_length` function returns the length in bytes size of a bytea field. From the docs: "Number of bytes in binary string".

```sql

SELECT octet_length(the_data_field) FROM table_name;
# byte size

```

[More binary string functions](http://www.postgresql.org/docs/8.2/static/functions-binarystring.html)
