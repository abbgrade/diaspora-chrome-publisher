/*
 * Diaspora* Publisher extension.
 * Copyright (C) 2012  Vittorio Cuculo <vittorio.cuculo@gmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

console.log("run content_script.js");

// why this? .. may be removed in future
var image = null;

var port = chrome.extension.connect();

port.onMessage.addListener(function(msg) {
  console.log("receive msg " + msg.type);
  if (msg.type == "getPageData") {

    // get images
    var images = document.getElementsByTagName("img");
    var imagesJson = new Array(0);
    for (var i=0; i<images.length; i++) {
      min = Math.min(images[i].width, images[i].height);
      max = Math.max(images[i].width, images[i].height);
      
      if (min/max > 0.3 && max >= 100 && min >= 100) {
        imagesJson.push({
          pageSrc: window.location.href,
          imgSrc: decodeURIComponent(encodeURIComponent(images[i].src)),
          width: images[i].width,
          height: images[i].height,
          title: document.title
        });
        //  title: images[i].alt
      }
    }

    // get videos
    var videos = document.getElementsByTagName("link");
    var videosJson = new Array(0);
    if (isYoutube(window.location.hostname)) {
      var preview = getYTimg(window.location.href);
      videosJson.push({
        pageSrc: window.location.href,
        imgSrc: preview,
        title: document.title
      });
    } else if (isVimeo(window.location.hostname)) {
      var preview = getVMimg(window.location.href);
      videosJson.push({
        pageSrc: window.location.href,
        imgSrc: preview,
        title: document.title
      });
    }

    // send data
    port.postMessage({
      type : "getPageDataResponse",
      title: document.title,
      url: document.URL, 
      images: imagesJson,
      videos: videosJson
    });
  }
});

function isYoutube(url) {
  return (url == "www.youtube.com");
}

function isVimeo(url) {
  return (url == "vimeo.com");
}

function getYTimg(url)
{
  if(url === null){ return ""; }

  var id;
  var results;

  results = url.match("[\\?&]v=([^&#]*)");
  id = ( results === null ) ? url : results[1];

  return "http://img.youtube.com/vi/" + id + "/0.jpg";
}

function getVMimg(url)
{
  if(url === null){ return ""; }

  var thumbnail = "";  
  var id = url.split('/')[3];

  $.ajax({
    type:'GET',
    url: 'http://vimeo.com/api/v2/video/' + id + '.json',
    jsonp: 'callback',
    async: false,
    dataType: 'jsonp',
    success: function(data){
      thumbnail = data[0].thumbnail_large;
    }
  });
  return thumbnail;
}

console.log("script ready");
port.postMessage({type : "scriptReady"});
