function getOpt(opt){
  return (window.localStorage != null && window.localStorage.getItem(opt) != null) ? window.localStorage.getItem(opt) : "true";
}

function getPod(){
  podUrl = (window.localStorage != null && window.localStorage.podUrl != null) ? window.localStorage.podUrl : null;
  return podUrl;
}
