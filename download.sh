#!/bin/bash

# =============================================================================
#
# ------------------------------------------------------------------
# download.sh
# Uses youtube-dl to download and convert a video to mp3
# ------------------------------------------------------------------
#
# @version : 0.0.1 - 28/04/2020
# @author : Zied ZAIEM  
#
# usage:
#   ./download.sh ID URL TITLE ARTIST ALBUM GENRE YEAR
#
# example:
#   ./download.sh "kJQP7kiw5Fk" "https://www.youtube.com/watch?v=kJQP7kiw5Fk" "Despacito" "Luis Fonsi ft. Daddy Yankee" "" "Pop latino / Reggaeton"
#
# Supported Operating Systems:
#     Debian/Ubuntu
#
# This script is linted using:
#     https://www.shellcheck.net/
#
# ------------------------------------------------------------------
# Inspiration:
#   https://github.com/fastsitephp/fastsitephp/blob/master/scripts/shell/bash/create-fast-site.sh
#   https://misc.flogisoft.com/bash/tip_colors_and_formatting
#
# =============================================================================

# Configure locale
export LC_ALL=fr_FR.UTF-8 && export LANG=fr_FR.UTF-8 && export LANGUAGE=fr_FR.UTF-8

# Args
ID=$1
URL=$2
TITLE=$3
ARTIST=$4
ALBUM=$5
GENRE=$6
YEAR=$7

# Download mc
if [ ! -f "mc" ]; then
    wget https://dl.minio.io/client/mc/release/linux-amd64/mc
    chmod +x mc
    MINIO_HOST="${MINIO_URL:-http://127.0.0.1:9000/}"
    MINIO_USER="${MINIO_ACCESS_KEY:-minio}"
    MINIO_PASS="${MINIO_SECRET_KEY:-password}"

    ./mc config host add yt2mp3 "$MINIO_HOST" "$MINIO_USER" "$MINIO_PASS"
fi

# Create temp data
mkdir -p docker-data/data/"$ID"
cd docker-data/data/"$ID" || exit

# Download MP3 + thumbnail
youtube-dl --quiet --no-color -x --audio-format mp3 --audio-quality 0 --write-thumbnail -o "$ARTIST - $TITLE.%(ext)s" "$URL" 

# Get filenames
MP3_FILE=$(youtube-dl --no-color --get-filename -o "$ARTIST - $TITLE.mp3" $URL)
JPG_FILE=$(youtube-dl --no-color --get-filename -o "$ARTIST - $TITLE.jpg" $URL)

if [ ! -f "$MP3_FILE" ]; then
    MP3_FILE=$(youtube-dl --no-color --get-filename -o "$ARTIST - $TITLE.m4a" $URL)
fi

# Add Tags, produces a new file : "$MP3_FILE.mp3"
lame -V0 --quiet --tt "$TITLE" --ta "$ARTIST" --tl "$ALBUM" --tg "$GENRE" --ty "$YEAR" --ti "$JPG_FILE" "$MP3_FILE"

rm "$MP3_FILE"
mv "$MP3_FILE.mp3" "$MP3_FILE"

MINIO_BUCKET_NAME="${MINIO_BUCKET:-mp3}"

# Copy File to minio/mp3
../../../mc --no-color --quiet cp "$MP3_FILE" yt2mp3/"$MINIO_BUCKET_NAME"

echo "$MP3_FILE"

exit 0