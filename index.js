const express = require('express');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const https = require('https');
const bodyParser = require('body-parser')

// YouTube Data API Key
// https://developers.google.com/youtube/v3/getting-started?hl=fr
const key = process.env.KEY || "xxxxxxxx-xxxxxxxxxxxxxx";

// Relative temp dir used by download.sh
const tempDir = process.env.TEMPDIR || "/docker-data/data"

// =============================================================================
// Express app definition

// Express Http Port
const port = process.env.PORT || 3000;

const app = express();
app.use(cors()); // Enable CORS

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use('/', express.static(path.join(__dirname, '/public')));
app.set('json spaces', 40);

// =============================================================================
// Bull Queue

// https://github.com/OptimalBits/bull
var Queue = require('bull');

// REDIS
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;

// Bull Queue
var minioQueue = new Queue('Minio Queue', {redis: {port: redisPort, host: redisHost, db: 1}}); // Specify Redis connection using object

// Queue Processing
minioQueue.process(function(job, done){
    console.log("[minioQueue] Processing " + job.data.url + " ...");
            
    const command = generateCommand(job.data);
        
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("[minioQueue] ERROR Processing " + job.data.url + ":");
        console.error(err);
        return;
      }

      done(null, {stdout : stdout, stderr: stderr});
    });
});

minioQueue.on('error', function(error) {
    console.error("[minioQueue] ERROR :");
    console.error(error);
}).on('completed', function(job, result){
    console.log("[minioQueue] completed " + job.data.url + " : " + JSON.stringify(result));
}).on('failed', function(job, err){
    console.error("[minioQueue] failed " + job.data.url + " : ");
    console.error(err)
});

// =============================================================================
// Express app routes

// GET Video info
app.get('/info', function (req, res) {    
    res.setHeader('Content-Type', 'application/json');

    // Get Youtube URL 
    const url = req.query.url;
    // Get Youtube Video ID 
    const video_id = getVideoId(url);
    
    // Get videos Data From Google
    https.get('https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id='+video_id+'&key=' + key, (resp) => {
      let data = '';
    
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
    
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        //console.log(JSON.parse(data).explanation);
        res.send(data);
      });
    
    }).on("error", (err) => {
      res.send(JSON.stringify({error : "could'nt get video details"}));
      console.error("Error: " + err.message);
    });
});

/* Download directly an MP3 file */
app.post('/download', function (req, res) {
    console.log("[/download] " + JSON.stringify(req.body));
        
    const command = generateCommand(req.body);
    const filename = generateFilename(req.body);
    
    exec(command, (err, stdout, stderr) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({error : err}));
        return;
      }

      console.log("[/download] FINISHED : " + JSON.stringify({stdout : stdout, stderr: stderr}));
      res.sendFile(path.join(__dirname, filename));
    });
});

/* add files directly to minio bucket */
app.post('/minio', function (req, res) {
    console.log("[/minio] " + JSON.stringify(req.body));

    res.setHeader('Content-Type', 'application/json');

    // Add Job to Queue
    job = minioQueue.add(req.body);

    res.send({"OK":"OK"});

});

// =============================================================================
// Common function

/* Extract youtube vide id from its URL */
const getVideoId=function(url) {
    
    var video_id = url.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1)
      video_id = video_id.substring(0, ampersandPosition);
    
    return video_id;
}

/* Generate filename to be downloaded */
const generateFilename=function(data) {
    const url = data.url;
    const title = data.title;
    const artist = data.artist;

    const video_id = getVideoId(url);
    
    return `${tempDir}/${video_id}/${artist} - ${title}.mp3`;
}

/* generate download.sh command and its args from data */
const generateCommand=function(data) {
    const url = data.url;
    const title = data.title;
    const artist = data.artist;
    const album = data.album;
    const genre = data.genre;
    const year = data.year;

    const video_id = getVideoId(url);
    
    const command = `./download.sh "${video_id}" "${url}" "${title}" "${artist}" "${album}" "${genre}" "${year}"`;
    
    console.log("[command]" + command);

    return command;
}

// =============================================================================
// Http Server

// Start
const httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('yt2mp3 Server Running on port ' + port);
});
