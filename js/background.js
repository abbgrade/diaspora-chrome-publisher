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

var podUrl;
var minutes = getMinutes();
var t;

getPod();

if (podUrl == null) {
  alert(chrome.i18n.getMessage("setPodUrl"));
  chrome.tabs.create({url : "options.html"});
} else if (getOpt("notify") == "true") {
  checkNotifications();
}

function checkNotifications() {
  if (getOpt("notify") == "true"){
    minutes = getMinutes();
    t = setTimeout(function(){checkNotifications()}, minutes);
    getNotifications();
  } else {
    resetNotifications();
  }
}

function getNotifications() {
  getPod();
  
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: podUrl + "/notifications.json",
    success: function (result) {
      showNotifications(result);
    },
    error: function() {
      resetNotifications();
    }
  });
}

function resetNotifications() {
  chrome.browserAction.setBadgeText({text: ''});
}

function showNotifications(result) {
  var n = 0;
  for(var x = 0; result.length > x; x++) {
    var unread =  result[x][Object.keys(result[x])[0]].unread;
    if (unread == true)
      n++;
  }
  if (n > 0)
    chrome.browserAction.setBadgeText({text: n.toString()});
  else
    resetNotifications();
}

function getPod(){
  podUrl = (window.localStorage != null && window.localStorage.podUrl != null) ? window.localStorage.podUrl : null;
  return podUrl;
}

function getMinutes(){
  return (window.localStorage != null && window.localStorage.minutes != null) ? window.localStorage.minutes : "300000";
}

function getOpt(opt){
  return (window.localStorage != null && window.localStorage.getItem(opt) != null) ? window.localStorage.getItem(opt) : "true";
}
