/* global $ */

const in_url = document.getElementById("in_url");
const in_url_parent = document.getElementById("in_url_parent");

// Big Card
const out_card = document.getElementById("out_card");
// More Button
const out_more = document.getElementById("out_more");

// Form
const in_title = document.getElementById("in_title");
const in_artist = document.getElementById("in_artist");
const in_album = document.getElementById("in_album");
const in_genre = document.getElementById("in_genre");
const in_year = document.getElementById("in_year");

// Buttons
const in_download = document.getElementById("in_download");
const in_minio = document.getElementById("in_minio");

/* Add commas to big numbers for better UX  */
const numberWithCommas = (x) => {
  if(!x)
    x=0;
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/* Reset Everything */
function clean(){
    
    $("#in_url_parent").removeClass("has-success");
    $("#in_url_parent").removeClass("has-danger");

    $("#in_url").removeClass("is-valid");
    $("#in_url").removeClass("is-invalid");
    
    $("#out_card").hide();
    
    $("#in_download").removeClass("btn-info");
    $("#in_download").removeClass("btn-success");
    $("#in_download").removeClass("btn-warning");
    $("#in_download").addClass("btn-danger");
    $("#in_download").html('<i class="fas fa-download"></i> Download');
    
    $("#in_minio").removeClass("btn-info");
    $("#in_minio").removeClass("btn-success");
    $("#in_minio").removeClass("btn-warning");
    $("#in_minio").addClass("btn-primary");
    $("#in_minio").html('<i class="fas fa-music"></i> Add to Minio');

    $("#out_more").attr('href', "");
}

/* in_url events */

$( "#in_url" ).keypress(function() {
    clean();
});

$( "#in_url" ).on('paste', function(e){
    //var content = e.originalEvent.clipboardData.getData('text/plain');
    clean();
});
    
$( "#in_url" ).change(function() {
    let value = in_url.value;
    
    clean();
  
    $.ajax({
        method: "GET",
        url: "/info",
        data: {url : value },
        dataType: "json"
    })
    .done(function( data ) {
        $("#in_url_parent").addClass("has-success");
        $("#in_url").addClass("is-valid");
        
        const yt = data.items[0];
        
        $("#out_viewCount").html(numberWithCommas(yt.statistics.viewCount));
        $("#out_likeCount").html(numberWithCommas(yt.statistics.likeCount));
        $("#out_dislikeCount").html(numberWithCommas(yt.statistics.dislikeCount));
        
        $("#out_thumb_1").attr('src', yt.snippet.thumbnails.high.url);
        $("#out_thumb_2").attr('src', yt.snippet.thumbnails.high.url);
        $("#out_url").attr('href', in_url.value);
        $("#out_more").attr('href', in_url.value);
        
        $("#out_title").html(yt.snippet.title);
        $("#out_channelTitle").html(yt.snippet.channelTitle);
        $("#out_description").html(yt.snippet.description.replace("\n","<br/>"));
        
        var publishedAt = Date.parsepublishedAt = Date.parse(yt.snippet.publishedAt)
        $("#out_publishedAt").html((new Date(publishedAt)).toLocaleDateString());
        
        // Show Big Card
        $("#out_card").show();
     })  
    .fail(function( data ) {
        console.error( data );
        
        $("#in_url_parent").addClass("has-danger");
        $("#in_url").addClass("is-invalid");
    });
});

$("#in_download").click(function() {
    $("#in_download").html('<i class="fas fa-spinner"></i> Loading...');
    $("#in_download").removeClass("btn-danger");
    $("#in_download").addClass("btn-info");
    
    let payload = {
        url : in_url.value,
        title : in_title.value,
        album : in_album.value,
        genre : in_genre.value,
        artist : in_artist.value,
        year : in_year.value,
    }
    
    $.ajax({
        method: "POST",
        url: "/download",
        data: payload,
        //dataType: "json"
        xhrFields: {
            responseType: 'blob'
        }
    })
    .done(function( data ) {
        $("#in_download").removeClass("btn-info");
        $("#in_download").addClass("btn-success");
    
        $("#in_download").html('<i class="fas fa-check-circle"></i> Succes !');
        
        var a = document.createElement('a');
        var url = window.URL.createObjectURL(data);
        a.href = url;
        a.download = in_artist.value + " - " + in_title.value;
        a.click();
        window.URL.revokeObjectURL(url);
     })  
    .fail(function( data ) {
        console.error( data );
        
        $("#in_download").removeClass("btn-info");
        $("#in_download").addClass("btn-warning");
    
        $("#in_download").html('<i class="fas fa-exclamation-circle"></i> Error !');
    });
    
    
});

$("#in_minio").click(function() {
    $("#in_minio").html('<i class="fas fa-spinner"></i> Loading...');
    $("#in_minio").removeClass("btn-danger");
    $("#in_minio").addClass("btn-info");
    
    let payload = {
        url : in_url.value,
        title : in_title.value,
        album : in_album.value,
        genre : in_genre.value,
        artist : in_artist.value,
        year : in_year.value,
    }
    
    $.ajax({
        method: "POST",
        url: "/minio",
        data: payload,
        dataType: "json"
    })
    .done(function( data ) {
        $("#in_minio").removeClass("btn-info");
        $("#in_minio").addClass("btn-success");
    
        $("#in_minio").html('<i class="fas fa-check-circle"></i> Added to queue !');
     })  
    .fail(function( data ) {
        console.error( data );
        
        $("#in_minio").removeClass("btn-info");
        $("#in_minio").addClass("btn-warning");
    
        $("#in_minio").html('<i class="fas fa-exclamation-circle"></i> Error !');
    });
    
    
});