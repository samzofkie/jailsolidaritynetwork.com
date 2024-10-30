#!/bin/bash

mkdir cert

docker build -t jsn-test-runner .

docker run --rm -v .:/test -w /test jsn-test-runner mkcert jailsolidaritynetwork.com www.jailsolidaritynetwork.com localhost 127.0.0.1 proxy

mv -f jailsolidaritynetwork.com+4.pem cert/cert.pem
mv -f jailsolidaritynetwork.com+4-key.pem cert/privkey.pem