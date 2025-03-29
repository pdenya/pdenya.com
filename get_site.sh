#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: $0 <subpage (or / for root)>"
  exit 1
fi

curl -v "http://localhost:1313$1"