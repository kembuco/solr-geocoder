#!/bin/bash
zookeeper/bin/zkServer.sh stop
solr/bin/solr stop -all
cd api && yarn api:stop && cd ..