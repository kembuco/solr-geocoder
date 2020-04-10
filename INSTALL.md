## Geocoder Installation

#### Install Postgis
Install Postgres with the PostGIS extension wherever it will be accessible to the machine the geocoder is installed on.

#### Set Postgres environment variables
Open ./scripts/pg_connect and change exported PG* variables.

#### Run the install script
Run the install script. It is only Ubuntu right now, but should work on Debian as well.

```
$ ./install.ubuntu.sh
```

## Docker

#### Install Docker
An introduction to Docker and downloads can be found here: https://docs.docker.com/get-started/

#### Set Postgres environment variables
Open ./scripts/pg_connect and change exported PG* variables.

PGHOST=database
PGPORT=5432
PGDATABASE=geocoder
PGUSER=geocoder
PGPASSWORD=password

#### Build the image and create a container
```
$ docker-compose up -d --build
```

#### Attach to the container
```
$ docker exec -it solr-geocoder_api_1 /bin/bash
```

#### Run the install script
```
$ ./install.ubuntu.sh
```