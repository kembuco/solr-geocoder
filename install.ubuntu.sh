#!/bin/bash

# Prep the system
sudo apt update
sudo apt -y upgrade
sudo apt update
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates wget unzip lsof haveged gnupg2

# Installing Java
sudo apt update
sudo apt -y install default-jre

# Intsalling Node.js
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt -y install nodejs gcc g++ make

# Installing Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt -y install yarn

# Install Postgres client && PostGIS tools
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" | sudo tee  /etc/apt/sources.list.d/pgdg.list
sudo apt update
DEBIAN_FRONTEND=noninteractive sudo apt -y install postgresql-client-12 postgis

# Setting up the API project
cp .env.example .env && yarn
cd api && cp .env.example .env && yarn && cd ..

# Setting up the Solr project
wget http://mirrors.ibiblio.org/apache/lucene/solr/8.5.0/solr-8.5.0.zip
unzip solr-8.5.0.zip && rm solr-8.5.0.zip && mv solr-8.5.0 solr
cp -r solr/server solr/node1 && cp -r solr/server solr/node2 && cp -r solr/server solr/node3

# Setting up Zookeeper
wget https://downloads.apache.org/zookeeper/zookeeper-3.6.0/apache-zookeeper-3.6.0-bin.tar.gz
tar xzf apache-zookeeper-3.6.0-bin.tar.gz && rm -f apache-zookeeper-3.6.0-bin.tar.gz
mv apache-zookeeper-3.6.0-bin zookeeper && rm -rf zookeeper/docs

cat <<EOT >> zookeeper/conf/zoo.cfg
tickTime=2000
initLimit=5
syncLimit=2
dataDir=/opt/solr-geocoder/zookeeper/data
clientPort=2181
4lw.commands.whitelist=mntr,conf,ruok
EOT

cat <<EOT >> zookeeper/conf/zookeeper-env.sh
ZOO_LOG_DIR="/opt/solr-geocoder/zookeeper/logs"
ZOO_LOG4J_PROP="INFO,ROLLINGFILE"
SERVER_JVMFLAGS="-Xms2048m -Xmx2048m"
EOT

zookeeper/bin/zkServer.sh start

# Creating Solr instances
solr/bin/solr start -c -s solr/node1/solr -p 8983 -z 127.0.0.1:2181
solr/bin/solr start -c -s solr/node2/solr -p 8984 -z 127.0.0.1:2181
solr/bin/solr start -c -s solr/node3/solr -p 8985 -z 127.0.0.1:2181

solr/bin/solr create -c addresses -d configset/addresses -replicationFactor 3
solr/bin/solr create -c streets -d configset/streets -replicationFactor 3

# Load data into Solr
cd data/streets && wget https://download.geofabrik.de/north-america/us/colorado-latest-free.shp.zip 
unzip colorado-latest-free.shp.zip gis_osm_roads_free_1.* && rm -f colorado-latest-free.shp.zip && cd ../..
./scripts/streets/loadpg
./scripts/streets/tocsv
solr/bin/post -c streets -params "fieldnames=id,name&commitWithin=10000" data/streets/streets.csv

cd data/address && wget http://kembuco.com/geocoder/AllAddresses.csv && cd ../..
./solr-geocoder process-data -i data/address/AllAddresses.csv -o addresses-{index}.csv && rm -f data/address/AllAddresses.csv
solr/bin/post -c addresses -params "fieldnames=id,longitude,latitude,address_number,address_number_suffix,street_name_pre_directional,street_name_pre_type,street_name,street_name_post_type,street_name_post_directional,occupancy_type,occupancy_identifier,AddrFull,place_name,zipcode,county,point,address&skip=AddrFull" data/address/addresses-*.csv

# Shut down Solr && zookeeper
solr/bin/solr stop -all
zookeeper/bin/zkServer.sh stop