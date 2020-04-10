FROM ubuntu:18.04

RUN apt update && \
    apt install -y locales sudo tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8

RUN useradd -m geocoder && echo "geocoder:password" | chpasswd && adduser geocoder sudo
RUN echo "geocoder ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/geocoder && chmod 0440 /etc/sudoers.d/geocoder

WORKDIR /opt/solr-geocoder
COPY . .
RUN chown -R geocoder:geocoder .

USER geocoder

EXPOSE 8983
EXPOSE 3005