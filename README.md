# yt2mp3

Youtube to MP3 downloader and converter, uses youtube_dl. Stores mp3 files in Minio or any [mc](https://github.com/minio/mc) compatible Object Storage (Amazon S3 , Google Cloud Storage, etc.).

<img src="https://raw.githubusercontent.com/ziedzaiem/yt2mp3/master/screenshot.png" width="200" alt="screenshot.png" />

## Instructions

1. Get a Youtube API Key From Google Developers Console as described in this [link](https://developers.google.com/youtube/v3/getting-started?hl=fr).

2. In docker-compose.yml, set the environment variable KEY to the API Key obtained.

3. Start the stack :

```shell
docker-compose up -d
```

4. Create a bucket named **mp3** in [Minio](http://127.0.0.1:9000)

5. Go to yt2mp3 [frontend](http://127.0.0.1:3000), and paste some Youtube video in the input.

6. Fill the form and click on **Download** or **Add to Minio** buttons. The first time the binary **mc** will be downloaded and configured, so it may take long to have the mp3 file on [Minio](http://127.0.0.1:9000/minio/mp3/)

## Tech Stack

- [youtube-dl](https://github.com/ytdl-org/youtube-dl) to download videos from youtube.
- [lame](https://lame.sourceforge.io/) to encode mp3 files.
- [Minio](https://min.io/) is used to store mp3 files.
- [Express](http://expressjs.com/) for the node server.
- [Bull](https://github.com/OptimalBits/bull) is used to manage queues. 
- [Redis](https://redis.io/) is used by Bull.
- [Argon Design System](https://www.creative-tim.com/product/argon-design-system) is used for the frontend.

## Licence

MIT.
