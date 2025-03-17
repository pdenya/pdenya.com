---
author: Paul
category:
  - devtools
date: "2013-10-03T15:00:19+00:00"
guid: https://pdenya.com/?p=351
title: Logging into postgres on Bitnami's Ruby Stack VM
url: /2013/10/03/logging-into-postgres-on-bitnamis-ruby-stack-vm/

---
The VM for the [Bitnami Ruby Stack](http://bitnami.com/stack/ruby) doesn't have the correct credentials for postgres anywhere that I could find. Incorrect credentials that I saw on the Bitnami site, in the docs hosted on the VM, or on the internet while searching for a solution:

```shell
user: root
pass:

user: root
pass: root

user: administrator
pass: bitnami

user: bitnami
pass: bitnami

user: postgres
pass:

user: postgres
pass: bitnami

user: postgres
pass: postgres

```

I never found the correct combination but instead simply installed postgres via apt-get and moved the bitnami postgres installation outside of $PATH in case I need it in the future.

```shell
# hide bitnami/postgres from $PATH
mkdir /opt/_bitnami
mv /opt/bitnami/postgresql /opt/_bitnami/

# install postgres
apt-get update
apt-get install postgresql

# login
sudo -u postgres psql postgres
#set password with \password postgres

# NOTE: postgres connections/configs must specify host
psql postgres -U postgres -h localhost #works
psql postgres -U postgres  #doesn't work

```
