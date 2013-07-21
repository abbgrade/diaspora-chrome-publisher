console.log("run share.js");

function localize() {
  $("h3[id='extAction']").html(chrome.i18n.getMessage("extAction"));
  $("a[href='#mediaContent']").html(chrome.i18n.getMessage("addContent"));
  $("a[href='#comment']").html(chrome.i18n.getMessage("addComment"));
  $("a[href='#tags']").html(chrome.i18n.getMessage("addTagsOpt"));
  $("a[href='#preview']").html(chrome.i18n.getMessage("addPreview"));

  $("button#postCancel").html(chrome.i18n.getMessage("postCancel"));
  $("button#postContinue").html(chrome.i18n.getMessage("postContinue"));
  $("button#postSend").html(chrome.i18n.getMessage("postSend"));
}

function getPostSrc() {
  var message = $("#comment").find("textarea").first().val();
  // escape hashtags for markdown
  message = message.replace(/(^| )#([A-Za-z0-9_-]+)(?![A-Za-z0-9_\]-])/g, "$1\\#$2");

  var item = $("#contentCarousel").find("div.active");
  var src = "";

  if (item.hasClass("image")) {
    // with image
    var preview = item.find("img").first().attr('src');
    var title = item.attr('data-title');
    var pageSrc = item.attr('data-page-src');

    src = "[ !["+preview+"]("+preview+") ]("+pageSrc+")";
    if((item.find("input[name='showTitle']").prop('checked')) && (title.length > 0)) {
      // with title
      src = src + "\n\n" + "[ **"+title+"** ]("+pageSrc+")";
    } else {
      // without title
    }
  } else if (item.hasClass("video")) {
    // with video
    var preview = item.find("img").first().attr('src');
    var title = item.attr('data-title');
    var pageSrc = item.attr('data-page-src');

    src = "[ ![preview]("+preview+")]("+pageSrc+")"
    if((item.find("input[name='showTitle']").prop('checked')) && (title.length > 0)) {
      // with title
      src = src + "\n\n" + "[ **"+title+"** ]("+pageSrc+")"
    } else {
      // without title
    }
  } else if (item.hasClass("quote")) {
    // with quote
    var text = item.find("blockquote").first().html();
    var pageSrc = item.attr('data-page-src');
    var title = item.attr('data-page-title');

    src = src + "\n\n" + "> " + text;

    if((item.find("input[name='showTitle']").prop('checked')) && (title.length > 0)) {
      // with title
      src = src + "\n\n" + "[ **"+title+"** ]("+pageSrc+")"
    } else {
      // without title
    }
  } else if (item.hasClass("link")) {
    // with link
    var pageSrc = item.attr('data-page-src');
    var title = item.attr('data-page-title');

    // with title
    src = src + "\n\n" + "[ **"+title+"** ]("+pageSrc+")"
  } else {
    console.log("invalid content to share");
    // without image or video
  }
  src = src + "\n\n" + message;
  return $.trim(src)
}

function main() {
  localize();

  // configure modal dialog
  $('div.modal').modal('show');
  if (getOpt("msg") == "false"){
    $("a[href='#comment']").parent().hide();
    $("#comment").hide();
  }

  $("button#postContinue").addClass('btn-primary');
  $("button#postSend").removeClass('btn-primary');

  // add button event handling
  $("button#postCancel").on('click', function(){
    window.close();
  });

  $("button#postContinue").on('click', function(){
    if($("a[href=#mediaContent]").parent().hasClass('active')) {
      $('a[href=#comment]').tab('show');
    } else if($("a[href=#comment]").parent().hasClass('active')) {
      $('a[href=#preview]').tab('show');
    } else {
      console.log("#post-tabs unknown position");
    }
  });

  $("button#postSend").on('click', function(){
    var podUrl = getPod();
    var mdSrc = getPostSrc();
    var action_url = podUrl + "/bookmarklet?title=" + encodeURIComponent(mdSrc);
    if (!window.open(action_url+'&v=1&noui=1&jump=doclose','diasporav1','location=yes,links=no,toolbar=no,width=590,height=200'))
      location.href = action_url+'jump=yes';
    window.close();
  });

  $('a[data-toggle="tab"]').on('show', function (e) {
    if($(e.target).attr("href") == "#mediaContent") {
      $("button#postContinue").addClass('btn-primary');
      $("button#postContinue").removeClass('disabled');
      $("button#postSend").removeClass('btn-primary');
    } else if($(e.target).attr("href") == "#comment") {
      $("button#postContinue").addClass('btn-primary');
      $("button#postContinue").removeClass('disabled');
      $("button#postSend").removeClass('btn-primary');
    } else if($(e.target).attr("href") == "#preview") {
      $("button#postContinue").removeClass('btn-primary');
      $("button#postContinue").addClass('disabled');
      $("button#postSend").addClass('btn-primary');

      var src = getPostSrc();

      $("#preview").html(markdown.toHTML(src));
      $("#preview").append("<hr><pre>" + src + "</pre>");
    } else {
      console.log("#post-tabs unknown position");
    }
  })

  $('div.modal').on('hide', function () {
    window.close();
  });

  // parse content
  /* dont know why, but this was necessary 
  var prefix = "chrome-extension://";
  if (window.document.URL.substring(0, prefix.length) == prefix) {
    // internal pages deliver data by themselves!
    alert(window.document.URL);
    console.log("skip execution of content_script.js")
  } else {
    console.log("execute content_script.js")
    chrome.tabs.executeScript(null, {file: "js/content_script.js"});
  }*/
  
  chrome.tabs.executeScript(null, {file: "js/content_script.js"});
  
}

function addContentItem(inner) {
  var index = $("div.carousel-inner").children().length;
  $("div.carousel-indicators").append($("<li data-target='#contentCarousel' data-slide-to='" + index + "'></li>"));
  $("div.carousel-inner").append(inner);
  
  $("div.carousel-indicators").find("li").each(function() {
    $(this).removeClass("active");
  });
  $("div.carousel-indicators").find("li").first().addClass("active");

  $("div.carousel-inner").find("div.item").each(function() {
    $(this).removeClass("active");
  });
  $("div.carousel-inner").find("div.item").first().addClass("active");

  console.log("add item " + index);
}

/*
  @params:
    image = {
      pageSrc: source url
      imgSrc: image url,
      width: image width in pixels,
      height: image height in pixels,
      title: something like the title
    }
*/
function addContentImage(image) {
  console.log("add image " + image.src);
  var inner = $("#contentImageTemplate").clone();
  inner.removeAttr("id");
  inner.removeClass("hide");

  // fill inner
  inner.find("img").first().attr("src", image.imgSrc);

  inner.attr("data-page-src", image.pageSrc);

  var max_width = 560;
  var max_height = 170;
  if((image.width/max_width) > (image.height/max_height))
    inner.find("img").css("width", max_width);
  else
    inner.find("img").css("height", max_height);

  inner.attr("data-title", image.title);
  if (image.title.length > 0) {
    inner.append("<h5><label class='checkbox'><input name='showTitle' type='checkbox'>" + image.title + "<label></h5>")
    inner.find("input[name='showTitle']").prop('checked', getOpt("title") == "true");
  }

  if($("#contentCarousel").find("img[src='"+image.imgSrc+"']").length == 0) {
    addContentItem(inner);
  } else console.log("duplicate image");
}

/*
  @params:
    video = {
      pageSrc: source url
      imgSrc: preview image url,
      title: cheese cake ingidients
    }
*/
function addContentVideo(video) {
  console.log("add video " + video.url);
  var inner = $("#contentVideoTemplate").clone();
  inner.removeAttr("id");
  inner.removeClass("hide");

  // fill inner
  inner.find("img").first().attr("src", video.imgSrc);

  inner.attr("data-page-src", video.pageSrc);

  inner.attr("data-title", video.title);
  if (video.title.length > 0)
    inner.append("<h5><label class='checkbox'><input name='showTitle' type='checkbox'>" + video.title + "<label></h5>")
    inner.find("input[name='showTitle']").prop('checked', getOpt("title") == "true");
  var max_height = 170;
  inner.find("img").css("height", max_height);

  if($("#contentCarousel").find("img[src='"+video.imgSrc+"']").length == 0) {
    addContentItem(inner);
  } else console.log("duplicate video");
}


/*
  @params:
    quote = {
      pageSrc: source page url,
      pageTitle: source page title,
      text: text of the quote
    }
*/
function addContentQuote(quote) {
  var inner = $("#contentQuoteTemplate").clone();
  inner.removeAttr("id");
  inner.removeClass("hide");

  // fill inner
  inner.find("blockquote").first().html(quote.text);

  inner.attr("data-page-src", quote.pageSrc);
  inner.attr("data-page-title", quote.pageTitle);

  if (quote.pageTitle.length > 0)
    inner.append("<h5><label class='checkbox'><input name='showTitle' type='checkbox'>" + quote.pageTitle + "<label></h5>")
    inner.find("input[name='showTitle']").prop('checked', getOpt("title") == "true");

  console.log("add quote: " + quote.text);
  addContentItem(inner);

}

function addContentLink(link) {
  var inner = $("#contentLinkTemplate").clone();
  inner.removeAttr("id");
  inner.removeClass("hide");

  // fill innner
  inner.find("a").first().html(link.title);
  inner.find("a").first().attr('href', link.url);
  inner.attr("data-page-src", link.url);
  inner.attr("data-page-title", link.title);

  console.log("add link " + link.url);
  addContentItem(inner);
}

function addContentInfo(text) {
  var inner = $("#contentInfoTemplate").clone();
  inner.removeAttr("id");
  inner.removeClass("hide");

  // fill innner
  inner.html("<p>" + text + "</p>");

  console.log("add info " + text);
  addContentItem(inner);
}

chrome.extension.onConnect.addListener(function(port) {
  var tab = port.sender.tab;

  // This will get called by the content script we execute in
  // the tab as a result of the user pressing the browser action.
  port.onMessage.addListener(function(msg) {
    if (msg.type == "sendText") {
      console.log("received sendText");
      var max_length = 1024;
      var max_url_length = 25;
      if (msg.selection.length > max_length)
        info.selection = msg.selection.substring(0, max_length);

      $("#mediaContent").html(msg.title);
/*
      // If is video keep original url, otherwise embedding doesnt work
      if (tab.url.length > max_url_length && msg.video == false)
        if (getOpt("short") == "tiny")
          tinyurl(tab.url, function(shorturl) { postMessage(tab.id, msg.title, shorturl, msg.selection, msg.image); });
        else
          googlurl(tab.url, function(shorturl) { postMessage(tab.id, msg.title, shorturl, msg.selection, msg.image); });
/*
      else if (msg.video == true && getOpt("ytimg") == "false")
        postMessage(tab.id, msg.title, tab.url, msg.selection, null);
      
      else if (info.video == true && getOpt("vmimg") == "false")
        postMessage(tab.id, msg.title, tab.url, msg.selection, null);

      else
        postMessage(tab.id, msg.title, tab.url, msg.selection, msg.image);      
*/
    } else if (msg.type == "scriptReady") {
      console.log("received scriptReady");
      port.postMessage({type: "getPageData"});
    } else if (msg.type == "getPageDataResponse") {
      console.log("received getPageDataResponse");

      console.log(msg.images.length + " images, " + msg.videos.length + " videos, " + msg.quotes.length + " quotes");
      $.each(msg.videos, function() {
        addContentVideo(this);
      });
      $.each(msg.images, function() {
        addContentImage(this);
      });
      $.each(msg.quotes, function() {
        addContentQuote(this);
      });
      addContentLink({title: msg.title, url: msg.url});
    } else {
      console.log(msg);
    }
  });
});

window.addEventListener('load', main);
