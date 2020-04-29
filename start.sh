#!/bin/bash
zookeeper/bin/zkServer.sh start

solr/bin/solr start -c -s solr/node1/solr -p 8983 -z 127.0.0.1:2181
solr/bin/solr start -c -s solr/node2/solr -p 8984 -z 127.0.0.1:2181
solr/bin/solr start -c -s solr/node3/solr -p 8985 -z 127.0.0.1:2181