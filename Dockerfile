FROM ubuntu:18.04

LABEL maintainer="Zied ZAIEM <zaiem.zied@gmail.com>"

RUN apt-get update -qq
RUN apt-get install -y -qq --no-install-recommends wget curl python python-pip gcc g++ make locales ffmpeg lame webp file
RUN pip install --upgrade pip
RUN pip install --upgrade youtube_dl

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y -qq --no-install-recommends nodejs

ADD . /yt2mp3
WORKDIR /yt2mp3

RUN npm install npm@latest -g
RUN npm ci

RUN sed -i -e 's/# fr_FR.UTF-8 UTF-8/fr_FR.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=fr_FR.UTF-8

ENV LC_ALL fr_FR.UTF-8
ENV LANG fr_FR.UTF-8
ENV LANGUAGE fr_FR.UTF-8

ENV MINIO_URL http://127.0.0.1:9000/
ENV MINIO_ACCESS_KEY minio
ENV MINIO_SECRET_KEY password

ENV REDIS_HOST 127.0.0.1
ENV REDIS_PORT 6379

ENV PORT 3000

ENV KEY ""

VOLUME /yt2mp3/docker-data

EXPOSE 3000

CMD ["node","index.js"]